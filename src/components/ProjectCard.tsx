"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TOKENS } from "@/lib/tokens";
import type { Project } from "@/types";
import Icon from "./ui/Icon";
import Badge from "./ui/Badge";

interface ProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const router = useRouter();
  const [hov, setHov] = useState(false);

  function handleClick() {
    if (onClick) onClick(project);
    else router.push(`/project/${project.id}`);
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:
          "linear-gradient(135deg, rgba(13,22,37,0.95), rgba(8,15,26,0.98))",
        border: `1px solid ${hov ? TOKENS.borderHover : TOKENS.border}`,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.25s ease",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov
          ? "0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,212,255,0.08)"
          : "0 4px 16px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          height: 140,
          background: project.preview,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.03) 19px, rgba(255,255,255,0.03) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.03) 19px, rgba(255,255,255,0.03) 20px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: "rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Icon name="blueprint" size={22} color="rgba(255,255,255,0.6)" />
          </div>
        </div>
        {project.featured && (
          <div style={{ position: "absolute", top: 12, left: 12 }}>
            <Badge color="gold">Featured</Badge>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 13,
            fontWeight: 700,
            color: TOKENS.cyan,
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          {project.price} INJ
        </div>
      </div>

      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ marginBottom: 8 }}>
          <span
            style={{
              fontSize: 10,
              color: TOKENS.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
            }}
          >
            {project.category}
          </span>
        </div>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            marginBottom: 8,
            lineHeight: 1.3,
            color: TOKENS.text,
          }}
        >
          {project.title}
        </h3>
        <p
          style={{
            fontSize: 12,
            color: TOKENS.textMuted,
            lineHeight: 1.6,
            marginBottom: 14,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description}
        </p>

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {project.tags.map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: 10,
                padding: "3px 8px",
                borderRadius: 5,
                background: "rgba(0,212,255,0.07)",
                color: TOKENS.textMuted,
                border: `1px solid ${TOKENS.border}`,
                fontWeight: 500,
                fontFamily: "var(--font-mono), monospace",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 14,
            borderTop: `1px solid ${TOKENS.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00d4ff44, #7c3aed44)",
                border: `1px solid ${TOKENS.border}`,
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: TOKENS.textMuted,
                fontFamily: "var(--font-mono), monospace",
              }}
            >
              {project.owner}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="star" size={12} color={TOKENS.gold} />
              <span
                style={{ fontSize: 12, fontWeight: 600, color: TOKENS.text }}
              >
                {project.rating}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="download" size={12} color={TOKENS.textDim} />
              <span style={{ fontSize: 12, color: TOKENS.textMuted }}>
                {project.sales}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
