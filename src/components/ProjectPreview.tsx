"use client";

import { CSSProperties, ReactNode } from "react";
import type { Project } from "@/types";
import Icon from "@/components/ui/Icon";

function isImageUrl(value: string | undefined): boolean {
  return Boolean(value && /^https?:\/\//i.test(value));
}

export default function ProjectPreview({
  project,
  style,
  showFallbackIcon = true,
  children,
}: {
  project: Pick<Project, "preview" | "previewImages" | "title">;
  style?: CSSProperties;
  showFallbackIcon?: boolean;
  children?: ReactNode;
}) {
  const image = project.previewImages?.[0] || project.preview;
  const hasImage = isImageUrl(image);

  return (
    <div
      role="img"
      aria-label={`${project.title} preview`}
      style={{
        background: hasImage ? undefined : project.preview,
        backgroundImage: hasImage ? `url("${image}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {!hasImage && showFallbackIcon && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon name="blueprint" size={24} color="rgba(255,255,255,0.65)" />
        </div>
      )}
      {children}
    </div>
  );
}
