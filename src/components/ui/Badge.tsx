import { CSSProperties, ReactNode } from "react";
import { BADGE_COLORS, type BadgeColor } from "@/lib/tokens";

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  style?: CSSProperties;
}

export default function Badge({ children, color = "cyan", style }: BadgeProps) {
  const c = BADGE_COLORS[color];
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        borderRadius: 6,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
