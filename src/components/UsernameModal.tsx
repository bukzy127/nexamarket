"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { signWalletMessage } from "@/lib/wallet";
import { TOKENS } from "@/lib/tokens";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { readableError } from "@/lib/errors";

export default function UsernameModal() {
  const wallet = useWallet();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => setDismissed(false), [wallet.address]);

  if (
    !wallet.connected ||
    !wallet.address ||
    !wallet.profileLoaded ||
    wallet.username ||
    dismissed
  ) {
    return null;
  }

  async function save() {
    if (!wallet.address) return;
    const clean = username.trim();
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(clean)) {
      setError("Use 3–24 letters, numbers, or underscores.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const message = `NexaMarket username\nWallet: ${wallet.address}\nUsername: ${clean}`;
      const signature = await signWalletMessage(message);
      const res = await fetch(
        `/api/users/${encodeURIComponent(wallet.address)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: clean, message, signature }),
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        profile?: { username?: string };
      };
      if (!res.ok || !data.profile?.username) {
        throw new Error(data.error || "Unable to save username.");
      }
      wallet.setUsername(data.profile.username);
    } catch (err) {
      setError(readableError(err, "Unable to save that username."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onClick={() => setDismissed(true)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 350,
        background: "var(--overlay)",
        backdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <Card
        style={{
          width: 430,
          maxWidth: "100%",
          padding: 32,
          position: "relative",
        }}
      >
        <button
          type="button"
          aria-label="Close username setup"
          onClick={(event) => {
            event.stopPropagation();
            setDismissed(true);
          }}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            border: "none",
            background: "transparent",
            color: TOKENS.textMuted,
            cursor: "pointer",
            padding: 4,
          }}
        >
          <Icon name="x" size={18} color="currentColor" />
        </button>
        <div onClick={(event) => event.stopPropagation()}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: TOKENS.cyanDim,
            display: "grid",
            placeItems: "center",
            marginBottom: 20,
          }}
        >
          <Icon name="user" size={24} color={TOKENS.cyan} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          Choose your username
        </h2>
        <p
          style={{
            color: TOKENS.textMuted,
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 22,
          }}
        >
          This public name replaces your wallet address across the marketplace.
          Your address still handles ownership and payments.
        </p>
        <input
          autoFocus
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void save();
          }}
          placeholder="engineering_studio"
          maxLength={24}
          style={{
            width: "100%",
            padding: "13px 15px",
            background: TOKENS.bg2,
            border: `1px solid ${error ? TOKENS.red : TOKENS.border}`,
            borderRadius: 10,
            color: TOKENS.text,
            fontFamily: "inherit",
            fontSize: 15,
            outline: "none",
            marginBottom: error ? 8 : 16,
          }}
        />
        {error && (
          <div
            style={{
              padding: "11px 13px",
              borderRadius: 10,
              background: "rgba(244,63,94,0.08)",
              border: "1px solid rgba(244,63,94,0.22)",
              color: TOKENS.red,
              fontSize: 12,
              lineHeight: 1.55,
              textAlign: "left",
              overflowWrap: "break-word",
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}
        <Btn
          onClick={() => void save()}
          disabled={saving || !username.trim()}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {saving ? "Saving..." : "Save Username"}
        </Btn>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{
            width: "100%",
            marginTop: 12,
            border: "none",
            background: "transparent",
            color: TOKENS.textMuted,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 12,
          }}
        >
          Set up later
        </button>
        </div>
      </Card>
    </div>
  );
}
