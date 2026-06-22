"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { TOKENS } from "@/lib/tokens";
import { useWallet } from "@/hooks/useWallet";
import { useProjectCatalog } from "@/hooks/useProjectCatalog";
import { signWalletMessage } from "@/lib/wallet";
import {
  hasProjectAccessOnChain,
  purchaseProjectOnChain,
} from "@/lib/injectiveContract";
import {
  openVerifiedProjectDownload,
  requestVerifiedProjectDownload,
  triggerBrowserDownload,
} from "@/lib/projectDownload";
import { useWalletModal } from "@/components/WalletModalProvider";
import Card from "@/components/ui/Card";
import Btn from "@/components/ui/Btn";
import Badge from "@/components/ui/Badge";
import Icon, { type IconName } from "@/components/ui/Icon";
import ProjectQRCode from "@/components/ProjectQRCode";

const TX_STEPS: { label: string; icon: IconName }[] = [
  { label: "Verifying wallet", icon: "wallet" },
  { label: "Checking INJ balance", icon: "shield" },
  { label: "Transferring payment to owner", icon: "chain" },
  { label: "Unlocking Supabase file link", icon: "check" },
];

const TABS = ["overview", "files", "history", "reviews"] as const;
type Tab = (typeof TABS)[number];

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const wallet = useWallet();
  const { open: openWallet } = useWalletModal();
  const { projects, findProject, hasAccess, markPurchased } =
    useProjectCatalog(wallet.address);
  const project = findProject(params.id);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [purchased, setPurchased] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStep, setTxStep] = useState(0);
  const [txError, setTxError] = useState<string | null>(null);
  const [securedFileUrl, setSecuredFileUrl] = useState<string | null>(null);

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

  const currentProject = project;
  const isOwned = purchased || hasAccess(currentProject);
  const updatedAt = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString()
    : "Real data will appear after upload.";

  const wait = (ms: number) =>
    new Promise((resolve) => window.setTimeout(resolve, ms));

  async function requestVerifiedDownload(openFile = false): Promise<string | null> {
    if (!wallet.address) {
      openWallet();
      return null;
    }

    try {
      const download = openFile
        ? await openVerifiedProjectDownload(currentProject.id, wallet.address)
        : await requestVerifiedProjectDownload(currentProject.id, wallet.address);
      setSecuredFileUrl(download.fileUrl);
      return download.fileUrl;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Download access could not be verified.";
      toast.error(message);
      return null;
    }
  }

  async function handleBuy() {
    const buyer = wallet.address;
    if (!wallet.connected || !buyer) {
      openWallet();
      return;
    }

    try {
      if (await hasProjectAccessOnChain(currentProject.id, buyer)) {
        setPurchased(true);
        markPurchased();
        await requestVerifiedDownload(true);
        return;
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to verify existing access.",
      );
      return;
    }

    setTxStep(0);
    setTxError(null);
    setShowTxModal(true);

    try {
      await wait(650);
      setTxStep(1);
      await wait(650);
      setTxStep(2);
      const chain = await purchaseProjectOnChain(currentProject);
      const purchaseMessage = `NexaMarket purchase\nWallet: ${buyer}\nProject: ${currentProject.id}\nTx: ${chain.txHash}`;
      const purchaseSignature = await signWalletMessage(purchaseMessage);

      const purchaseRes = await fetch(`/api/projects/${currentProject.id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: buyer,
          txHash: chain.txHash,
          message: purchaseMessage,
          signature: purchaseSignature,
        }),
      });
      if (!purchaseRes.ok) {
        const data = (await purchaseRes.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || "Purchase could not be verified.");
      }

      await wait(650);
      setTxStep(3);
      markPurchased();
      setPurchased(true);
      await requestVerifiedDownload(false);
      await wallet.refreshBalance();
      await wait(450);
      setShowTxModal(false);
    } catch (err) {
      setTxError(err instanceof Error ? err.message : "Purchase failed.");
    }
  }

  const related = projects.filter(
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
              {txError ? "Payment Failed" : "Processing Payment"}
            </h3>
            <p
              style={{
                color: TOKENS.textMuted,
                fontSize: 14,
                marginBottom: 32,
              }}
            >
              {txError
                ? txError
                : "Injective smart contract executing and verifying access…"}
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
            {txError && (
              <Btn
                variant="secondary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: 20,
                }}
                onClick={() => setShowTxModal(false)}
              >
                Close
              </Btn>
            )}
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
                      <Icon name="star" size={13} color={TOKENS.gold} />
                      <span style={{ fontSize: 13, color: TOKENS.textMuted }}>
                        {project.reviews > 0
                          ? `${project.rating} (${project.reviews})`
                          : "No reviews yet"}
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
                        {project.sales > 0 ? `${project.sales} sold` : "No sales yet"}
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
                  and associated data. Files are currently stored in Supabase
                  Storage, and the saved file link is only revealed after this
                  wallet owns or purchases the listing.
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
                    {
                      label: "File Size",
                      value: project.fileSize
                        ? `${(project.fileSize / 1024 / 1024).toFixed(2)} MB`
                        : "Real data will appear after upload.",
                    },
                    { label: "License", value: "This feature is not available yet." },
                    { label: "Last Updated", value: updatedAt },
                    { label: "Blockchain", value: "Injective" },
                    {
                      label: "Storage",
                      value: project.cid
                        ? "Supabase + IPFS (Pinata)"
                        : "Supabase Storage",
                    },
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

                {project.cid && (
                  <div
                    style={{
                      marginTop: 20,
                      padding: "16px 18px",
                      background: TOKENS.bg2,
                      borderRadius: 12,
                      border: "1px solid rgba(0,212,255,0.18)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon name="chain" size={14} color={TOKENS.cyan} />
                        <span
                          style={{
                            fontSize: 11,
                            color: TOKENS.textMuted,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            fontWeight: 600,
                          }}
                        >
                          IPFS Content ID
                        </span>
                      </div>
                      {project.ipfsUrl && (
                        <a
                          href={project.ipfsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 12,
                            color: TOKENS.green,
                            textDecoration: "underline",
                          }}
                        >
                          Open gateway →
                        </a>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: TOKENS.text,
                        fontFamily: "var(--font-mono), monospace",
                        wordBreak: "break-all",
                        lineHeight: 1.5,
                      }}
                    >
                      {project.cid}
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: TOKENS.textMuted,
                        marginTop: 8,
                        lineHeight: 1.5,
                      }}
                    >
                      File is content-addressed and pinned on IPFS — anyone with
                      the CID can verify byte-for-byte integrity.
                    </p>
                  </div>
                )}
              </Card>
            )}

            {activeTab === "files" && (
              <Card style={{ padding: "28px 32px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
                  Project Files
                </h3>
                {isOwned ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {securedFileUrl && (
                      <div
                        style={{
                          padding: "16px 18px",
                          background: "rgba(16,217,126,0.08)",
                          borderRadius: 12,
                          border: "1px solid rgba(16,217,126,0.25)",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: TOKENS.green,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            fontWeight: 700,
                            marginBottom: 8,
                          }}
                        >
                          Contract-verified Supabase file link
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: TOKENS.textMuted,
                            fontFamily: "var(--font-mono), monospace",
                            wordBreak: "break-all",
                            lineHeight: 1.6,
                            marginBottom: 12,
                          }}
                        >
                          {securedFileUrl}
                        </div>
                        <Btn
                          variant="green"
                          size="sm"
                          icon="download"
                          onClick={() => {
                            void triggerBrowserDownload(
                              securedFileUrl,
                              project.fileName,
                            );
                          }}
                        >
                          Download Supabase File
                        </Btn>
                      </div>
                    )}
                    {[
                      project.fileName || "project-package.zip",
                      "license.txt",
                      "metadata.json",
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
                        <Btn
                          variant="secondary"
                          size="sm"
                          icon="download"
                          onClick={() => {
                            void requestVerifiedDownload(true);
                          }}
                        >
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
                <p style={{ color: TOKENS.textMuted, fontSize: 14, margin: 0 }}>
                  Real data will appear after transactions are completed.
                </p>
              </Card>
            )}

            {activeTab === "reviews" && (
              <Card style={{ padding: "28px 32px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
                  Reviews
                </h3>
                <p style={{ color: TOKENS.textMuted, fontSize: 14, margin: 0 }}>
                  This feature is not available yet.
                </p>
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
                Paid directly to the project owner on-chain.
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
                    onClick={() => {
                      void requestVerifiedDownload(true);
                    }}
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
                    {wallet.connected ? "Buy / Purchase" : "Connect Wallet"}
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
                    { icon: "chain", text: "Supabase link gated by ownership" },
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

            {/* QR Code Card */}
            <Card style={{ padding: "28px 24px", textAlign: "center" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
                Share Project
              </h3>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <ProjectQRCode
                  projectId={project.id}
                  projectTitle={project.title}
                  size={180}
                  showDetails={false}
                  allowDownload={true}
                  allowShare={true}
                />
              </div>
              <p style={{ fontSize: 12, color: TOKENS.textMuted, lineHeight: 1.5 }}>
                Scan to instantly share this project with others
              </p>
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
