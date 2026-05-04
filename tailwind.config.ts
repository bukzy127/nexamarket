import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        nx: {
          bg0: "#04080f",
          bg1: "#080f1a",
          bg2: "#0d1625",
          bg3: "#111e33",
          bg4: "#162540",
          cyan: "#00d4ff",
          violet: "#7c3aed",
          green: "#10d97e",
          red: "#f43f5e",
          gold: "#f59e0b",
          text: "#e8f0fe",
          muted: "#6b8aad",
          dim: "#3d5a7a",
        },
      },
      fontFamily: {
        sans: ["var(--font-space)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-space)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderColor: {
        DEFAULT: "rgba(0,212,255,0.12)",
      },
      boxShadow: {
        glow: "0 0 24px rgba(0,212,255,0.3)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        spin: { to: { transform: "rotate(360deg)" } },
        pulse: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
