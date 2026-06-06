"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TOKENS } from "@/lib/tokens";
import Card from "@/components/ui/Card";
import Btn from "@/components/ui/Btn";
import Badge from "@/components/ui/Badge";
import Icon, { type IconName } from "@/components/ui/Icon";

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

const TF_CONFIG: Record<
  Timeframe,
  { points: number; base: number; volatility: number; intervalMs: number }
> = {
  "1D": { points: 48, base: 22.4, volatility: 0.8, intervalMs: 30 * 60_000 },
  "1W": { points: 84, base: 21.8, volatility: 2.1, intervalMs: 2 * 3_600_000 },
  "1M": { points: 90, base: 19.5, volatility: 4.2, intervalMs: 8 * 3_600_000 },
  "3M": { points: 90, base: 17.2, volatility: 6.8, intervalMs: 86_400_000 },
  "1Y": { points: 104, base: 14.0, volatility: 9.4, intervalMs: 3 * 86_400_000 },
};

function generateData(tf: Timeframe): Point[] {
  const cfg = TF_CONFIG[tf];
  let price = cfg.base;
  const data: Point[] = [];
  const now = Date.now();
  for (let i = cfg.points; i >= 0; i--) {
    const drift = (Math.random() - 0.46) * cfg.volatility * 0.15;
    price = Math.max(price + drift, 2);
    const open = price;
    const close = price + (Math.random() - 0.48) * cfg.volatility * 0.1;
    const high = Math.max(open, close) + Math.random() * cfg.volatility * 0.08;
    const low = Math.min(open, close) - Math.random() * cfg.volatility * 0.08;
    const vol = Math.floor(80_000 + Math.random() * 400_000);
    data.push({ t: now - i * cfg.intervalMs, open, close, high, low, vol });
  }
  return data;
}

const FUTURE_TOKEN_FEATURES: { icon: IconName; text: string }[] = [
  { icon: "zap", text: "Zero-fee asset purchases within NexaMarket" },
  { icon: "shield", text: "Governance voting on platform upgrades" },
  { icon: "trending", text: "Staking rewards from marketplace fees" },
  { icon: "chain", text: "Built on Injective CosmWasm" },
];

