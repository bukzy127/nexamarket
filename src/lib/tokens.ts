/**
 * Design tokens — sourced from the Claude-design NexaMarket prototype.
 * Dark navy + cyan/violet palette tuned for the construction asset marketplace.
 */
export const TOKENS = {
  bg0: "#04080f",
  bg1: "#080f1a",
  bg2: "#0d1625",
  bg3: "#111e33",
  bg4: "#162540",

  border: "rgba(0,212,255,0.12)",
  borderHover: "rgba(0,212,255,0.35)",

  cyan: "#00d4ff",
  cyanDim: "rgba(0,212,255,0.15)",
  cyanGlow: "0 0 24px rgba(0,212,255,0.3)",

  blue: "#3b82f6",
  blueDim: "rgba(59,130,246,0.15)",

  violet: "#7c3aed",
  green: "#10d97e",
  greenDim: "rgba(16,217,126,0.15)",
  red: "#f43f5e",
  gold: "#f59e0b",
  goldDim: "rgba(245,158,11,0.15)",

  text: "#e8f0fe",
  textMuted: "#6b8aad",
  textDim: "#3d5a7a",
} as const;

export type BadgeColor =
  | "cyan"
  | "green"
  | "gold"
  | "violet"
  | "red"
  | "blue";

export const BADGE_COLORS: Record<
  BadgeColor,
  { bg: string; color: string; border: string }
> = {
  cyan: { bg: "rgba(0,212,255,0.1)", color: TOKENS.cyan, border: "rgba(0,212,255,0.25)" },
  green: { bg: "rgba(16,217,126,0.1)", color: TOKENS.green, border: "rgba(16,217,126,0.25)" },
  gold: { bg: "rgba(245,158,11,0.1)", color: TOKENS.gold, border: "rgba(245,158,11,0.25)" },
  violet: { bg: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "rgba(124,58,237,0.25)" },
  red: { bg: "rgba(244,63,94,0.1)", color: TOKENS.red, border: "rgba(244,63,94,0.25)" },
  blue: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.25)" },
};

export const fmtINJ = (n: number | string): string => `${n} INJ`;
