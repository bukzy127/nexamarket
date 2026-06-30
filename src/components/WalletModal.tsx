"use client";

import { useState } from "react";
import { TOKENS } from "@/lib/tokens";
import { useWallet } from "@/hooks/useWallet";
import type { WalletType } from "@/types";
import Icon from "./ui/Icon";
import { readableError } from "@/lib/errors";

interface WalletModalProps {
  onClose: () => void;
}

const WALLETS: {
  id: WalletType;
  name: string;
  desc: string;
  color: string;
}[] = [
  {
    id: "metamask",
    name: "MetaMask",
    desc: "Injective EVM Testnet",
    color: "#f6851b",
  },
];

export default function WalletModal({ onClose }: WalletModalProps) {
  const wallet = useWallet();
  const [connecting, setConnecting] = useState<WalletType | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  async function handleConnect(type: WalletType) {
    setConnecting(type);
    setConnectError(null);
    try {
      await wallet.connect(type);
      onClose();
    } catch (err) {
      setConnectError(readableError(err, "MetaMask could not be connected."));
      setConnecting(null);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--overlay)",
        backdropFilter: "blur(8px)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          border: `1px solid ${TOKENS.border}`,
          borderRadius: 20,
          padding: 36,
          width: 400,
          maxWidth: "calc(100vw - 32px)",
          animation: "fadeIn 0.25s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, color: TOKENS.text }}>
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: TOKENS.textMuted,
            }}
            aria-label="Close"
          >
            <Icon name="x" size={20} color="currentColor" />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {WALLETS.map((w) => (
            <button
              key={w.id}
              onClick={() => handleConnect(w.id)}
              disabled={!!connecting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 18px",
                background: TOKENS.bg2,
                border: `1px solid ${
                  connecting === w.id ? TOKENS.cyan : TOKENS.border
                }`,
                borderRadius: 12,
                cursor: connecting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                opacity: connecting && connecting !== w.id ? 0.5 : 1,
                transition: "all 0.2s",
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: w.color + "22",
                  border: `1px solid ${w.color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name="wallet" size={20} color={w.color} />
              </span>
              <span style={{ flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 15,
                    fontWeight: 600,
                    color: TOKENS.text,
                    marginBottom: 2,
                  }}
                >
                  {w.name}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: TOKENS.textMuted,
                  }}
                >
                  {w.desc}
                </span>
              </span>
              {connecting === w.id && (
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: `2px solid ${TOKENS.cyan}`,
                    borderTopColor: "transparent",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              )}
            </button>
          ))}
        </div>
        {connectError && (
          <div
            style={{
              marginTop: 14,
              padding: "11px 13px",
              borderRadius: 10,
              background: "rgba(244,63,94,0.08)",
              border: "1px solid rgba(244,63,94,0.22)",
              color: TOKENS.red,
              fontSize: 12,
              lineHeight: 1.55,
              textAlign: "left",
              overflowWrap: "break-word",
            }}
          >
            {connectError}
          </div>
        )}
        <p
          style={{
            marginTop: 20,
            fontSize: 12,
            color: TOKENS.textDim,
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          By connecting, you agree to the Terms of Service.
          <br />
          Your wallet is your identity — no passwords needed.
        </p>
      </div>
    </div>
  );
}
