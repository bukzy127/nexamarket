import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/markets/inj?tf=1D|1W|1M|3M|1Y
 *
 * Returns real INJ/USD market data sourced from CoinGecko (chart, stats,
 * performance) and Binance (recent trades). Both providers serve
 * unauthenticated public endpoints.
 *
 * Caching: each upstream is fetched with `next.revalidate = 60` so a hot
 * timeframe only hits the providers once per minute.
 */

export const dynamic = "force-dynamic";

const COIN_ID = "injective-protocol";
const BINANCE_SYMBOL = "INJUSDT";

type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y";

const TF_DAYS: Record<Timeframe, number> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "1Y": 365,
};

interface Point {
  t: number;
  open: number;
  high: number;
  low: number;
  close: number;
  vol: number;
}

interface MarketChartResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface OhlcResponse extends Array<[number, number, number, number, number]> {}

interface SimplePriceResponse {
  [coinId: string]: {
    usd: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    usd_24h_change?: number;
  };
}

interface CoinDetailsResponse {
  market_cap_rank?: number;
  market_data?: {
    high_24h?: { usd?: number };
    low_24h?: { usd?: number };
    price_change_percentage_24h?: number;
    price_change_percentage_7d?: number;
    price_change_percentage_30d?: number;
    price_change_percentage_1y?: number;
  };
}

interface BinanceTrade {
  id: number;
  price: string;
  qty: string;
  time: number;
  isBuyerMaker: boolean;
}

async function fetchJson<T>(url: string, revalidate = 60): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(
      `${url.split("?")[0]} responded ${res.status} ${res.statusText}`,
    );
  }
  return (await res.json()) as T;
}

function isTimeframe(value: string | null): value is Timeframe {
  return value === "1D" || value === "1W" || value === "1M" || value === "3M" || value === "1Y";
}

/** Distribute the 24h-rolling volume series onto the OHLC time grid. */
function pickVolume(
  volumes: [number, number][],
  ts: number,
): number {
  if (!volumes.length) return 0;
  let lo = 0;
  let hi = volumes.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (volumes[mid][0] < ts) lo = mid + 1;
    else hi = mid;
  }
  return volumes[lo]?.[1] ?? volumes[volumes.length - 1][1];
}

/** Build candles directly from CoinGecko's prices array when /ohlc is unavailable. */
function pricesToOhlc(prices: [number, number][], buckets = 60): Point[] {
  if (prices.length === 0) return [];
  if (prices.length <= buckets) {
    return prices.map(([t, p], i) => ({
      t,
      open: prices[Math.max(0, i - 1)][1],
      high: p,
      low: p,
      close: p,
      vol: 0,
    }));
  }
  const size = Math.ceil(prices.length / buckets);
  const out: Point[] = [];
  for (let i = 0; i < prices.length; i += size) {
    const slice = prices.slice(i, i + size);
    const values = slice.map(([, p]) => p);
    out.push({
      t: slice[slice.length - 1][0],
      open: slice[0][1],
      close: slice[slice.length - 1][1],
      high: Math.max(...values),
      low: Math.min(...values),
      vol: 0,
    });
  }
  return out;
}

export async function GET(request: NextRequest) {
  const tfParam = request.nextUrl.searchParams.get("tf");
  const timeframe: Timeframe = isTimeframe(tfParam) ? tfParam : "1W";
  const days = TF_DAYS[timeframe];

  const marketChartUrl = `https://api.coingecko.com/api/v3/coins/${COIN_ID}/market_chart?vs_currency=usd&days=${days}`;
  const ohlcUrl = `https://api.coingecko.com/api/v3/coins/${COIN_ID}/ohlc?vs_currency=usd&days=${days}`;
  const simpleUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_ID}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;
  const detailsUrl = `https://api.coingecko.com/api/v3/coins/${COIN_ID}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`;
  const tradesUrl = `https://api.binance.com/api/v3/trades?symbol=${BINANCE_SYMBOL}&limit=10`;

  const [chartRes, ohlcRes, simpleRes, detailsRes, tradesRes] =
    await Promise.allSettled([
      fetchJson<MarketChartResponse>(marketChartUrl),
      fetchJson<OhlcResponse>(ohlcUrl),
      fetchJson<SimplePriceResponse>(simpleUrl, 30),
      fetchJson<CoinDetailsResponse>(detailsUrl, 300),
      fetchJson<BinanceTrade[]>(tradesUrl, 10),
    ]);

  if (chartRes.status === "rejected") {
    return NextResponse.json(
      { error: "Unable to load INJ market chart right now." },
      { status: 502 },
    );
  }

  const volumes = chartRes.value.total_volumes;

  let points: Point[];
  if (ohlcRes.status === "fulfilled" && ohlcRes.value.length > 0) {
    points = ohlcRes.value.map(([t, open, high, low, close]) => ({
      t,
      open,
      high,
      low,
      close,
      vol: pickVolume(volumes, t),
    }));
  } else {
    points = pricesToOhlc(chartRes.value.prices).map((p) => ({
      ...p,
      vol: pickVolume(volumes, p.t),
    }));
  }

  const simple =
    simpleRes.status === "fulfilled" ? simpleRes.value[COIN_ID] : undefined;
  const details = detailsRes.status === "fulfilled" ? detailsRes.value : undefined;

  const lastClose = points.length ? points[points.length - 1].close : 0;
  const currentPrice = simple?.usd ?? lastClose;

  const high24h = details?.market_data?.high_24h?.usd;
  const low24h = details?.market_data?.low_24h?.usd;

  const performance = {
    d1: details?.market_data?.price_change_percentage_24h ?? simple?.usd_24h_change ?? null,
    d7: details?.market_data?.price_change_percentage_7d ?? null,
    d30: details?.market_data?.price_change_percentage_30d ?? null,
    d365: details?.market_data?.price_change_percentage_1y ?? null,
  };

  let trades: { isBuy: boolean; price: number; qty: number; time: number }[] = [];
  if (tradesRes.status === "fulfilled") {
    trades = tradesRes.value.slice(-10).reverse().map((t) => ({
      isBuy: !t.isBuyerMaker,
      price: Number(t.price),
      qty: Number(t.qty),
      time: t.time,
    }));
  }

  return NextResponse.json(
    {
      timeframe,
      points,
      currentPrice,
      marketCap: simple?.usd_market_cap ?? null,
      vol24h: simple?.usd_24h_vol ?? null,
      change24h: simple?.usd_24h_change ?? performance.d1,
      high24h: high24h ?? null,
      low24h: low24h ?? null,
      rank: details?.market_cap_rank ?? null,
      performance,
      trades,
      source: {
        chart: "coingecko",
        candles: ohlcRes.status === "fulfilled" ? "coingecko-ohlc" : "derived-from-prices",
        trades: tradesRes.status === "fulfilled" ? "binance" : "unavailable",
      },
      fetchedAt: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
