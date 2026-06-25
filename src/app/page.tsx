"use client";

import Link from "next/link";
import { TOKENS } from "@/lib/tokens";
import { useWallet } from "@/hooks/useWallet";
import { useWalletModal } from "@/components/WalletModalProvider";
import Card from "@/components/ui/Card";
import Btn from "@/components/ui/Btn";
import Badge from "@/components/ui/Badge";
import Icon, { type IconName } from "@/components/ui/Icon";
import Footer from "@/components/Footer";

const STATS = [
  { label: "Projects Listed", value: "Real data will appear after uploads." },
  { label: "Total Volume", value: "Real data will appear after transactions." },
  { label: "Verified Firms", value: "This feature is not available yet." },
  { label: "Avg. Asset Price", value: "Real data will appear after uploads." },
];

const CATEGORIES: {
  name: string;
  status: string;
  icon: IconName;
  color: string;
}[] = [
  { name: "Architectural Plans", status: "Real listings will appear after uploads.", icon: "blueprint", color: TOKENS.cyan },
  { name: "Structural Engineering", status: "Real listings will appear after uploads.", icon: "building", color: "#a78bfa" },
  { name: "BIM & CAD Models", status: "Real listings will appear after uploads.", icon: "layers", color: TOKENS.gold },
  { name: "Project Specifications", status: "Real listings will appear after uploads.", icon: "code", color: TOKENS.green },
  { name: "Cost Estimation", status: "Real listings will appear after uploads.", icon: "trending", color: "#60a5fa" },
  { name: "Safety & Compliance", status: "Real listings will appear after uploads.", icon: "shield", color: TOKENS.red },
];

const HOW_IT_WORKS: { step: string; title: string; desc: string; icon: IconName }[] = [
  {
    step: "01",
    title: "Connect Wallet",
    desc: "Link MetaMask on Injective EVM Testnet. Your wallet address becomes your verified contractor identity on-chain.",
    icon: "wallet",
  },
  {
    step: "02",
    title: "Browse & Purchase",
    desc: "Find blueprints, BIM models, specs, and engineering packages. Pay securely with INJ tokens via smart contract.",
    icon: "blueprint",
  },
  {
    step: "03",
    title: "Own & Download",
    desc: "Ownership is transferred on Injective blockchain. Download links are revealed only to verified owners.",
    icon: "download",
  },
];

const WHY_BLOCKCHAIN: { icon: IconName; color: string; title: string; desc: string }[] = [
  {
    icon: "shield",
    color: TOKENS.cyan,
    title: "Tamper-Proof",
    desc: "Blueprints and specs are pinned on IPFS while access is gated by wallet ownership.",
  },
  {
    icon: "chain",
    color: "#a78bfa",
    title: "Verified Ownership",
    desc: "Every transfer recorded on Injective blockchain. Provenance guaranteed.",
  },
  {
    icon: "zap",
    color: TOKENS.gold,
    title: "Instant Settlement",
    desc: "Smart contracts auto-release files the moment payment is confirmed.",
  },
  {
    icon: "building",
    color: TOKENS.green,
    title: "Global Reach",
    desc: "Sell your designs to contractors and developers worldwide, 24/7.",
  },
];

const ASSET_TYPES = [
  { label: "Architectural Drawings", ext: ".DWG .PDF .RVT" },
  { label: "Structural Calculations", ext: ".XLSX .PDF" },
  { label: "BIM Models", ext: ".RVT .IFC .NWD" },
  { label: "MEP Designs", ext: ".DWG .RVT" },
  { label: "Cost BOQ Templates", ext: ".XLSX .CSV" },
  { label: "Construction Specs", ext: ".DOC .PDF" },
  { label: "Site Survey Data", ext: ".DXF .SHP .LAS" },
  { label: "Safety Plans", ext: ".PDF .DOCX" },
];

