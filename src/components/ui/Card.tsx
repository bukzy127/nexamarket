"use client";

import { CSSProperties, ReactNode, useState } from "react";
import { TOKENS } from "@/lib/tokens";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  glow?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function Card({
  children,
  style,
  glow,
  hoverable,
  onClick,
  className,
}: CardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={{
        background: "var(--card)",
        border: `1px solid ${hovered && hoverable ? TOKENS.borderHover : TOKENS.border}`,
        borderRadius: 16,
        backdropFilter: "blur(12px)",
        transition: "all 0.25s ease",
        boxShadow:
          hovered && glow
            ? TOKENS.cyanGlow
            : "0 4px 24px var(--shadow)",
        cursor: onClick ? "pointer" : "default",
        transform: hovered && hoverable ? "translateY(-2px)" : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
