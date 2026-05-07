"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { TOKENS } from "@/lib/tokens";
import { useWallet } from "@/hooks/useWallet";
import { useWalletModal } from "@/components/WalletModalProvider";
import { useProjectCatalog } from "@/hooks/useProjectCatalog";
import { shortAddress } from "@/lib/wallet";
import Card from "@/components/ui/Card";
import Btn from "@/components/ui/Btn";
import Badge from "@/components/ui/Badge";
import Icon, { type IconName } from "@/components/ui/Icon";

type Section = "overview" | "owned" | "sales" | "history" | "wallet";

const SECTIONS: { id: Section; label: string; icon: IconName }[] = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "owned", label: "Owned Assets", icon: "blueprint" },
  { id: "sales", label: "My Listings", icon: "trending" },
  { id: "history", label: "Transactions", icon: "chain" },
  { id: "wallet", label: "Wallet", icon: "wallet" },
];

const TX_HISTORY = [
  {
    type: "purchase" as const,
    title: "High-Rise Tower Blueprint Set",
    amount: "-28.0 INJ",
    date: "May 1, 2026",
    status: "confirmed",
    tx: "0xf2a1...3b9c",
  },
  {
    type: "sale" as const,
    title: "Site Safety Management Plan",
    amount: "+5.5 INJ",
    date: "Apr 28, 2026",
    status: "confirmed",
    tx: "0x9d3f...1a2b",
  },
  {
    type: "purchase" as const,
    title: "MEP Full Design Package",
    amount: "-62.0 INJ",
    date: "Apr 22, 2026",
    status: "confirmed",
    tx: "0xa7b2...4d1e",
  },
  {
    type: "sale" as const,
    title: "Facade Engineering Spec Pack",
    amount: "+16.5 INJ",
    date: "Apr 15, 2026",
    status: "confirmed",
    tx: "0x1c8d...7f3a",
  },
  {
    type: "purchase" as const,
    title: "Steel Connection Detail Library",
    amount: "-22.0 INJ",
    date: "Mar 30, 2026",
    status: "confirmed",
    tx: "0x5e2f...8c9b",
  },
];

const MY_LISTINGS = [
  { title: "Site Safety Management Plan", price: 5.5, sales: 12, status: "active" as const },
  { title: "Facade Engineering Spec Pack", price: 16.5, sales: 8, status: "active" as const },
  { title: "BOQ Template — Residential", price: 9.5, sales: 15, status: "active" as const },
  { title: "RC Slab Design Calculations", price: 12.0, sales: 4, status: "active" as const },
  { title: "Landscape Design Package", price: 7.5, sales: 2, status: "draft" as const },
  { title: "Fire Safety Strategy Report", price: 8.0, sales: 0, status: "draft" as const },
];

