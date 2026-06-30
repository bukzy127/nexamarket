"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { TOKENS } from "@/lib/tokens";
import { useWallet } from "@/hooks/useWallet";
import { useWalletModal } from "./WalletModalProvider";
import Icon, { type IconName } from "./ui/Icon";
import Btn from "./ui/Btn";
import { shortAddress } from "@/lib/wallet";
import { useTheme } from "@/components/ThemeProvider";
import NotificationCenter from "@/components/NotificationCenter";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/marketplace", label: "Marketplace", icon: "grid" },
  { href: "/markets", label: "Markets", icon: "trending" },
  { href: "/upload", label: "List Asset", icon: "upload" },
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
];

function ThemeToggle() {
  const [hov, setHov] = useState(false);
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        border: `1px solid ${hov ? TOKENS.borderHover : TOKENS.border}`,
        background: hov ? TOKENS.cyanDim : TOKENS.bg2,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        flexShrink: 0,
      }}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size={17} color={TOKENS.cyan} />
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const wallet = useWallet();
  const { open: openWallet } = useWalletModal();
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        background: "var(--nav)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${TOKENS.border}`,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #00d4ff, #0050e6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="building" size={17} color="#000" />
        </div>
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: TOKENS.text,
            letterSpacing: "-0.02em",
          }}
        >
          NexaMarket
        </span>
      </Link>

      {/* Nav items (desktop) */}
      <div className="hidden md:flex" style={{ gap: 4, alignItems: "center" }}>
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                background: active ? "rgba(0,212,255,0.1)" : "transparent",
                color: active ? TOKENS.cyan : TOKENS.textMuted,
                fontSize: 14,
                fontWeight: 500,
                transition: "all 0.15s ease",
              }}
            >
              <Icon name={item.icon} size={15} color="currentColor" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <NotificationCenter />

        <ThemeToggle />

        {wallet.connected ? (
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 10,
              border: `1px solid ${TOKENS.border}`,
              background: "rgba(0,212,255,0.07)",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: TOKENS.cyan,
                fontFamily: "var(--font-mono), JetBrains Mono, monospace",
              }}
            >
              {wallet.username || shortAddress(wallet.address)}
            </span>
          </button>
        ) : (
          <Btn onClick={openWallet} size="sm" icon="wallet">
            Connect Wallet
          </Btn>
        )}

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden"
          style={{
            display: "grid",
            placeItems: "center",
            width: 40,
            height: 40,
            borderRadius: 10,
            border: `1px solid ${TOKENS.border}`,
            background: TOKENS.bg2,
            cursor: "pointer",
            color: TOKENS.text,
          }}
        >
          <Icon name={open ? "x" : "grid"} size={18} color="currentColor" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden"
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            background: "var(--nav-solid)",
            borderBottom: `1px solid ${TOKENS.border}`,
            backdropFilter: "blur(20px)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 10,
                border: `1px solid ${TOKENS.border}`,
                background: TOKENS.bg2,
                color: TOKENS.text,
                fontSize: 14,
              }}
            >
              <Icon name={item.icon} size={16} color={TOKENS.cyan} />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
