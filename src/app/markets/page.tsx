"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TOKENS } from "@/lib/tokens";
import Card from "@/components/ui/Card";
import Btn from "@/components/ui/Btn";
import Badge from "@/components/ui/Badge";
import Icon, { type IconName } from "@/components/ui/Icon";
import { readableError } from "@/lib/errors";

type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y";
type ChartType = "line" | "candle";

interface Point {
  t: number;
  open: number;
  close: number;
  high: number;
  low: number;
  vol: number;
}

interface Trade {
  isBuy: boolean;
  price: number;
  qty: number;
  time: number;
}

interface MarketData {
  timeframe: Timeframe;
  points: Point[];
  currentPrice: number;
  marketCap: number | null;
  vol24h: number | null;
  change24h: number | null;
  high24h: number | null;
  low24h: number | null;
  rank: number | null;
  performance: {
    d1: number | null;
    d7: number | null;
    d30: number | null;
    d365: number | null;
  };
  trades: Trade[];
  fetchedAt: number;
}

const FUTURE_TOKEN_FEATURES: { icon: IconName; text: string }[] = [
  { icon: "zap", text: "Zero-fee asset purchases within NexaMarket" },
  { icon: "shield", text: "Governance voting on platform upgrades" },
  { icon: "trending", text: "Staking rewards from marketplace fees" },
  { icon: "chain", text: "Built on Injective EVM" },
];

