"use client";

import { useMemo, useState } from "react";
import { TOKENS } from "@/lib/tokens";
import { useWallet } from "@/hooks/useWallet";
import { useWalletModal } from "@/components/WalletModalProvider";
import {
  CATEGORIES,
  SORT_OPTIONS,
  type SortOption,
} from "@/lib/mock";
import type { Category } from "@/types";
import { useProjectCatalog } from "@/hooks/useProjectCatalog";
import ProjectCard from "@/components/ProjectCard";
import Btn from "@/components/ui/Btn";
import Icon from "@/components/ui/Icon";

export default function MarketplacePage() {
  const wallet = useWallet();
  const { open: openWallet } = useWalletModal();
  const { projects } = useProjectCatalog(wallet.address);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [sort, setSort] = useState<SortOption>("Newest");
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(70);

  const filtered = useMemo(() => {
    const list = projects.filter((p) => {
      const matchCat = category === "All" || p.category === category;
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchPrice = p.price >= 0 && p.price <= maxPrice;
      return matchCat && matchSearch && matchPrice;
    });
    return [...list].sort((a, b) => {
      if (sort === "Price: Low→High") return a.price - b.price;
      if (sort === "Price: High→Low") return b.price - a.price;
      if (sort === "Top Rated") return b.rating - a.rating;
      if (sort === "Most Sold") return b.sales - a.sales;
      return b.id - a.id;
    });
  }, [projects, search, category, sort, maxPrice]);

  return (
    <div style={{ minHeight: "100vh", background: TOKENS.bg0, paddingTop: 64 }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(180deg, ${TOKENS.bg1} 0%, ${TOKENS.bg0} 100%)`,
          padding: "48px 32px 32px",
          borderBottom: `1px solid ${TOKENS.border}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              Asset Marketplace
            </h1>
            <p style={{ color: TOKENS.textMuted, fontSize: 15 }}>
              Blueprints, BIM models, structural packages, and more — secured on
              Injective blockchain
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 280, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <Icon name="search" size={16} color={TOKENS.textMuted} />
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blueprints, BIM models, specifications..."
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  background: TOKENS.bg2,
                  border: `1px solid ${TOKENS.border}`,
                  borderRadius: 10,
                  color: TOKENS.text,
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              style={{
                padding: "12px 16px",
                background: TOKENS.bg2,
                border: `1px solid ${TOKENS.border}`,
                borderRadius: 10,
                color: TOKENS.text,
                fontSize: 14,
                fontFamily: "inherit",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <Btn
              variant="secondary"
              onClick={() => setShowFilters((p) => !p)}
              icon="filter"
              size="md"
            >
              Filters {showFilters ? "▲" : "▼"}
            </Btn>
          </div>

          {showFilters && (
            <div
              style={{
                marginTop: 16,
                padding: 20,
                background: TOKENS.bg2,
                borderRadius: 12,
                border: `1px solid ${TOKENS.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: TOKENS.textMuted,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                }}
              >
                Max Price (INJ)
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: 16 }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: TOKENS.cyan,
                    fontFamily: "var(--font-mono), monospace",
                    minWidth: 80,
                  }}
                >
                  0 — {maxPrice} INJ
                </span>
                <input
                  type="range"
                  min={0}
                  max={70}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ flex: 1, accentColor: TOKENS.cyan }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div
        style={{
          padding: "20px 32px",
          borderBottom: `1px solid ${TOKENS.border}`,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            gap: 8,
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "8px 18px",
                borderRadius: 100,
                border: `1px solid ${
                  category === cat ? TOKENS.cyan : TOKENS.border
                }`,
                background:
                  category === cat ? "rgba(0,212,255,0.12)" : "transparent",
                color: category === cat ? TOKENS.cyan : TOKENS.textMuted,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 32 }}>
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 14, color: TOKENS.textMuted }}>
            <span style={{ color: TOKENS.text, fontWeight: 600 }}>
              {filtered.length}
            </span>{" "}
            assets found
          </span>
          {!wallet.connected && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 16px",
                borderRadius: 10,
                background: "rgba(0,212,255,0.06)",
                border: "1px solid rgba(0,212,255,0.15)",
              }}
            >
              <Icon name="wallet" size={14} color={TOKENS.cyan} />
              <span style={{ fontSize: 13, color: TOKENS.textMuted }}>
                Connect wallet to purchase
              </span>
              <button
                onClick={openWallet}
                style={{
                  fontSize: 13,
                  color: TOKENS.cyan,
                  cursor: "pointer",
                  fontWeight: 600,
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  fontFamily: "inherit",
                }}
              >
                Connect →
              </button>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Icon name="search" size={48} color={TOKENS.textDim} />
            <p
              style={{
                color: TOKENS.textMuted,
                marginTop: 16,
                fontSize: 16,
              }}
            >
              No assets match your search.
            </p>
          </div>
        ) : (
          <div className="mp-grid">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .mp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) {
          .mp-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 560px) {
          .mp-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