export default function LandingPage() {
  const wallet = useWallet();
  const { open: openWallet } = useWalletModal();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: TOKENS.bg0,
        color: TOKENS.text,
        fontFamily: "inherit",
      }}
    >
      {/* Hero */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          paddingTop: 64,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "8%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "8%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 32px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 100,
              border: "1px solid rgba(0,212,255,0.25)",
              background: "rgba(0,212,255,0.07)",
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: TOKENS.cyan,
                boxShadow: `0 0 8px ${TOKENS.cyan}`,
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: TOKENS.cyan,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Built on Injective · Pinata / IPFS · Ownership-Gated Files
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(40px, 6vw, 78px)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 24,
              color: TOKENS.text,
            }}
          >
            The Decentralized Marketplace
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #00d4ff, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              for Construction Assets
            </span>
          </h1>

          <p
            style={{
              fontSize: 18,
              color: TOKENS.textMuted,
              lineHeight: 1.7,
              maxWidth: 620,
              margin: "0 auto 40px",
              fontWeight: 400,
            }}
          >
            Buy, sell, and own blueprints, BIM models, engineering specs, and
            construction project files using cryptocurrency. Verified ownership
            on Injective blockchain. Files stored on IPFS and revealed only
            to verified owners.
          </p>

          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 64,
            }}
          >
            {wallet.connected ? (
              <Link href="/marketplace">
                <Btn size="lg" icon="blueprint">
                  Browse Marketplace
                </Btn>
              </Link>
            ) : (
              <Btn size="lg" onClick={openWallet} icon="wallet">
                Connect Wallet
              </Btn>
            )}
            <Link href="/marketplace">
              <Btn size="lg" variant="secondary" icon="arrow">
                Explore Assets
              </Btn>
            </Link>
          </div>

          {/* Live stats strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 1,
              borderRadius: 16,
              overflow: "hidden",
              border: `1px solid ${TOKENS.border}`,
              background: TOKENS.border,
            }}
            className="hero-stats"
          >
            {STATS.map((s, i) => (
              <div
                key={i}
                style={{
                  background: TOKENS.bg1,
                  padding: "20px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: TOKENS.text,
                    marginBottom: 4,
                    lineHeight: 1.5,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: TOKENS.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 4,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: "100px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <Badge color="cyan">Asset Categories</Badge>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginTop: 16,
              marginBottom: 12,
            }}
          >
            Browse by discipline
          </h2>
          <p
            style={{
              color: TOKENS.textMuted,
              fontSize: 16,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            From architectural blueprints to full BIM packages — find every type
            of construction asset in one marketplace.
          </p>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((cat, i) => (
            <Link key={i} href="/marketplace" style={{ display: "block" }}>
              <Card
                hoverable
                glow
                style={{
                  padding: "28px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${cat.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={cat.icon} size={22} color={cat.color} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: 13, color: TOKENS.textMuted }}>
                    {cat.status}
                  </div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <Icon name="arrow" size={16} color={TOKENS.textDim} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Why blockchain */}
      <section
        style={{
          padding: "100px 32px",
          background: `linear-gradient(180deg, transparent, ${TOKENS.bg1} 50%, transparent)`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <Badge color="violet">Why Blockchain</Badge>
            <h2
              style={{
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginTop: 16,
                marginBottom: 12,
              }}
            >
              Built for the construction industry
            </h2>
            <p
              style={{
                color: TOKENS.textMuted,
                fontSize: 16,
                maxWidth: 520,
                margin: "0 auto",
              }}
            >
              Traditional file sharing exposes your IP. Blockchain ownership
              changes everything.
            </p>
          </div>
          <div className="why-grid">
            {WHY_BLOCKCHAIN.map((item, i) => (
              <Card
                key={i}
                style={{ padding: "28px 24px", textAlign: "center" }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <Icon name={item.icon} size={24} color={item.color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: TOKENS.textMuted,
                    lineHeight: 1.7,
                  }}
                >
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          padding: "100px 32px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <Badge color="gold">How It Works</Badge>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginTop: 16,
              marginBottom: 12,
            }}
          >
            Three steps to ownership
          </h2>
          <p
            style={{
              color: TOKENS.textMuted,
              fontSize: 16,
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            Trustless, transparent, and secured by the Injective blockchain.
          </p>
        </div>
        <div
          className="hiw-grid"
          style={{ position: "relative" }}
        >
          <div
            style={{
              position: "absolute",
              top: 48,
              left: "20%",
              right: "20%",
              height: 1,
              background: `linear-gradient(90deg, transparent, ${TOKENS.border}, ${TOKENS.border}, transparent)`,
              zIndex: 0,
            }}
          />
          {HOW_IT_WORKS.map((item, i) => (
            <Card
              key={i}
              style={{
                padding: "36px 28px",
                textAlign: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))",
                  border: `1px solid ${TOKENS.border}`,
                  marginBottom: 20,
                }}
              >
                <Icon name={item.icon} size={24} color={TOKENS.cyan} />
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: TOKENS.textDim,
                  letterSpacing: "0.1em",
                  fontFamily: "var(--font-mono), monospace",
                  marginBottom: 12,
                }}
              >
                {item.step}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: TOKENS.textMuted,
                  lineHeight: 1.7,
                }}
              >
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section
        style={{
          padding: "100px 32px",
          background: `linear-gradient(180deg, transparent, ${TOKENS.bg1} 50%, transparent)`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <Badge color="green">Community</Badge>
            <h2
              style={{
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginTop: 16,
              }}
            >
              Trusted by construction professionals
            </h2>
          </div>
          <Card style={{ padding: 28, textAlign: "center" }}>
            <p style={{ color: TOKENS.textMuted, fontSize: 15, margin: 0 }}>
              Real community feedback will appear after transactions are completed.
            </p>
          </Card>
        </div>
      </section>

      {/* Asset types */}
      <section
        style={{
          padding: "100px 32px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <Badge color="blue">What You Can Sell</Badge>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginTop: 16,
            }}
          >
            Any construction asset, tokenized
          </h2>
        </div>
        <div className="asset-grid">
          {ASSET_TYPES.map((item, i) => (
            <Link key={i} href="/marketplace" style={{ display: "block" }}>
              <div
                style={{
                  padding: "18px 20px",
                  background: TOKENS.bg2,
                  border: `1px solid ${TOKENS.border}`,
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: TOKENS.cyan,
                    fontFamily: "var(--font-mono), monospace",
                    fontWeight: 500,
                  }}
                >
                  {item.ext}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "100px 32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, rgba(0,212,255,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}
        >
          <h2
            style={{
              fontSize: "clamp(36px, 5vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            Start monetizing your
            <br />
            construction IP
          </h2>
          <p
            style={{
              color: TOKENS.textMuted,
              fontSize: 16,
              marginBottom: 40,
              lineHeight: 1.7,
            }}
          >
            Upload your first blueprint, BIM model, or specification package
            and reach thousands of contractors and developers worldwide.
          </p>
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/upload">
              <Btn size="lg" icon="upload">
                List Your Assets
              </Btn>
            </Link>
            <Link href="/marketplace">
              <Btn size="lg" variant="secondary">
                Browse First
              </Btn>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .hero-stats {
          grid-template-columns: repeat(4, 1fr);
        }
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .why-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .hiw-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .asset-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .cat-grid,
          .hiw-grid {
            grid-template-columns: 1fr 1fr;
          }
          .why-grid,
          .asset-grid {
            grid-template-columns: 1fr 1fr;
          }
          .hero-stats {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 560px) {
          .cat-grid,
          .hiw-grid,
          .why-grid,
          .asset-grid {
            grid-template-columns: 1fr !important;
          }
          .hero-stats {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
