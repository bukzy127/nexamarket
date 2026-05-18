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

const REAL_DATA_MESSAGE = "Real data will appear after transactions are completed.";

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
            Connect MetaMask on Injective EVM Testnet to view your
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
  const balance = wallet.balance;

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
                  {balance ?? "Not available"}{" "}
                  <span style={{ fontSize: 24, color: TOKENS.textMuted }}>
                    INJ
                  </span>
                </div>
                <div style={{ fontSize: 16, color: TOKENS.textMuted }}>
                  {balance
                    ? "Live wallet balance from Injective EVM Testnet."
                    : "Wallet balance is not available yet."}
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
                  Real data
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: TOKENS.textMuted,
                    fontWeight: 600,
                  }}
                >
                  {REAL_DATA_MESSAGE}
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
                  Real data
                </div>
                <div style={{ fontSize: 12, color: TOKENS.textMuted }}>
                  {REAL_DATA_MESSAGE}
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
                <p style={{ color: TOKENS.textMuted, fontSize: 13, margin: 0 }}>
                  {REAL_DATA_MESSAGE}
                </p>
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
            {owned.length === 0 ? (
              <Card style={{ padding: 24 }}>
                <p style={{ color: TOKENS.textMuted, fontSize: 14, margin: 0 }}>
                  Real listings will appear after you upload projects.
                </p>
              </Card>
            ) : (
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
                      {owned.map((project, i) => (
                        <tr
                          key={project.id}
                          style={{
                            borderBottom:
                              i < owned.length - 1
                                ? `1px solid ${TOKENS.border}`
                                : "none",
                          }}
                        >
                          <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 600 }}>
                            {project.title}
                          </td>
                          <td
                            style={{
                              padding: "16px 20px",
                              fontSize: 13,
                              fontFamily: "var(--font-mono), monospace",
                              color: TOKENS.cyan,
                            }}
                          >
                            {project.price} INJ
                          </td>
                          <td
                            style={{
                              padding: "16px 20px",
                              fontSize: 13,
                              color: TOKENS.textMuted,
                            }}
                          >
                            {REAL_DATA_MESSAGE}
                          </td>
                          <td
                            style={{
                              padding: "16px 20px",
                              fontSize: 13,
                              color: TOKENS.textMuted,
                            }}
                          >
                            {REAL_DATA_MESSAGE}
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <Badge color="green">active</Badge>
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <Btn
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/project/${project.id}`)}
                            >
                              View
                            </Btn>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
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
            <Card style={{ padding: 24 }}>
              <p style={{ color: TOKENS.textMuted, fontSize: 14, margin: 0 }}>
                {REAL_DATA_MESSAGE}
              </p>
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
                  {balance ?? "Not available"}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: TOKENS.textMuted,
                    marginBottom: 28,
                  }}
                >
                  {balance
                    ? "Live wallet balance from Injective EVM Testnet."
                    : "Wallet balance is not available yet."}
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
