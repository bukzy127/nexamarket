import type { CSSProperties, SVGProps } from "react";

export type IconName =
  | "home"
  | "hardhat"
  | "blueprint"
  | "building"
  | "ruler"
  | "crane"
  | "grid"
  | "upload"
  | "dashboard"
  | "wallet"
  | "search"
  | "bell"
  | "chain"
  | "star"
  | "download"
  | "arrow"
  | "shield"
  | "zap"
  | "code"
  | "check"
  | "x"
  | "eye"
  | "trending"
  | "layers"
  | "plus"
  | "settings"
  | "logout"
  | "copy"
  | "filter";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}

export default function Icon({
  name,
  size = 18,
  color = "currentColor",
  style,
  className,
}: IconProps) {
  const common: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style,
    className,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
      );
    case "hardhat":
      return (
        <svg {...common}>
          <path d="M2 18h20" />
          <path d="M12 2a9 9 0 019 9H3a9 9 0 019-9z" />
          <path d="M5 11v4a1 1 0 001 1h12a1 1 0 001-1v-4" />
        </svg>
      );
    case "blueprint":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
          <path d="M13 13h4M13 17h4" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <rect x="4" y="2" width="16" height="20" rx="1" />
          <path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
        </svg>
      );
    case "ruler":
      return (
        <svg {...common}>
          <path d="M21.3 8.7L8.7 21.3a2.4 2.4 0 01-3.4 0L2.7 18.7a2.4 2.4 0 010-3.4L15.3 2.7a2.4 2.4 0 013.4 0l2.6 2.6a2.4 2.4 0 010 3.4z" />
          <path d="M7.5 10.5l2 2M10.5 7.5l2 2M13.5 13.5l2 2" />
        </svg>
      );
    case "crane":
      return (
        <svg {...common}>
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="12" y1="4" x2="20" y2="8" />
          <line x1="17" y1="4" x2="17" y2="11" />
          <line x1="12" y1="8" x2="20" y2="8" />
          <rect x="9" y="18" width="6" height="4" rx="1" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <polyline points="16,16 12,12 8,16" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
        </svg>
      );
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="4" />
          <rect x="14" y="3" width="7" height="8" />
          <rect x="3" y="11" width="7" height="10" />
          <rect x="14" y="15" width="7" height="6" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...common}>
          <path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4" />
          <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
          <path d="M18 12a2 2 0 000 4h4v-4h-4z" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      );
    case "chain":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <polyline points="8,17 12,21 16,17" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12,5 19,12 12,19" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "zap":
      return (
        <svg {...common}>
          <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <polyline points="16,18 22,12 16,6" />
          <polyline points="8,6 2,12 8,18" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} strokeWidth={2.2}>
          <polyline points="20,6 9,17 4,12" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "trending":
      return (
        <svg {...common}>
          <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
          <polyline points="17,6 23,6 23,12" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <polygon points="12,2 2,7 12,12 22,7" />
          <polyline points="2,17 12,22 22,17" />
          <polyline points="2,12 12,17 22,12" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common} strokeWidth={2}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    case "copy":
      return (
        <svg {...common}>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
        </svg>
      );
    default:
      return null;
  }
}
