"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TOKENS } from "@/lib/tokens";
import { findProject, SAMPLE_PROJECTS } from "@/lib/mock";
import { useWallet } from "@/hooks/useWallet";
import { useWalletModal } from "@/components/WalletModalProvider";
import Card from "@/components/ui/Card";
import Btn from "@/components/ui/Btn";
import Badge from "@/components/ui/Badge";
import Icon, { type IconName } from "@/components/ui/Icon";

const TX_STEPS: { label: string; icon: IconName }[] = [
  { label: "Initiating transaction", icon: "wallet" },
  { label: "Verifying wallet signature", icon: "shield" },
  { label: "Smart contract executing", icon: "chain" },
  { label: "Asset ownership transferred on-chain", icon: "check" },
];

const TABS = ["overview", "files", "history", "reviews"] as const;
type Tab = (typeof TABS)[number];

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const project = findProject(params.id);

  const wallet = useWallet();
  const { open: openWallet } = useWalletModal();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [purchased, setPurchased] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStep, setTxStep] = useState(0);

  useEffect(() => {
    if (!showTxModal) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    [0, 1, 2, 3].forEach((s, i) => {
      timers.push(setTimeout(() => setTxStep(s + 1), i * 1200));
    });
    timers.push(
      setTimeout(() => {
        setShowTxModal(false);
        setPurchased(true);
      }, 5200),
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [showTxModal]);

  if (!project) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: TOKENS.bg0,
          paddingTop: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: TOKENS.textMuted, marginBottom: 16 }}>
            No project selected.
          </p>
          <Link href="/marketplace">
            <Btn icon="arrow">Back to Marketplace</Btn>
          </Link>
        </div>
      </div>
    );
  }

  const isOwned = purchased;

  function handleBuy() {
    if (!wallet.connected) {
      openWallet();
      return;
    }
    setTxStep(0);
    setShowTxModal(true);
  }

  const related = SAMPLE_PROJECTS.filter(
    (p) => p.id !== project.id && p.category === project.category,
  ).slice(0, 3);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: TOKENS.bg0,
        paddingTop: 64,
        color: TOKENS.text,
      }}
    >
      {/* Tx Modal */}
      {showTxModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <Card style={{ padding: 40, width: 420, maxWidth: "100%", textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(0,212,255,0.1)",
                border: `1px solid ${TOKENS.border}`,
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="zap" size={28} color={TOKENS.cyan} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Processing Payment
            </h3>
            <p
              style={{
                color: TOKENS.textMuted,
                fontSize: 14,
                marginBottom: 32,
              }}
            >
              Injective smart contract executing…
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {TX_STEPS.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 16px",
                    borderRadius: 10,
                    background:
                      txStep > i
                        ? "rgba(16,217,126,0.08)"
                        : txStep === i
                          ? "rgba(0,212,255,0.08)"
                          : "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      txStep > i
                        ? "rgba(16,217,126,0.25)"
                        : txStep === i
                          ? TOKENS.border
                          : "transparent"
                    }`,
                    transition: "all 0.4s ease",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background:
                        txStep > i
                          ? "rgba(16,217,126,0.2)"
                          : txStep === i
                            ? "rgba(0,212,255,0.15)"
                            : "transparent",
                      border: `1px solid ${
                        txStep > i
                          ? TOKENS.green
                          : txStep === i
                            ? TOKENS.cyan
                            : TOKENS.textDim
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.4s ease",
                    }}
                  >
                    {txStep > i ? (
                      <Icon name="check" size={14} color={TOKENS.green} />
                    ) : (
                      <Icon
                        name={step.icon}
                        size={13}
                        color={txStep === i ? TOKENS.cyan : TOKENS.textDim}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color:
                        txStep > i
                          ? TOKENS.green
                          : txStep === i
                            ? TOKENS.text
                            : TOKENS.textDim,
                      fontWeight: txStep === i ? 600 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                  {txStep === i && (
                    <div
                      style={{
                        marginLeft: "auto",
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: `2px solid ${TOKENS.cyan}`,
                        borderTopColor: "transparent",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Hero banner */}
      <div
        style={{
          height: 280,
          background: project.preview,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,0.025) 25%, transparent 25%)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 40%, rgba(4,8,15,0.95) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 32,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() => router.push("/marketplace")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(0,0,0,0.5)",
              border: `1px solid ${TOKENS.border}`,
              borderRadius: 8,
              padding: "6px 14px",
              color: TOKENS.textMuted,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              backdropFilter: "blur(8px)",
            }}
          >
            ← Marketplace
          </button>
          {project.featured && <Badge color="gold">Featured</Badge>}
        </div>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 32px 80px",
        }}
      >
        <div
          className="pd-grid"
          style={{
            marginTop: -48,
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Left: main content */}
          <div>
            <Card style={{ padding: "28px 32px", marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: TOKENS.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 600,
                    }}
                  >
                    {project.category}
                  </span>
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      margin: "8px 0 12px",
                    }}
                  >
                    {project.title}
                  </h1>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #00d4ff44, #7c3aed44)",
                          border: `1px solid ${TOKENS.border}`,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          color: TOKENS.textMuted,
                          fontFamily: "var(--font-mono), monospace",
                        }}
                      >
                        {project.owner}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Icon
                          key={j}
                          name="star"
                          size={13}
                          color={
                            j < Math.floor(project.rating)
                              ? TOKENS.gold
                              : TOKENS.textDim
                          }
                        />
                      ))}
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          marginLeft: 4,
                        }}
                      >
                        {project.rating}
                      </span>
                      <span style={{ fontSize: 13, color: TOKENS.textMuted }}>
                        ({project.reviews})
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Icon name="download" size={13} color={TOKENS.textMuted} />
                      <span style={{ fontSize: 13, color: TOKENS.textMuted }}>
                        {project.sales} sold
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                >
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11,
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: TOKENS.cyanDim,
                        color: TOKENS.cyan,
                        border: `1px solid ${TOKENS.border}`,
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <div
              style={{
                display: "flex",
                gap: 2,
                marginBottom: 20,
                background: TOKENS.bg2,
                borderRadius: 10,
                padding: 4,
                width: "fit-content",
                border: `1px solid ${TOKENS.border}`,
                flexWrap: "wrap",
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "none",
                    background:
                      activeTab === tab
                        ? "rgba(0,212,255,0.12)"
                        : "transparent",
                    color: activeTab === tab ? TOKENS.cyan : TOKENS.textMuted,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textTransform: "capitalize",
                    transition: "all 0.15s",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <Card style={{ padding: "28px 32px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                  About this project
                </h3>
                <p
                  style={{
                    color: TOKENS.textMuted,
                    lineHeight: 1.8,
                    fontSize: 15,
                    marginBottom: 24,
                  }}
                >
                  {project.description}
                </p>
                <p
                  style={{
                    color: TOKENS.textMuted,
                    lineHeight: 1.8,
                    fontSize: 15,
                    marginBottom: 24,
                  }}
                >
                  This asset package includes all drawing files, documentation,
                  and associated data. All files are stored on IPFS with CID
                  verification ensuring tamper-proof delivery. Ownership is
                  registered on the Injective blockchain — providing immutable,
                  auditable proof of purchase for your records.
                </p>
                <div
                  className="meta-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 16,
                  }}
                >
                  {[
                    { label: "File Size", value: "~48 MB" },
                    { label: "License", value: "Commercial" },
                    { label: "Last Updated", value: "Apr 2026" },
                    { label: "Blockchain", value: "Injective" },
                    { label: "Storage", value: "IPFS + Firebase" },
                    {
                      label: "Asset ID",
                      value: `#${String(project.id).padStart(5, "0")}`,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "14px 16px",
                        background: TOKENS.bg2,
                        borderRadius: 10,
                        border: `1px solid ${TOKENS.border}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: TOKENS.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: 6,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily:
                            item.label.includes("ID") ||
                            item.label.includes("Blockchain") ||
                            item.label.includes("Storage")
                              ? "var(--font-mono), monospace"
                              : "inherit",
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "files" && (
              <Card style={{ padding: "28px 32px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
                  Project Files
                </h3>
                {isOwned ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      "drawings/",
                      "specifications/",
                      "calculations/",
                      "README.pdf",
                      "delivery_schedule.xlsx",
                    ].map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 16px",
                          background: TOKENS.bg2,
                          borderRadius: 10,
                          border: `1px solid ${TOKENS.border}`,
                        }}
                      >
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 12 }}
                        >
                          <Icon name="layers" size={16} color={TOKENS.cyan} />
                          <span
                            style={{
                              fontSize: 14,
                              fontFamily: "var(--font-mono), monospace",
                            }}
                          >
                            {f}
                          </span>
                        </div>
                        <Btn variant="secondary" size="sm" icon="download">
                          Download
                        </Btn>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "48px 0" }}>
                    <Icon name="shield" size={40} color={TOKENS.textDim} />
                    <p
                      style={{
                        color: TOKENS.textMuted,
                        marginTop: 16,
                        fontSize: 15,
                      }}
                    >
                      Purchase this project to access all files.
                    </p>
                    <p
                      style={{
                        color: TOKENS.textDim,
                        fontSize: 13,
                        marginTop: 8,
                      }}
                    >
                      Ownership is verified on the Injective blockchain.
                    </p>
                  </div>
                )}
              </Card>
            )}

            {activeTab === "history" && (
              <Card style={{ padding: "28px 32px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
                  Ownership History
                </h3>
                {[
                  {
                    addr: project.owner,
                    action: "Created & Listed",
                    date: "Feb 12, 2026",
                    tx: "0xabc1...def2",
                  },
                  {
                    addr: "0x7Fa2...3bC1",
                    action: "Purchased",
                    date: "Mar 4, 2026",
                    tx: "0x9d3f...1a2b",
                  },
                  {
                    addr: "0xE5a1...8dF4",
                    action: "Resold",
                    date: "Apr 18, 2026",
                    tx: "0x2c7e...9f0a",
                  },
                ].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "16px 0",
                      borderBottom: i < 2 ? `1px solid ${TOKENS.border}` : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        name={i === 0 ? "upload" : "download"}
                        size={16}
                        color={TOKENS.cyan}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                        {h.action}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: TOKENS.textMuted,
                          fontFamily: "var(--font-mono), monospace",
                        }}
                      >
                        {h.addr}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: TOKENS.textMuted,
                          marginBottom: 4,
                        }}
                      >
                        {h.date}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: TOKENS.textDim,
                          fontFamily: "var(--font-mono), monospace",
                        }}
                      >
                        {h.tx}
                      </div>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {activeTab === "reviews" && (
              <Card style={{ padding: "28px 32px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
                  Reviews ({project.reviews})
                </h3>
                {[
                  {
                    addr: "0xD1f2...9aE3",
                    text: "Exceptional drawing quality. All details coordinated and clash-free. Saved our team weeks of drafting.",
                    rating: 5,
                    date: "Apr 2026",
                  },
                  {
                    addr: "inj1m3p...k7ql",
                    text: "Exactly what we needed for our tender submission. Fully compliant with current standards.",
                    rating: 5,
                    date: "Mar 2026",
                  },
                  {
                    addr: "0x5B3c...2fA0",
                    text: "Good package overall. Minor annotation issues but the seller responded quickly with an updated file.",
                    rating: 4,
                    date: "Feb 2026",
                  },
                ].map((r, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "20px 0",
                      borderBottom: i < 2 ? `1px solid ${TOKENS.border}` : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #00d4ff44, #7c3aed44)",
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontFamily: "var(--font-mono), monospace",
                            color: TOKENS.textMuted,
                          }}
                        >
                          {r.addr}
                        </div>
                        <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Icon
                              key={j}
                              name="star"
                              size={12}
                              color={j < r.rating ? TOKENS.gold : TOKENS.textDim}
                            />
                          ))}
                        </div>
                      </div>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 12,
                          color: TOKENS.textDim,
                        }}
                      >
                        {r.date}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: TOKENS.textMuted,
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {r.text}
                    </p>
                  </div>
                ))}
              </Card>
            )}
          </div>

          {/* Right: purchase column */}
          <div
            className="pd-side"
            style={{
              position: "sticky",
              top: 84,
              height: "fit-content",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              alignSelf: "flex-start",
            }}
          >
            <Card style={{ padding: 28 }}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  marginBottom: 4,
                  fontFamily: "var(--font-mono), monospace",
                  color: TOKENS.cyan,
                }}
              >
                {project.price}{" "}
                <span
                  style={{
                    fontSize: 18,
                    color: TOKENS.textMuted,
                    fontFamily: "inherit",
                  }}
                >
                  INJ
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: TOKENS.textMuted,
                  marginBottom: 24,
                }}
              >
                ≈ ${(project.price * 22.4).toFixed(2)} USD
              </div>

              {isOwned ? (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 14,
                      borderRadius: 12,
                      background: "rgba(16,217,126,0.08)",
                      border: "1px solid rgba(16,217,126,0.25)",
                      marginBottom: 16,
                    }}
                  >
                    <Icon name="check" size={18} color={TOKENS.green} />
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: TOKENS.green,
                        }}
                      >
                        You own this project
                      </div>
                      <div style={{ fontSize: 12, color: TOKENS.textMuted }}>
                        Verified on Injective
                      </div>
                    </div>
                  </div>
                  <Btn
                    style={{ width: "100%", justifyContent: "center" }}
                    variant="green"
                    icon="download"
                  >
                    Download Files
                  </Btn>
                </div>
              ) : (
                <div>
                  <Btn
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      marginBottom: 12,
                    }}
                    onClick={handleBuy}
                    icon="zap"
                    size="lg"
                  >
                    {wallet.connected ? "Buy Now" : "Connect & Buy"}
                  </Btn>
                  <div
                    style={{
                      fontSize: 11,
                      color: TOKENS.textDim,
                      textAlign: "center",
                      marginBottom: 20,
                    }}
                  >
                    Secured by Injective smart contract
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingTop: 20,
                  borderTop: `1px solid ${TOKENS.border}`,
                }}
              >
                {(
                  [
                    { icon: "shield", text: "On-chain ownership transfer" },
                    { icon: "chain", text: "IPFS verified file storage" },
                    { icon: "download", text: "Lifetime download access" },
                    { icon: "check", text: "Commercial use license" },
                    { icon: "blueprint", text: "CAD + PDF formats included" },
                  ] satisfies { icon: IconName; text: string }[]
                ).map((item, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Icon name={item.icon} size={14} color={TOKENS.green} />
                    <span style={{ fontSize: 13, color: TOKENS.textMuted }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 11,
                  color: TOKENS.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 14,
                }}
              >
                Seller
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #00d4ff, #7c3aed)",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontFamily: "var(--font-mono), monospace",
                      color: TOKENS.text,
                      marginBottom: 3,
                    }}
                  >
                    {project.owner}
                  </div>
                  <div style={{ fontSize: 12, color: TOKENS.textMuted }}>
                    Verified seller
                  </div>
                </div>
              </div>
              <Btn
                variant="secondary"
                size="sm"
                style={{ width: "100%", justifyContent: "center" }}
              >
                View Profile
              </Btn>
            </Card>
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
              More in {project.category}
            </h3>
            <div
              className="related-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 20,
              }}
            >
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/project/${p.id}`}
                  style={{
                    background: TOKENS.bg1,
                    border: `1px solid ${TOKENS.border}`,
                    borderRadius: 14,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                    display: "block",
                  }}
                >
                  <div style={{ height: 100, background: p.preview }} />
                  <div style={{ padding: "16px 18px" }}>
                    <div
                      style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}
                    >
                      {p.title}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: TOKENS.cyan,
                          fontWeight: 700,
                          fontFamily: "var(--font-mono), monospace",
                        }}
                      >
                        {p.price} INJ
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Icon name="star" size={12} color={TOKENS.gold} />
                        <span
                          style={{ fontSize: 12, color: TOKENS.textMuted }}
                        >
                          {p.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .pd-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 32px;
        }
        @media (max-width: 980px) {
          .pd-grid {
            grid-template-columns: 1fr;
          }
          .pd-side {
            position: static !important;
          }
        }
        @media (max-width: 700px) {
          .meta-grid,
          .related-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 520px) {
          .meta-grid,
          .related-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