function formatUsd(value: number, digits = 2): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatCompact(value: number | null): string {
  if (value == null) return "—";
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatPct(value: number | null): string {
  if (value == null) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export default function MarketsPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<Timeframe>("1W");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [hovered, setHovered] = useState<
    (Point & { x: number; y: number }) | null
  >(null);
  const [animProgress, setAnimProgress] = useState(0);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);

  // Fetch real market data whenever timeframe changes.
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/markets/inj?tf=${timeframe}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Upstream returned ${res.status}`);
        }
        return res.json() as Promise<MarketData>;
      })
      .then((data) => {
        setMarketData(data);
        setHovered(null);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(readableError(err, "Market data is temporarily unavailable."));
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [timeframe]);

  // Auto-refresh every 60 seconds.
  useEffect(() => {
    const id = window.setInterval(() => {
      fetch(`/api/markets/inj?tf=${timeframe}`)
        .then((res) => (res.ok ? (res.json() as Promise<MarketData>) : null))
        .then((data) => {
          if (data) setMarketData(data);
        })
        .catch(() => {
          /* silent */
        });
    }, 60_000);
    return () => window.clearInterval(id);
  }, [timeframe]);

  // Animate chart-in whenever the dataset changes.
  useEffect(() => {
    setAnimProgress(0);
    if (!marketData?.points.length) return;
    const start = Date.now();
    const duration = 900;
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setAnimProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [marketData]);

  const data = marketData?.points ?? [];

  const prices = useMemo(() => data.map((d) => d.close), [data]);
  const minP = prices.length ? Math.min(...prices) * 0.995 : 0;
  const maxP = prices.length ? Math.max(...prices) * 1.005 : 1;
  const lastClose = prices.length ? prices[prices.length - 1] : 0;
  const firstClose = prices.length ? prices[0] : 0;

  const currentPrice = marketData?.currentPrice ?? lastClose;

  // Window-based change: matches the period selected.
  const windowChangePct =
    firstClose && lastClose ? ((lastClose - firstClose) / firstClose) * 100 : 0;
  // Header change: 24h for "1D", otherwise the windowed change.
  const headerChange =
    timeframe === "1D" ? (marketData?.change24h ?? windowChangePct) : windowChangePct;
  const isUp = headerChange >= 0;

  // Chart geometry
  const W = 900;
  const H = 320;
  const PAD = { t: 20, r: 20, b: 40, l: 64 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const toX = (i: number) =>
    PAD.l + (i / Math.max(1, data.length - 1)) * chartW;
  const toY = (p: number) =>
    PAD.t + chartH - ((p - minP) / Math.max(maxP - minP, 1e-9)) * chartH;

  const visibleCount = Math.max(2, Math.floor(data.length * animProgress));
  const visibleData = data.slice(0, visibleCount);

  const linePath = visibleData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.close)}`)
    .join(" ");

  const areaPath =
    visibleData.length > 1
      ? `${linePath} L ${toX(visibleData.length - 1)} ${H - PAD.b} L ${PAD.l} ${H - PAD.b} Z`
      : "";

  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = minP + (i / yTicks) * (maxP - minP);
    return { val, y: toY(val) };
  });

  const xStep = Math.max(1, Math.floor(data.length / 6));
  const xLabels = data
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i % xStep === 0 || i === data.length - 1)
    .map(({ d, i }) => {
      const date = new Date(d.t);
      let label: string;
      if (timeframe === "1D")
        label = date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      else if (timeframe === "1W")
        label = date.toLocaleDateString([], {
          weekday: "short",
          month: "numeric",
          day: "numeric",
        });
      else
        label = date.toLocaleDateString([], { month: "short", day: "numeric" });
      return { label, x: toX(i) };
    });

  const maxVol = data.length ? Math.max(...data.map((d) => d.vol || 0), 1) : 1;
  const volH = 60;

  const periodHigh = prices.length ? Math.max(...prices) : 0;
  const periodLow = prices.length ? Math.min(...prices) : 0;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    if (timeframe === "1D")
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tokenStats: { label: string; value: string; color: string }[] = [
    {
      label: "Current Price",
      value: `$${formatUsd(currentPrice, 2)}`,
      color: isUp ? TOKENS.green : TOKENS.red,
    },
    {
      label: "24h Change",
      value: formatPct(marketData?.change24h ?? null),
      color:
        (marketData?.change24h ?? 0) >= 0 ? TOKENS.green : TOKENS.red,
    },
    {
      label: "Period High",
      value: periodHigh ? `$${formatUsd(periodHigh, 2)}` : "—",
      color: TOKENS.text,
    },
    {
      label: "Period Low",
      value: periodLow ? `$${formatUsd(periodLow, 2)}` : "—",
      color: TOKENS.text,
    },
    {
      label: "24h Volume",
      value: formatCompact(marketData?.vol24h ?? null),
      color: TOKENS.text,
    },
    {
      label: "Market Cap",
      value: formatCompact(marketData?.marketCap ?? null),
      color: TOKENS.text,
    },
    {
      label: "Rank",
      value: marketData?.rank ? `#${marketData.rank}` : "—",
      color: TOKENS.gold,
    },
    { label: "Network", value: "Injective Chain", color: TOKENS.cyan },
  ];

  const performance: { label: string; change: number | null }[] = [
    { label: "1 Day", change: marketData?.performance.d1 ?? null },
    { label: "1 Week", change: marketData?.performance.d7 ?? null },
    { label: "1 Month", change: marketData?.performance.d30 ?? null },
    { label: "1 Year", change: marketData?.performance.d365 ?? null },
  ];

  const recentTrades = marketData?.trades ?? [];

  function relativeTime(ts: number): string {
    const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: TOKENS.bg0,
        paddingTop: 64,
        color: TOKENS.text,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(180deg, ${TOKENS.bg1}, ${TOKENS.bg0})`,
          padding: "40px 32px 32px",
          borderBottom: `1px solid ${TOKENS.border}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#fff",
                      fontFamily: "var(--font-mono), monospace",
                    }}
                  >
                    I
                  </span>
                </div>
                <div>
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    INJ / USD
                  </h1>
                  <div style={{ fontSize: 13, color: TOKENS.textMuted }}>
                    Injective Protocol · Live spot data
                  </div>
                </div>
                <Badge color={error ? "red" : loading ? "gold" : "green"}>
                  {error ? "Stale" : loading ? "Loading" : "Live"}
                </Badge>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    fontFamily: "var(--font-mono), monospace",
                    color: TOKENS.text,
                  }}
                >
                  ${formatUsd(currentPrice, 2)}
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: isUp ? TOKENS.green : TOKENS.red,
                  }}
                >
                  {isUp ? "▲" : "▼"} {Math.abs(headerChange).toFixed(2)}%
                </span>
                <span style={{ fontSize: 14, color: TOKENS.textMuted }}>
                  ({timeframe})
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["1D", "1W", "1M", "3M", "1Y"] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: `1px solid ${timeframe === tf ? TOKENS.cyan : TOKENS.border}`,
                    background:
                      timeframe === tf
                        ? "rgba(0,212,255,0.12)"
                        : TOKENS.bg2,
                    color: timeframe === tf ? TOKENS.cyan : TOKENS.textMuted,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {tf}
                </button>
              ))}
              <div
                style={{
                  width: 1,
                  background: TOKENS.border,
                  margin: "0 4px",
                }}
              />
              {(["line", "candle"] as ChartType[]).map((ct) => (
                <button
                  key={ct}
                  onClick={() => setChartType(ct)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: `1px solid ${chartType === ct ? TOKENS.cyan : TOKENS.border}`,
                    background:
                      chartType === ct
                        ? "rgba(0,212,255,0.12)"
                        : TOKENS.bg2,
                    color: chartType === ct ? TOKENS.cyan : TOKENS.textMuted,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textTransform: "capitalize",
                  }}
                >
                  {ct === "line" ? "〜 Line" : "▮ Candle"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="markets-grid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: 32,
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 24,
        }}
      >
        {/* Left: chart + extras */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card style={{ padding: 24, overflow: "hidden", position: "relative" }}>
            {error && (
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: "rgba(244,63,94,0.08)",
                  border: "1px solid rgba(244,63,94,0.25)",
                  color: TOKENS.red,
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Could not load real-time INJ data
                </div>
                <div style={{ color: TOKENS.textMuted, fontSize: 12 }}>
                  {error}. Retrying in 60s.
                </div>
              </div>
            )}

            {loading && !marketData ? (
              <div
                style={{
                  height: H,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: `2px solid ${TOKENS.cyan}`,
                    borderTopColor: "transparent",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span style={{ fontSize: 12, color: TOKENS.textMuted }}>
                  Loading INJ market data…
                </span>
              </div>
            ) : (
              <>
                {hovered && (
                  <div
                    style={{
                      position: "absolute",
                      zIndex: 20,
                      background: TOKENS.bg3,
                      border: `1px solid ${TOKENS.border}`,
                      borderRadius: 10,
                      padding: "10px 14px",
                      pointerEvents: "none",
                      transform: "translateY(-110%)",
                      left: hovered.x - 60,
                      top: hovered.y,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: TOKENS.textMuted,
                        marginBottom: 4,
                      }}
                    >
                      {formatTime(hovered.t)}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: TOKENS.text,
                        fontFamily: "var(--font-mono), monospace",
                      }}
                    >
                      ${formatUsd(hovered.close, 2)}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color:
                          hovered.close >= hovered.open
                            ? TOKENS.green
                            : TOKENS.red,
                      }}
                    >
                      {hovered.close >= hovered.open ? "▲" : "▼"}{" "}
                      {Math.abs(
                        ((hovered.close - hovered.open) /
                          Math.max(hovered.open, 1e-9)) *
                          100,
                      ).toFixed(2)}
                      %
                    </div>
                  </div>
                )}

                <svg
                  width="100%"
                  viewBox={`0 0 ${W} ${H}`}
                  style={{ overflow: "visible", cursor: "crosshair" }}
                  onMouseMove={(e) => {
                    if (!data.length) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const svgX = ((e.clientX - rect.left) / rect.width) * W;
                    const idx = Math.round(
                      ((svgX - PAD.l) / chartW) * (data.length - 1),
                    );
                    if (idx >= 0 && idx < data.length) {
                      setHovered({
                        ...data[idx],
                        x: svgX,
                        y: toY(data[idx].close),
                      });
                    }
                  }}
                  onMouseLeave={() => setHovered(null)}
                >
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={isUp ? TOKENS.green : TOKENS.red}
                        stopOpacity="0.2"
                      />
                      <stop
                        offset="100%"
                        stopColor={isUp ? TOKENS.green : TOKENS.red}
                        stopOpacity="0"
                      />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop
                        offset="0%"
                        stopColor={isUp ? TOKENS.green : TOKENS.red}
                        stopOpacity="0.5"
                      />
                      <stop
                        offset="100%"
                        stopColor={isUp ? TOKENS.green : TOKENS.red}
                      />
                    </linearGradient>
                    <clipPath id="chartClip">
                      <rect x={PAD.l} y={PAD.t} width={chartW} height={chartH} />
                    </clipPath>
                  </defs>

                  {yLabels.map((l, i) => (
                    <g key={i}>
                      <line
                        x1={PAD.l}
                        y1={l.y}
                        x2={W - PAD.r}
                        y2={l.y}
                        stroke={TOKENS.border}
                        strokeWidth="1"
                      />
                      <text
                        x={PAD.l - 8}
                        y={l.y + 4}
                        fontSize="11"
                        fill={TOKENS.textDim}
                        textAnchor="end"
                        fontFamily="var(--font-mono), monospace"
                      >
                        ${l.val.toFixed(2)}
                      </text>
                    </g>
                  ))}

                  {xLabels.map((l, i) => (
                    <text
                      key={i}
                      x={l.x}
                      y={H - PAD.b + 18}
                      fontSize="10"
                      fill={TOKENS.textDim}
                      textAnchor="middle"
                      fontFamily="var(--font-mono), monospace"
                    >
                      {l.label}
                    </text>
                  ))}

                  <g clipPath="url(#chartClip)">
                    {chartType === "line" ? (
                      <>
                        {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
                        {linePath && (
                          <path
                            d={linePath}
                            fill="none"
                            stroke="url(#lineGrad)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </>
                    ) : (
                      visibleData.map((d, i) => {
                        const x = toX(i);
                        const candleW = Math.max(
                          2,
                          (chartW / data.length) * 0.6,
                        );
                        const isGreen = d.close >= d.open;
                        const color = isGreen ? TOKENS.green : TOKENS.red;
                        const bodyTop = toY(Math.max(d.open, d.close));
                        const bodyH =
                          Math.abs(toY(d.open) - toY(d.close)) || 1;
                        return (
                          <g key={i}>
                            <line
                              x1={x}
                              y1={toY(d.high)}
                              x2={x}
                              y2={toY(d.low)}
                              stroke={color}
                              strokeWidth="1"
                            />
                            <rect
                              x={x - candleW / 2}
                              y={bodyTop}
                              width={candleW}
                              height={bodyH}
                              fill={isGreen ? `${color}88` : color}
                              stroke={color}
                              strokeWidth="0.5"
                              rx="1"
                            />
                          </g>
                        );
                      })
                    )}

                    {hovered && (
                      <>
                        <line
                          x1={hovered.x}
                          y1={PAD.t}
                          x2={hovered.x}
                          y2={H - PAD.b}
                          stroke={TOKENS.cyan}
                          strokeWidth="1"
                          strokeDasharray="4 3"
                          opacity="0.5"
                        />
                        <circle
                          cx={hovered.x}
                          cy={toY(hovered.close)}
                          r="5"
                          fill={TOKENS.cyan}
                          stroke={TOKENS.bg0}
                          strokeWidth="2"
                        />
                      </>
                    )}
                  </g>

                  {prices.length > 0 && (
                    <>
                      <line
                        x1={PAD.l}
                        y1={toY(lastClose)}
                        x2={W - PAD.r}
                        y2={toY(lastClose)}
                        stroke={isUp ? TOKENS.green : TOKENS.red}
                        strokeWidth="1"
                        strokeDasharray="6 4"
                        opacity="0.6"
                      />
                      <rect
                        x={W - PAD.r}
                        y={toY(lastClose) - 10}
                        width={64}
                        height={20}
                        rx="4"
                        fill={isUp ? TOKENS.green : TOKENS.red}
                      />
                      <text
                        x={W - PAD.r + 4}
                        y={toY(lastClose) + 5}
                        fontSize="11"
                        fill="#000"
                        fontWeight="700"
                        fontFamily="var(--font-mono), monospace"
                      >
                        ${formatUsd(lastClose, 2)}
                      </text>
                    </>
                  )}
                </svg>
              </>
            )}
          </Card>

          <Card style={{ padding: "20px 24px" }}>
            <div
              style={{
                fontSize: 12,
                color: TOKENS.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              Volume
            </div>
            {data.length === 0 ? (
              <div
                style={{
                  height: volH,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: TOKENS.textDim,
                }}
              >
                No data
              </div>
            ) : (
              <svg
                width="100%"
                viewBox={`0 0 ${W} ${volH + 20}`}
                style={{ overflow: "visible" }}
              >
                {data.map((d, i) => {
                  const barW = Math.max(1, (chartW / data.length) * 0.7);
                  const barH = (d.vol / maxVol) * volH * animProgress;
                  const x = toX(i);
                  const isGreen = d.close >= d.open;
                  return (
                    <rect
                      key={i}
                      x={x - barW / 2}
                      y={volH - barH + 10}
                      width={barW}
                      height={barH}
                      fill={
                        isGreen ? `${TOKENS.green}55` : `${TOKENS.red}55`
                      }
                      rx="1"
                    />
                  );
                })}
              </svg>
            )}
          </Card>

          <Card style={{ padding: "28px 32px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f59e0b, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#fff",
                    fontFamily: "var(--font-mono), monospace",
                  }}
                >
                  N
                </span>
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <h3 style={{ fontSize: 20, fontWeight: 700 }}>NXM Token</h3>
                  <Badge color="gold">Coming Soon</Badge>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: TOKENS.textMuted,
                    marginTop: 2,
                  }}
                >
                  NXM · NexaMarket Native Token
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: 14,
                color: TOKENS.textMuted,
                lineHeight: 1.75,
                marginBottom: 24,
              }}
            >
              The native utility token for NexaMarket — powering payments,
              governance, and staking within the construction asset ecosystem.
            </p>
            <div
              className="ft-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {FUTURE_TOKEN_FEATURES.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    background: TOKENS.bg2,
                    borderRadius: 10,
                    border: `1px solid ${TOKENS.border}`,
                  }}
                >
                  <Icon name={f.icon} size={15} color={TOKENS.gold} />
                  <span style={{ fontSize: 13, color: TOKENS.textMuted }}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 20,
                padding: "14px 18px",
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: TOKENS.gold,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Expression of Interest
              </div>
              <div style={{ fontSize: 13, color: TOKENS.textMuted }}>
                The NXM token is in design phase. Token economics, vesting
                schedules, and launch timeline will be announced via the
                NexaMarket DAO governance vote.
              </div>
            </div>
          </Card>
        </div>

        {/* Right: stats + trades */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: "20px 22px" }}>
            <div
              style={{
                fontSize: 12,
                color: TOKENS.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Market Statistics
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {tokenStats.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "11px 0",
                    borderBottom:
                      i < tokenStats.length - 1
                        ? `1px solid ${TOKENS.border}`
                        : "none",
                  }}
                >
                  <span style={{ fontSize: 12, color: TOKENS.textMuted }}>
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: s.color,
                      fontFamily: "var(--font-mono), monospace",
                    }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: "20px 22px" }}>
            <div
              style={{
                fontSize: 12,
                color: TOKENS.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Price Performance
            </div>
            {performance.map((p, i) => {
              if (p.change == null) {
                return (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 12, color: TOKENS.textMuted }}>
                        {p.label}
                      </span>
                      <span style={{ fontSize: 12, color: TOKENS.textDim }}>
                        —
                      </span>
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: TOKENS.bg3,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                );
              }
              const up = p.change >= 0;
              const pct = Math.abs(p.change);
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 12, color: TOKENS.textMuted }}>
                      {p.label}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: up ? TOKENS.green : TOKENS.red,
                      }}
                    >
                      {up ? "+" : ""}
                      {p.change.toFixed(2)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: TOKENS.bg3,
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(pct * 2, 100)}%`,
                        background: up ? TOKENS.green : TOKENS.red,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>

          <Card style={{ padding: "20px 22px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: TOKENS.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                }}
              >
                Recent Trades
              </span>
              <span style={{ fontSize: 10, color: TOKENS.textDim }}>
                Binance · INJ/USDT
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                marginBottom: 8,
              }}
            >
              {["Price", "Qty", "Time"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 10,
                    color: TOKENS.textDim,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            {recentTrades.length === 0 ? (
              <div
                style={{
                  fontSize: 12,
                  color: TOKENS.textDim,
                  textAlign: "center",
                  padding: "16px 0",
                }}
              >
                No recent trades available.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {recentTrades.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      padding: "7px 0",
                      borderBottom:
                        i < recentTrades.length - 1
                          ? `1px solid ${TOKENS.border}`
                          : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: "var(--font-mono), monospace",
                        color: t.isBuy ? TOKENS.green : TOKENS.red,
                        fontWeight: 600,
                      }}
                    >
                      ${formatUsd(t.price, 2)}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: "var(--font-mono), monospace",
                        color: TOKENS.textMuted,
                      }}
                    >
                      {t.qty.toFixed(1)}
                    </span>
                    <span style={{ fontSize: 12, color: TOKENS.textDim }}>
                      {relativeTime(t.time)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card style={{ padding: "20px 22px", textAlign: "center" }}>
            <Icon name="zap" size={28} color={TOKENS.gold} />
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginTop: 12,
                marginBottom: 8,
              }}
            >
              Trade INJ on NexaMarket
            </div>
            <div
              style={{
                fontSize: 13,
                color: TOKENS.textMuted,
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              Use INJ to purchase construction assets instantly via smart
              contract.
            </div>
            <Btn
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => router.push("/marketplace")}
              icon="blueprint"
            >
              Browse Assets
            </Btn>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 980px) {
          .markets-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .ft-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
