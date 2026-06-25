"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import type { Activity } from "@/types";
import { TOKENS } from "@/lib/tokens";
import Icon, { type IconName } from "@/components/ui/Icon";

const labels: Record<Activity["type"], string> = {
  upload: "Project uploaded",
  purchase: "Project purchased",
  sale: "Project sold",
  download: "Download completed",
};

const icons: Record<Activity["type"], IconName> = {
  upload: "upload",
  purchase: "check",
  sale: "trending",
  download: "download",
};

export default function NotificationCenter() {
  const wallet = useWallet();
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const storageKey = wallet.address
    ? `nexamarket:notifications-read:${wallet.address.toLowerCase()}`
    : "";
  const readAt =
    typeof window !== "undefined" && storageKey
      ? window.localStorage.getItem(storageKey)
      : null;
  const unread = useMemo(
    () =>
      activities.filter(
        (item) => !readAt || new Date(item.timestamp) > new Date(readAt),
      ).length,
    [activities, readAt],
  );

  const refresh = useCallback(async () => {
    if (!wallet.address) {
      setActivities([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard?wallet=${encodeURIComponent(wallet.address)}`,
      );
      if (res.ok) {
        const data = (await res.json()) as { activities?: Activity[] };
        setActivities(data.activities || []);
      }
    } finally {
      setLoading(false);
    }
  }, [wallet.address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      void refresh();
      if (storageKey) {
        window.localStorage.setItem(storageKey, new Date().toISOString());
      }
    }
  }

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      <button
        aria-label="Notifications"
        onClick={toggle}
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          border: `1px solid ${TOKENS.border}`,
          background: TOKENS.bg2,
          cursor: "pointer",
          color: TOKENS.textMuted,
          position: "relative",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Icon name="bell" size={18} color="currentColor" />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              minWidth: 8,
              height: 8,
              borderRadius: 20,
              background: TOKENS.cyan,
              boxShadow: "0 0 8px rgba(0,212,255,0.55)",
            }}
          />
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 46,
            right: 0,
            width: 360,
            maxWidth: "calc(100vw - 24px)",
            maxHeight: 460,
            overflowY: "auto",
            background: "var(--card)",
            border: `1px solid ${TOKENS.border}`,
            borderRadius: 16,
            boxShadow: "0 18px 50px var(--shadow)",
            padding: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 6px 12px",
            }}
          >
            <strong style={{ fontSize: 15 }}>Notifications</strong>
            <span style={{ fontSize: 11, color: TOKENS.textMuted }}>
              {wallet.username || "Connected wallet"}
            </span>
          </div>
          {!wallet.connected ? (
            <p style={{ padding: 22, textAlign: "center", color: TOKENS.textMuted }}>
              Connect your wallet to view notifications.
            </p>
          ) : loading && activities.length === 0 ? (
            <p style={{ padding: 22, textAlign: "center", color: TOKENS.textMuted }}>
              Loading…
            </p>
          ) : activities.length === 0 ? (
            <p style={{ padding: 22, textAlign: "center", color: TOKENS.textMuted }}>
              No notifications yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activities.slice(0, 30).map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: 11,
                    padding: 12,
                    borderRadius: 11,
                    background: TOKENS.bg2,
                    border: `1px solid ${TOKENS.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      flexShrink: 0,
                      borderRadius: 9,
                      background: TOKENS.cyanDim,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icon name={icons[item.type]} size={15} color={TOKENS.cyan} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {labels[item.type]}
                    </div>
                    <div
                      style={{
                        color: TOKENS.textMuted,
                        fontSize: 12,
                        marginTop: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.projectTitle || `Project #${item.projectId}`}
                      {item.amount ? ` · ${item.amount} INJ` : ""}
                    </div>
                    <div
                      style={{
                        color: TOKENS.textDim,
                        fontSize: 10,
                        marginTop: 5,
                      }}
                    >
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
