"use client";

import { CSSProperties, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TOKENS } from "@/lib/tokens";
import { useWallet } from "@/hooks/useWallet";
import { useWalletModal } from "@/components/WalletModalProvider";
import { uploadToSupabaseStorage } from "@/lib/supabaseStorage";
import {
  createUploadedProject,
  useProjectCatalog,
} from "@/hooks/useProjectCatalog";
import { registerProjectOnChain } from "@/lib/injectiveContract";
import { useProjectQRCode } from "@/hooks/useProjectQRCode";
import type { Category } from "@/types";
import Card from "@/components/ui/Card";
import Btn from "@/components/ui/Btn";
import Badge from "@/components/ui/Badge";
import Icon, { type IconName } from "@/components/ui/Icon";
import ProjectQRCode from "@/components/ProjectQRCode";

const CATEGORIES = [
  "Architectural Plans",
  "Structural Engineering",
  "BIM & CAD Models",
  "Project Specifications",
  "Cost Estimation",
  "Safety & Compliance",
  "MEP Design",
  "Survey & Geotechnical",
];

const LICENSES = [
  {
    id: "commercial",
    label: "Commercial",
    desc: "Buyer may use in commercial construction projects",
  },
  {
    id: "single",
    label: "Single Project",
    desc: "Licensed for one specific construction project only",
  },
  {
    id: "practice",
    label: "Practice License",
    desc: "Firm-wide use across all projects",
  },
];

const STEPS = [
  { n: 1, label: "Project Info" },
  { n: 2, label: "Upload Files" },
  { n: 3, label: "Pricing" },
  { n: 4, label: "Review & Publish" },
];

const STORAGE_OPTIONS: {
  id: "supabase";
  label: string;
  desc: string;
  icon: IconName;
  badge: string | null;
}[] = [
  {
    id: "supabase",
    label: "Supabase Storage",
    desc: "Files are uploaded to the project-files bucket",
    icon: "zap",
    badge: "Active",
  },
];

interface FormState {
  title: string;
  description: string;
  category: string;
  price: string;
  tags: string;
  license: string;
  storage: "supabase";
  fileName: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category: "",
  price: "",
  tags: "",
  license: "commercial",
  storage: "supabase",
  fileName: "",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  background: TOKENS.bg2,
  border: `1px solid ${TOKENS.border}`,
  borderRadius: 10,
  color: TOKENS.text,
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: TOKENS.textMuted,
  marginBottom: 8,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

export default function UploadPage() {
  const wallet = useWallet();
  const { open: openWallet } = useWalletModal();
  const { addProject } = useProjectCatalog(wallet.address);
  const { generateAndStoreQRCode } = useProjectQRCode();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedProjectId, setPublishedProjectId] = useState<number | null>(
    null,
  );
  const [publishedFileUrl, setPublishedFileUrl] = useState<string | null>(null);
  const [publishedTxHash, setPublishedTxHash] = useState<string | null>(null);
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function selectFile(file: File) {
    setSelectedFile(file);
    setField("fileName", file.name);
  }