export default function MarketsPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<Timeframe>("1W");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [hovered, setHovered] = useState<
    (Point & { x: number; y: number }) | null
  >(null);
  const [animProgress, setAnimProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  const data = useMemo(() => generateData(timeframe), [timeframe]);

  useEffect(() => {
    setAnimProgress(0);
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
  }, [timeframe]);

  const prices = data.map((d) => d.close);
  const minP = Math.min(...prices) * 0.995;
  const maxP = Math.max(...prices) * 1.005;
  const currentPrice = prices[prices.length - 1];
  const openPrice = prices[0];
  const pctChange = ((currentPrice - openPrice) / openPrice) * 100;
  const isUp = pctChange >= 0;

  // Chart geometry
  const W = 900;
  const H = 320;
  const PAD = { t: 20, r: 20, b: 40, l: 64 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const toX = (i: number) =>
    PAD.l + (i / Math.max(1, data.length - 1)) * chartW;
  const toY = (p: number) =>
    PAD.t + chartH - ((p - minP) / (maxP - minP)) * chartH;

  const visibleCount = Math.max(2, Math.floor(data.length * animProgress));
  const visibleData = data.slice(0, visibleCount);

  const linePath = visibleData
    .map((d, i) => {
      const x = toX(i);
      const y = toY(d.close);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
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

  const maxVol = Math.max(...data.map((d) => d.vol));
  const volH = 60;

  const high = Math.max(...prices).toFixed(2);
  const low = Math.min(...prices).toFixed(2);
  const totalVol = data.reduce((s, d) => s + d.vol, 0);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    if (timeframe === "1D")
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
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
      value: `$${currentPrice.toFixed(2)}`,
      color: isUp ? TOKENS.green : TOKENS.red,
    },
    {
      label: "Change",
      value: `${isUp ? "+" : ""}${pctChange.toFixed(2)}%`,
      color: isUp ? TOKENS.green : TOKENS.red,
    },
    { label: "Period High", value: `$${high}`, color: TOKENS.text },
    { label: "Period Low", value: `$${low}`, color: TOKENS.text },
    {
      label: "Volume",
      value: `${(totalVol / 1e6).toFixed(2)}M INJ`,
      color: TOKENS.text,
    },
    {
      label: "Market Cap",
      value: `$${((currentPrice * 934_000_000) / 1e9).toFixed(2)}B`,
      color: TOKENS.text,
    },
    { label: "Rank", value: "#47", color: TOKENS.gold },
    { label: "Network", value: "Injective Chain", color: TOKENS.cyan },
  ];

  const recentTrades = useMemo(
    () =>
      Array.from({ length: 8 }, () => {
        const isBuy = Math.random() > 0.45;
        const price = (currentPrice + (Math.random() - 0.5) * 0.3).toFixed(2);
        const qty = (Math.random() * 800 + 50).toFixed(1);
        const ago = Math.floor(Math.random() * 120);
        return { isBuy, price, qty, ago };
      }),
    [currentPrice],
  );

  const performance = useMemo(
    () => [
      { label: "1 Day", change: (Math.random() * 6 - 2).toFixed(2) },
      { label: "1 Week", change: (Math.random() * 12 - 3).toFixed(2) },
      { label: "1 Month", change: (Math.random() * 30 - 5).toFixed(2) },
      { label: "1 Year", change: (Math.random() * 80 - 10).toFixed(2) },
    ],
    [timeframe],  // eslint-disable-line react-hooks/exhaustive-deps
  );

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
                    background:
                      "linear-gradient(135deg, #00d4ff, #7c3aed)",
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
                    Injective Protocol · Injective Chain
                  </div>
                </div>
                <Badge color="green">Live</Badge>
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
                  ${currentPrice.toFixed(2)}
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: isUp ? TOKENS.green : TOKENS.red,
                  }}
                >
                  {isUp ? "▲" : "▼"} {Math.abs(pctChange).toFixed(2)}%
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
                  ${hovered.close.toFixed(2)}
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
                    ((hovered.close - hovered.open) / hovered.open) * 100,
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
                const rect = e.currentTarget.getBoundingClientRect();
                const svgX = ((e.clientX - rect.left) / rect.width) * W;
                const idx = Math.round(((svgX - PAD.l) / chartW) * (data.length - 1));
                if (idx >= 0 && idx < data.length) {
                  setHovered({ ...data[idx], x: svgX, y: toY(data[idx].close) });
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
                    ${l.val.toFixed(1)}
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
                    const candleW = Math.max(2, (chartW / data.length) * 0.6);
                    const isGreen = d.close >= d.open;
                    const color = isGreen ? TOKENS.green : TOKENS.red;
                    const bodyTop = toY(Math.max(d.open, d.close));
                    const bodyH = Math.abs(toY(d.open) - toY(d.close)) || 1;
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

              <line
                x1={PAD.l}
                y1={toY(currentPrice)}
                x2={W - PAD.r}
                y2={toY(currentPrice)}
                stroke={isUp ? TOKENS.green : TOKENS.red}
                strokeWidth="1"
                strokeDasharray="6 4"
                opacity="0.6"
              />
              <rect
                x={W - PAD.r}
                y={toY(currentPrice) - 10}
                width={58}
                height={20}
                rx="4"
                fill={isUp ? TOKENS.green : TOKENS.red}
              />
              <text
                x={W - PAD.r + 4}
                y={toY(currentPrice) + 5}
                fontSize="11"
                fill="#000"
                fontWeight="700"
                fontFamily="var(--font-mono), monospace"
              >
                ${currentPrice.toFixed(2)}
              </text>
            </svg>
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
                    fill={isGreen ? `${TOKENS.green}55` : `${TOKENS.red}55`}
                    rx="1"
                  />
                );
              })}
            </svg>
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
                  background:
                    "linear-gradient(135deg, #f59e0b, #7c3aed)",
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
              const up = parseFloat(p.change) >= 0;
              const pct = Math.abs(parseFloat(p.change));
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
                      {p.change}%
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
                fontSize: 12,
                color: TOKENS.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Recent Trades
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
                    ${t.price}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "var(--font-mono), monospace",
                      color: TOKENS.textMuted,
                    }}
                  >
                    {t.qty}
                  </span>
                  <span style={{ fontSize: 12, color: TOKENS.textDim }}>
                    {t.ago}s ago
                  </span>
                </div>
              ))}
            </div>
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