export default function DashboardPage() {
  const wallet = useWallet();
  const { open: openWallet } = useWalletModal();
  const { ownedProjects } = useProjectCatalog(wallet.address);
  const router = useRouter();
  const [active, setActive] = useState<Section>("overview");

  if (!wallet.connected) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: TOKENS.bg0,
          paddingTop: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Card
          style={{
            padding: "56px 48px",
            textAlign: "center",
            maxWidth: 420,
            width: "100%",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(0,212,255,0.1)",
              border: `1px solid ${TOKENS.border}`,
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="wallet" size={32} color={TOKENS.cyan} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            Connect your wallet
          </h2>
          <p
            style={{
              color: TOKENS.textMuted,
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            Connect your Keplr, Leap, or MetaMask wallet to view your
            dashboard, owned projects, and transaction history.
          </p>
          <Btn
            size="lg"
            onClick={openWallet}
            icon="wallet"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Connect Wallet
          </Btn>
        </Card>
      </div>
    );
  }

  const owned = ownedProjects;
  const balance = wallet.balance ?? "142.6";
  const balanceUsd = (parseFloat(balance) * 22.4).toFixed(2);

  function copyAddress() {
    if (wallet.address) {
      void navigator.clipboard.writeText(wallet.address);
      toast.success("Address copied");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: TOKENS.bg0,
        paddingTop: 64,
        display: "flex",
      }}
      className="dash-root"
    >
      {/* Sidebar */}
      <aside
        className="dash-sidebar"
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: `1px solid ${TOKENS.border}`,
          padding: "32px 16px",
          position: "sticky",
          top: 64,
          height: "calc(100vh - 64px)",
          overflowY: "auto",
          background: TOKENS.bg1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 28,
            paddingBottom: 24,
            borderBottom: `1px solid ${TOKENS.border}`,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="wallet" size={24} color="#fff" />
          </div>
          <div
            style={{
              fontSize: 12,
              color: TOKENS.textMuted,
              fontFamily: "var(--font-mono), monospace",
              wordBreak: "break-all",
              lineHeight: 1.5,
            }}
          >
            {shortAddress(wallet.address)}
          </div>
          <div style={{ marginTop: 8 }}>
            <Badge color="green">Verified</Badge>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                background:
                  active === s.id ? "rgba(0,212,255,0.1)" : "transparent",
                color: active === s.id ? TOKENS.cyan : TOKENS.textMuted,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <Icon name={s.icon} size={15} color="currentColor" />
              {s.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: "auto", paddingTop: 24 }}>
          <button
            onClick={() => {
              wallet.disconnect();
              toast.success("Wallet disconnected");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              color: TOKENS.textDim,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              width: "100%",
            }}
          >
            <Icon name="logout" size={14} color="currentColor" />
            Disconnect
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        style={{
          flex: 1,
          padding: "40px",
          overflowY: "auto",
          minHeight: 0,
        }}
        className="dash-main"
      >
        {active === "overview" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  marginBottom: 6,
                }}
              >
                Dashboard
              </h1>
              <p style={{ color: TOKENS.textMuted, fontSize: 14 }}>
                Welcome back,{" "}
                <span
                  style={{
                    color: TOKENS.cyan,
                    fontFamily: "var(--font-mono), monospace",
                  }}
                >
                  {shortAddress(wallet.address)}
                </span>
              </p>
            </div>

            {/* Hero balance */}
            <div
              style={{
                marginBottom: 24,
                padding: "28px 32px",
                background:
                  "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))",
                border: "1px solid rgba(0,212,255,0.2)",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: TOKENS.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Wallet Balance
                </div>
                <div
                  style={{
                    fontSize: 52,
                    fontWeight: 800,
                    fontFamily: "var(--font-mono), monospace",
                    color: TOKENS.cyan,
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {balance}{" "}
                  <span style={{ fontSize: 24, color: TOKENS.textMuted }}>
                    INJ
                  </span>
                </div>
                <div style={{ fontSize: 16, color: TOKENS.textMuted }}>
                  ≈ ${balanceUsd} USD &nbsp;
                  <span
                    style={{
                      color: TOKENS.green,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    ↑ +12.4 INJ this month
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Btn icon="upload" onClick={() => setActive("wallet")}>
                  Send INJ
                </Btn>
                <Btn
                  variant="secondary"
                  icon="download"
                  onClick={() => setActive("wallet")}
                >
                  Receive
                </Btn>
                <Btn
                  variant="secondary"
                  icon="trending"
                  onClick={() => router.push("/markets")}
                >
                  Markets
                </Btn>
              </div>
            </div>

            {/* Stats grid */}
            <div
              className="three-col"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 16,
                marginBottom: 32,
              }}
            >
              <Card
                style={{
                  padding: 24,
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(13,22,37,0.9))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: TOKENS.textMuted,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Assets Owned
                  </span>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(124,58,237,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="blueprint" size={16} color="#a78bfa" />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: TOKENS.text,
                    marginBottom: 6,
                  }}
                >
                  {owned.length}
                </div>
                <div style={{ fontSize: 12, color: TOKENS.textMuted }}>
                  Construction asset packages
                </div>
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: `1px solid ${TOKENS.border}`,
                  }}
                >
                  <button
                    onClick={() => setActive("owned")}
                    style={{
                      fontSize: 12,
                      color: "#a78bfa",
                      cursor: "pointer",
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      fontFamily: "inherit",
                    }}
                  >
                    View all assets →
                  </button>
                </div>
              </Card>

              <Card
                style={{
                  padding: 24,
                  background:
                    "linear-gradient(135deg, rgba(16,217,126,0.08), rgba(13,22,37,0.9))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: TOKENS.textMuted,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Sales Revenue
                  </span>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(16,217,126,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="trending" size={16} color={TOKENS.green} />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: TOKENS.text,
                    marginBottom: 6,
                  }}
                >
                  74.5{" "}
                  <span style={{ fontSize: 18, color: TOKENS.textMuted }}>
                    INJ
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: TOKENS.green,
                    fontWeight: 600,
                  }}
                >
                  ↑ +18.2 INJ this month
                </div>
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: `1px solid ${TOKENS.border}`,
                  }}
                >
                  <button
                    onClick={() => setActive("sales")}
                    style={{
                      fontSize: 12,
                      color: TOKENS.green,
                      cursor: "pointer",
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      fontFamily: "inherit",
                    }}
                  >
                    View listings →
                  </button>
                </div>
              </Card>

              <Card
                style={{
                  padding: 24,
                  background:
                    "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(13,22,37,0.9))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: TOKENS.textMuted,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Purchase History
                  </span>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(245,158,11,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="chain" size={16} color={TOKENS.gold} />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: TOKENS.text,
                    marginBottom: 6,
                  }}
                >
                  12{" "}
                  <span style={{ fontSize: 18, color: TOKENS.textMuted }}>
                    txns
                  </span>
                </div>
                <div style={{ fontSize: 12, color: TOKENS.textMuted }}>
                  Total spent:{" "}
                  <span style={{ color: TOKENS.gold, fontWeight: 600 }}>
                    112 INJ
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: `1px solid ${TOKENS.border}`,
                  }}
                >
                  <button
                    onClick={() => setActive("history")}
                    style={{
                      fontSize: 12,
                      color: TOKENS.gold,
                      cursor: "pointer",
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      fontFamily: "inherit",
                    }}
                  >
                    Full history →
                  </button>
                </div>
              </Card>
            </div>

            <div
              className="two-col"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              <Card style={{ padding: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>
                    Recent Transactions
                  </h3>
                  <button
                    onClick={() => setActive("history")}
                    style={{
                      fontSize: 12,
                      color: TOKENS.cyan,
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      fontFamily: "inherit",
                    }}
                  >
                    View all →
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {TX_HISTORY.slice(0, 4).map((tx, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 0",
                        borderBottom:
                          i < 3 ? `1px solid ${TOKENS.border}` : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background:
                            tx.type === "purchase"
                              ? "rgba(244,63,94,0.1)"
                              : "rgba(16,217,126,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          name={tx.type === "purchase" ? "download" : "upload"}
                          size={15}
                          color={
                            tx.type === "purchase" ? TOKENS.red : TOKENS.green
                          }
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tx.title}
                        </div>
                        <div style={{ fontSize: 11, color: TOKENS.textDim }}>
                          {tx.date}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: "var(--font-mono), monospace",
                          color: tx.type === "sale" ? TOKENS.green : TOKENS.red,
                          flexShrink: 0,
                        }}
                      >
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card style={{ padding: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>
                    Owned Projects
                  </h3>
                  <button
                    onClick={() => setActive("owned")}
                    style={{
                      fontSize: 12,
                      color: TOKENS.cyan,
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      fontFamily: "inherit",
                    }}
                  >
                    View all →
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {owned.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => router.push(`/project/${p.id}`)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: TOKENS.bg2,
                        border: `1px solid ${TOKENS.border}`,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: p.preview,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.title}
                        </div>
                        <div
                          style={{ fontSize: 11, color: TOKENS.textMuted }}
                        >
                          {p.category}
                        </div>
                      </div>
                      <Btn
                        variant="ghost"
                        size="sm"
                        icon="download"
                        style={{ padding: "6px 8px" }}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {active === "owned" && (
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: 28,
              }}
            >
              Owned Assets
            </h1>
            <div
              className="three-col"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 20,
              }}
            >
              {owned.map((p) => (
                <Card key={p.id} hoverable style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      height: 100,
                      background: p.preview,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                          "linear-gradient(135deg, rgba(255,255,255,0.03) 25%, transparent 25%)",
                        backgroundSize: "16px 16px",
                      }}
                    />
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: TOKENS.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 6,
                      }}
                    >
                      {p.category}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        marginBottom: 12,
                      }}
                    >
                      {p.title}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn
                        variant="green"
                        size="sm"
                        icon="download"
                        style={{ flex: 1, justifyContent: "center" }}
                      >
                        Download
                      </Btn>
                      <Btn
                        variant="secondary"
                        size="sm"
                        icon="trending"
                        style={{ flex: 1, justifyContent: "center" }}
                      >
                        Resell
                      </Btn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {active === "sales" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 28,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                My Listings
              </h1>
              <Btn onClick={() => router.push("/upload")} icon="plus">
                New Listing
              </Btn>
            </div>
            <Card style={{ overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: TOKENS.bg2 }}>
                      {["Project", "Price", "Sales", "Revenue", "Status", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "14px 20px",
                              textAlign: "left",
                              fontSize: 11,
                              color: TOKENS.textMuted,
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              borderBottom: `1px solid ${TOKENS.border}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {MY_LISTINGS.map((l, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom:
                            i < MY_LISTINGS.length - 1
                              ? `1px solid ${TOKENS.border}`
                              : "none",
                        }}
                      >
                        <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 600 }}>
                          {l.title}
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            fontSize: 13,
                            fontFamily: "var(--font-mono), monospace",
                            color: TOKENS.cyan,
                          }}
                        >
                          {l.price} INJ
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            fontSize: 13,
                            color: TOKENS.textMuted,
                          }}
                        >
                          {l.sales}
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            fontSize: 13,
                            fontFamily: "var(--font-mono), monospace",
                            color: TOKENS.green,
                          }}
                        >
                          +{(l.price * l.sales).toFixed(1)} INJ
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <Badge color={l.status === "active" ? "green" : "gold"}>
                            {l.status}
                          </Badge>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Btn variant="ghost" size="sm">
                              Edit
                            </Btn>
                            <Btn variant="danger" size="sm">
                              Remove
                            </Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {active === "history" && (
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: 28,
              }}
            >
              Transaction History
            </h1>
            <Card style={{ overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: TOKENS.bg2 }}>
                      {["Type", "Project", "Amount", "Date", "Tx Hash", "Status"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "14px 20px",
                              textAlign: "left",
                              fontSize: 11,
                              color: TOKENS.textMuted,
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              borderBottom: `1px solid ${TOKENS.border}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {TX_HISTORY.map((tx, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom:
                            i < TX_HISTORY.length - 1
                              ? `1px solid ${TOKENS.border}`
                              : "none",
                        }}
                      >
                        <td style={{ padding: "16px 20px" }}>
                          <Badge color={tx.type === "sale" ? "green" : "red"}>
                            {tx.type}
                          </Badge>
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {tx.title}
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            fontSize: 13,
                            fontFamily: "var(--font-mono), monospace",
                            color: tx.type === "sale" ? TOKENS.green : TOKENS.red,
                            fontWeight: 700,
                          }}
                        >
                          {tx.amount}
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            fontSize: 13,
                            color: TOKENS.textMuted,
                          }}
                        >
                          {tx.date}
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            fontSize: 12,
                            fontFamily: "var(--font-mono), monospace",
                            color: TOKENS.textDim,
                          }}
                        >
                          {tx.tx}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <Badge color="green">{tx.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {active === "wallet" && (
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: 28,
              }}
            >
              Wallet
            </h1>
            <div
              className="two-col"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              <Card style={{ padding: 32 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: TOKENS.textMuted,
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                  }}
                >
                  INJ Balance
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    fontFamily: "var(--font-mono), monospace",
                    color: TOKENS.cyan,
                    marginBottom: 4,
                  }}
                >
                  {balance}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: TOKENS.textMuted,
                    marginBottom: 28,
                  }}
                >
                  INJ ≈ ${balanceUsd} USD
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <Btn
                    icon="upload"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Send
                  </Btn>
                  <Btn
                    variant="secondary"
                    icon="download"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Receive
                  </Btn>
                </div>
              </Card>

              <Card style={{ padding: 32 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: TOKENS.textMuted,
                    marginBottom: 20,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                  }}
                >
                  Wallet Address
                </div>
                <div
                  style={{
                    padding: "14px 16px",
                    background: TOKENS.bg2,
                    borderRadius: 10,
                    border: `1px solid ${TOKENS.border}`,
                    fontSize: 13,
                    fontFamily: "var(--font-mono), monospace",
                    color: TOKENS.text,
                    wordBreak: "break-all",
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  {wallet.address}
                </div>
                <Btn
                  variant="secondary"
                  icon="copy"
                  size="sm"
                  onClick={copyAddress}
                >
                  Copy Address
                </Btn>
              </Card>

              <Card style={{ padding: 24, gridColumn: "1 / -1" }}>
                <div
                  style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}
                >
                  Connected Wallets
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: 16,
                    background: TOKENS.bg2,
                    borderRadius: 12,
                    border: `1px solid ${TOKENS.borderHover}`,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background:
                        "linear-gradient(135deg, #00d4ff, #7c3aed)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="wallet" size={18} color="#fff" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 3,
                      }}
                    >
                      {wallet.type
                        ? `${wallet.type[0].toUpperCase()}${wallet.type.slice(1)} Wallet`
                        : "Wallet"}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: TOKENS.textMuted,
                        fontFamily: "var(--font-mono), monospace",
                      }}
                    >
                      {shortAddress(wallet.address)}
                    </div>
                  </div>
                  <Badge color="green">Active</Badge>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @media (max-width: 900px) {
          .dash-root {
            flex-direction: column;
          }
          .dash-sidebar {
            position: static !important;
            width: 100% !important;
            height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid ${TOKENS.border} !important;
          }
          .dash-main {
            padding: 24px !important;
          }
          .three-col {
            grid-template-columns: 1fr !important;
          }
          .two-col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
