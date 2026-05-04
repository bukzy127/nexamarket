"use client";

import { CSSProperties, ReactNode, useState } from "react";
import { TOKENS } from "@/lib/tokens";
import Icon, { type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "green";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, CSSProperties> = {
  sm: { padding: "8px 16px", fontSize: 13 },
  md: { padding: "12px 24px", fontSize: 14 },
  lg: { padding: "16px 32px", fontSize: 16 },
};

function variantStyles(v: Variant, hovered: boolean): CSSProperties {
  switch (v) {
    case "primary":
      return {
        background: hovered
          ? "linear-gradient(135deg, #00e5ff, #0070f3)"
          : "linear-gradient(135deg, #00d4ff, #0050e6)",
        color: "#000",
        boxShadow: hovered
          ? "0 0 32px rgba(0,212,255,0.5)"
          : "0 0 16px rgba(0,212,255,0.25)",
      };
    case "secondary":
      return {
        background: hovered ? "rgba(0,212,255,0.15)" : "rgba(0,212,255,0.07)",
        color: TOKENS.cyan,
        border: `1px solid ${hovered ? TOKENS.borderHover : TOKENS.border}`,
      };
    case "ghost":
      return {
        background: "transparent",
        color: TOKENS.textMuted,
        border: "1px solid transparent",
      };
    case "danger":
      return {
        background: hovered ? "rgba(244,63,94,0.25)" : "rgba(244,63,94,0.1)",
        color: TOKENS.red,
        border: "1px solid rgba(244,63,94,0.3)",
      };
    case "green":
      return {
        background: hovered ? "rgba(16,217,126,0.2)" : "rgba(16,217,126,0.1)",
        color: TOKENS.green,
        border: "1px solid rgba(16,217,126,0.3)",
        boxShadow: hovered ? "0 0 20px rgba(16,217,126,0.2)" : "none",
      };
  }
}

interface BtnProps {
  children?: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  style?: CSSProperties;
  disabled?: boolean;
  icon?: IconName;
  type?: "button" | "submit";
  ariaLabel?: string;
}

export default function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  style,
  disabled,
  icon,
  type = "button",
  ariaLabel,
}: BtnProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        borderRadius: 10,
        border: "none",
        fontFamily: "inherit",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
        ...SIZES[size],
        ...variantStyles(variant, hovered),
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={15} color="currentColor" />}
      {children}
    </button>
  );
}