  async function handleSubmit() {
    if (!selectedFile || !wallet.address) return;
    setUploading(true);
    setPublishError(null);
    setProgress(0);
    const interval = window.setInterval(() => {
      setProgress((p) => Math.min(p + 6, 90));
    }, 220);

    try {
      const upload = await uploadToSupabaseStorage(
        selectedFile,
        wallet.address,
      );
      const project = createUploadedProject({
        title: form.title,
        description: form.description,
        category: form.category as Category,
        price: parseFloat(form.price),
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        owner: wallet.address,
        fileName: selectedFile.name,
        fileSize: upload.size,
        fileUrl: upload.url,
        storagePath: upload.url,
      });
      const metadataRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
        }),
      });
      if (!metadataRes.ok) {
        throw new Error(`Metadata save failed: ${await metadataRes.text()}`);
      }

      const chain = await registerProjectOnChain(project);
      addProject(project);
      setPublishedProjectId(project.id);
      setPublishedFileUrl(upload.url);
      setPublishedTxHash(chain.txHash);
      
      // Generate and store QR code
      try {
        await generateAndStoreQRCode(project.id, form.title);
        setQrCodeGenerated(true);
      } catch (err) {
        console.error("Failed to generate QR code:", err);
        // Continue anyway, QR generation failure should not block upload
      }
      
      setProgress(100);
      setSubmitted(true);
    } catch (err) {
      setPublishError(
        err instanceof Error ? err.message : "Unable to publish asset.",
      );
    } finally {
      window.clearInterval(interval);
      setUploading(false);
    }
  }

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
        <Card style={{ padding: "56px 48px", textAlign: "center", maxWidth: 420 }}>
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
            <Icon name="upload" size={32} color={TOKENS.cyan} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            Connect to Upload
          </h2>
          <p
            style={{
              color: TOKENS.textMuted,
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            You need to connect your wallet to list projects on NexaMarket.
            Your wallet address becomes your seller identity.
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

  if (submitted) {
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
        <Card style={{ padding: "56px 48px", textAlign: "center", maxWidth: 480 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(16,217,126,0.12)",
              border: `2px solid ${TOKENS.green}`,
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="check" size={36} color={TOKENS.green} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            Project Listed!
          </h2>
          <p
            style={{
              color: TOKENS.textMuted,
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 8,
            }}
          >
            <strong style={{ color: TOKENS.text }}>
              {form.title || "Your asset"}
            </strong>{" "}
            has been uploaded to Supabase Storage. Its private file link is now
            saved with the listing metadata and only shown to the owner or a
            purchaser.
          </p>
          <div
            style={{
              padding: 16,
              background: TOKENS.bg2,
              borderRadius: 12,
              border: `1px solid ${TOKENS.border}`,
              marginBottom: 32,
              textAlign: "left",
              marginTop: 24,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Storage", value: "Supabase Storage", mono: false },
                { label: "File", value: form.fileName, mono: true },
                {
                  label: "File Link",
                  value: publishedFileUrl || "Saved with listing metadata",
                  mono: true,
                },
                {
                  label: "Contract Tx",
                  value: publishedTxHash || "Pending registration",
                  mono: true,
                },
                { label: "Visibility", value: "Contract-verified only", mono: false },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: TOKENS.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: TOKENS.cyan,
                      fontFamily: item.mono
                        ? "var(--font-mono), monospace"
                        : "inherit",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Btn
              onClick={() =>
                router.push(
                  publishedProjectId
                    ? `/project/${publishedProjectId}`
                    : "/marketplace",
                )
              }
              style={{ flex: 1, justifyContent: "center" }}
              icon="grid"
            >
              View in Marketplace
            </Btn>
            <Btn
              variant="secondary"
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setForm(EMPTY_FORM);
                setSelectedFile(null);
                setPublishedProjectId(null);
                setPublishedFileUrl(null);
                setPublishedTxHash(null);
              }}
              style={{ flex: 1, justifyContent: "center" }}
            >
              Upload Another
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  const priceNum = parseFloat(form.price);
  const hasPrice = !Number.isNaN(priceNum) && priceNum > 0;

  return (
    <div style={{ minHeight: "100vh", background: TOKENS.bg0, paddingTop: 64 }}>
      <div
        style={{
          padding: "40px 32px 32px",
          borderBottom: `1px solid ${TOKENS.border}`,
          background: `linear-gradient(180deg, ${TOKENS.bg1}, ${TOKENS.bg0})`,
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            List Your Asset
          </h1>
          <p style={{ color: TOKENS.textMuted, fontSize: 15 }}>
            Sell your blueprints, BIM models, specs, or calculations on
            NexaMarket. Files stored on Supabase Storage and revealed only to
            verified owners or buyers.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 32px" }}>
        {/* Step progress */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 40,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 18,
              left: "10%",
              right: "10%",
              height: 2,
              background: TOKENS.border,
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 18,
              left: "10%",
              height: 2,
              width: `${((step - 1) / 3) * 80}%`,
              background: `linear-gradient(90deg, ${TOKENS.cyan}, #7c3aed)`,
              transition: "width 0.4s ease",
              zIndex: 1,
            }}
          />
          {STEPS.map((s) => {
            const done = step > s.n;
            const current = step === s.n;
            return (
              <div
                key={s.n}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: done
                      ? TOKENS.green
                      : current
                        ? "linear-gradient(135deg, #00d4ff, #7c3aed)"
                        : TOKENS.bg2,
                    border: `2px solid ${
                      done ? TOKENS.green : current ? TOKENS.cyan : TOKENS.border
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                    transition: "all 0.3s ease",
                  }}
                >
                  {done ? (
                    <Icon name="check" size={16} color="#fff" />
                  ) : (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: current ? "#fff" : TOKENS.textDim,
                      }}
                    >
                      {s.n}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: current ? TOKENS.cyan : TOKENS.textDim,
                    fontWeight: current ? 600 : 400,
                    textAlign: "center",
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <Card style={{ padding: 36 }}>
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                Project Information
              </h2>

              <div>
                <label style={labelStyle}>Asset Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. High-Rise Residential Tower — Full Blueprint Set"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Describe the asset package — scope, standards used, file formats, applicable project types..."
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                />
              </div>

              <div className="up-row">
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tags (comma separated)</label>
                  <input
                    value={form.tags}
                    onChange={(e) => setField("tags", e.target.value)}
                    placeholder="AutoCAD, Revit, Eurocode, PDF"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <Btn
                  onClick={() => {
                    if (form.title && form.description && form.category)
                      setStep(2);
                  }}
                  disabled={!form.title || !form.description || !form.category}
                  icon="arrow"
                >
                  Next: Upload Files
                </Btn>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                Upload Files
              </h2>

              <div>
                <label style={labelStyle}>Project File (ZIP, RAR, TAR) *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) selectFile(file);
                  }}
                  style={{ display: "none" }}
                />
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files[0];
                    if (f) selectFile(f);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragOver ? TOKENS.cyan : TOKENS.border}`,
                    borderRadius: 14,
                    padding: "48px 24px",
                    textAlign: "center",
                    background: dragOver
                      ? "rgba(0,212,255,0.05)"
                      : TOKENS.bg2,
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "rgba(0,212,255,0.1)",
                      margin: "0 auto 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="upload" size={22} color={TOKENS.cyan} />
                  </div>
                  {form.fileName ? (
                    <div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: TOKENS.green,
                          marginBottom: 4,
                        }}
                      >
                        {form.fileName}
                      </div>
                      <div style={{ fontSize: 13, color: TOKENS.textMuted }}>
                        File ready for upload
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          marginBottom: 8,
                        }}
                      >
                        Drag &amp; drop your asset package
                      </div>
                      <div style={{ fontSize: 13, color: TOKENS.textMuted }}>
                        or click to browse · DWG, RVT, IFC, PDF, XLSX, ZIP ·
                        Max 500MB
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Storage Method</label>
                <div className="up-row">
                  {STORAGE_OPTIONS.map((opt) => {
                    const selected = form.storage === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setField("storage", opt.id)}
                        style={{
                          padding: 18,
                          borderRadius: 12,
                          border: `2px solid ${selected ? TOKENS.cyan : TOKENS.border}`,
                          background: selected
                            ? "rgba(0,212,255,0.06)"
                            : TOKENS.bg2,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Icon
                              name={opt.icon}
                              size={16}
                              color={selected ? TOKENS.cyan : TOKENS.textMuted}
                            />
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: selected ? TOKENS.cyan : TOKENS.text,
                              }}
                            >
                              {opt.label}
                            </span>
                          </div>
                          {opt.badge && <Badge color="cyan">{opt.badge}</Badge>}
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            color: TOKENS.textMuted,
                            margin: 0,
                            lineHeight: 1.5,
                          }}
                        >
                          {opt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <Btn variant="secondary" onClick={() => setStep(1)}>
                  ← Back
                </Btn>
                <Btn
                  onClick={() => setStep(3)}
                  disabled={!form.fileName}
                  icon="arrow"
                >
                  Next: Pricing
                </Btn>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                Pricing &amp; License
              </h2>

              <div>
                <label style={labelStyle}>Price (INJ) *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.1"
                    style={{ ...inputStyle, paddingRight: 60 }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 14,
                      fontWeight: 700,
                      color: TOKENS.cyan,
                      fontFamily: "var(--font-mono), monospace",
                    }}
                  >
                    INJ
                  </span>
                </div>
                {hasPrice && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: TOKENS.textMuted,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 16,
                    }}
                  >
                    <span>
                      Payment route:{" "}
                      <span style={{ color: TOKENS.green }}>
                        direct on-chain transfer to seller
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>License Type</label>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {LICENSES.map((l) => {
                    const selected = form.license === l.id;
                    return (
                      <div
                        key={l.id}
                        onClick={() => setField("license", l.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "14px 18px",
                          borderRadius: 10,
                          border: `2px solid ${selected ? TOKENS.cyan : TOKENS.border}`,
                          background: selected
                            ? "rgba(0,212,255,0.06)"
                            : TOKENS.bg2,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            border: `2px solid ${selected ? TOKENS.cyan : TOKENS.textDim}`,
                            background: selected ? TOKENS.cyan : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.2s",
                          }}
                        >
                          {selected && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#000",
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: selected ? TOKENS.cyan : TOKENS.text,
                            }}
                          >
                            {l.label}
                          </div>
                          <div style={{ fontSize: 12, color: TOKENS.textMuted }}>
                            {l.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <Btn variant="secondary" onClick={() => setStep(2)}>
                  ← Back
                </Btn>
                <Btn onClick={() => setStep(4)} disabled={!hasPrice} icon="arrow">
                  Next: Review
                </Btn>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                Review &amp; Publish
              </h2>

              <div
                style={{
                  padding: 24,
                  background: TOKENS.bg2,
                  borderRadius: 14,
                  border: `1px solid ${TOKENS.border}`,
                }}
              >
                <div className="up-row">
                  {[
                    { label: "Title", value: form.title, mono: false },
                    { label: "Category", value: form.category, mono: false },
                    { label: "Price", value: `${form.price} INJ`, mono: true },
                    { label: "License", value: form.license, mono: false },
                    {
                      label: "Storage",
                      value: "Supabase Storage",
                      mono: false,
                    },
                    { label: "File", value: form.fileName, mono: true },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: TOKENS.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {item.label}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: TOKENS.text,
                          fontFamily: item.mono
                            ? "var(--font-mono), monospace"
                            : "inherit",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: 20,
                  background: "rgba(0,212,255,0.04)",
                  borderRadius: 12,
                  border: "1px solid rgba(0,212,255,0.12)",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: TOKENS.cyan,
                    marginBottom: 12,
                  }}
                >
                  What happens when you publish:
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {[
                    "1. File uploaded to Supabase Storage",
                    "2. Metadata and Supabase URL saved through the backend",
                    "3. Uploader access registered on Injective",
                    "4. File link stays hidden until contract access is verified",
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          marginTop: 2,
                          flexShrink: 0,
                          display: "inline-flex",
                        }}
                      >
                        <Icon name="check" size={14} color={TOKENS.green} />
                      </span>
                      <span style={{ fontSize: 13, color: TOKENS.textMuted }}>
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {uploading && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, color: TOKENS.textMuted }}>
                      Uploading to Supabase Storage...
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: TOKENS.cyan,
                      }}
                    >
                      {progress}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: TOKENS.bg2,
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, #00d4ff, #7c3aed)",
                        borderRadius: 10,
                        transition: "width 0.1s linear",
                      }}
                    />
                  </div>
                </div>
              )}

              {publishError && (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: "rgba(244,63,94,0.08)",
                    border: "1px solid rgba(244,63,94,0.25)",
                    color: TOKENS.red,
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {publishError}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <Btn variant="secondary" onClick={() => setStep(3)}>
                  ← Back
                </Btn>
                <Btn
                  onClick={handleSubmit}
                  disabled={uploading}
                  icon="upload"
                  size="lg"
                >
                  {uploading ? `Publishing... ${progress}%` : "Publish Asset"}
                </Btn>
              </div>
            </div>
          )}

          {submitted && publishedProjectId && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                🎉 Project Published Successfully!
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Success Summary */}
                <div
                  style={{
                    padding: 24,
                    background: TOKENS.bg2,
                    borderRadius: 14,
                    border: `1px solid ${TOKENS.border}`,
                  }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: TOKENS.cyan, marginBottom: 16 }}>
                      What's Next
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { icon: "check" as IconName, text: "Project is now live on marketplace" },
                        { icon: "download" as IconName, text: "Only you can access files until purchase" },
                        { icon: "code" as IconName, text: "Buyers can scan your QR code to view project" },
                        { icon: "trending" as IconName, text: "Wait for purchases and earnings" },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <Icon name={item.icon} size={18} color={TOKENS.green} style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: TOKENS.textMuted }}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${TOKENS.border}`, paddingTop: 16, marginTop: 16 }}>
                    <p style={{ fontSize: 12, color: TOKENS.textDim, marginBottom: 12 }}>Project ID</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: TOKENS.cyan, fontFamily: "monospace" }}>
                      {publishedProjectId}
                    </p>
                  </div>
                </div>

                {/* QR Code Display */}
                {qrCodeGenerated && publishedProjectId && (
                  <div style={{ width: "100%" }}>
                    <ProjectQRCode
                      projectId={publishedProjectId}
                      projectTitle={form.title}
                      size={240}
                      showDetails={false}
                      allowDownload={true}
                      allowShare={true}
                    />
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: 20,
                  background: "rgba(0,212,255,0.04)",
                  borderRadius: 12,
                  border: "1px solid rgba(0,212,255,0.12)",
                }}
              >
                <p style={{ fontSize: 13, color: TOKENS.cyan, fontWeight: 700, marginBottom: 8 }}>
                  Share Your Project
                </p>
                <p style={{ fontSize: 13, color: TOKENS.textMuted, lineHeight: 1.6 }}>
                  Share the QR code with potential buyers or visit your project dashboard to manage listings.
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Btn
                  onClick={() => router.push("/dashboard")}
                  variant="secondary"
                  icon="dashboard"
                >
                  Go to Dashboard
                </Btn>
                <Btn
                  onClick={() => router.push(`/project/${publishedProjectId}`)}
                  icon="arrow"
                >
                  View Project
                </Btn>
              </div>
            </div>
          )}
        </Card>
      </div>

      <style jsx>{`
        .up-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 600px) {
          .up-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
