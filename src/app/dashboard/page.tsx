"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useWallet } from "@/hooks/useWallet";
import { useWalletModal } from "@/components/WalletModalProvider";
import { useProjectCatalog } from "@/hooks/useProjectCatalog";
import { openVerifiedProjectDownload } from "@/lib/projectDownload";
import { shortAddress } from "@/lib/wallet";
import { TOKENS } from "@/lib/tokens";
import type { Activity, Purchase } from "@/types";
import Card from "@/components/ui/Card";
import Btn from "@/components/ui/Btn";
import Badge from "@/components/ui/Badge";
import Icon, { type IconName } from "@/components/ui/Icon";
import ProjectPreview from "@/components/ProjectPreview";
import { readableError } from "@/lib/errors";

type Section = "overview" | "owned" | "sales" | "history" | "wallet";

const SECTIONS: { id: Section; label: string; icon: IconName }[] = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "owned", label: "Owned Projects", icon: "blueprint" },
  { id: "sales", label: "Sales Revenue", icon: "trending" },
  { id: "history", label: "Purchase History", icon: "chain" },
  { id: "wallet", label: "Account", icon: "wallet" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function emptyState(message: string) {
  return (
    <div
      style={{
        padding: "42px 20px",
        textAlign: "center",
        color: TOKENS.textMuted,
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
}

export default function DashboardPage() {
  const wallet = useWallet();
  const { open: openWallet } = useWalletModal();
  const { projects, ownedProjects } = useProjectCatalog(wallet.address);
  const router = useRouter();
  const [active, setActive] = useState<Section>("overview");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Purchase[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!wallet.address) {
      setPurchases([]);
      setSales([]);
      setActivities([]);
      return;
    }
    setLoading(true);
    void fetch(`/api/dashboard?wallet=${encodeURIComponent(wallet.address)}`)
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          purchases?: Purchase[];
          sales?: Purchase[];
          activities?: Activity[];
          usernames?: Record<string, string>;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || "Unable to load dashboard.");
        setPurchases(data.purchases || []);
        setSales(data.sales || []);
        setActivities(data.activities || []);
        setUsernames(data.usernames || {});
      })
      .catch((err) => {
        toast.error(readableError(err, "Unable to load the dashboard."));
      })
      .finally(() => setLoading(false));
  }, [wallet.address]);

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );
  const listings = useMemo(() => {
    const address = wallet.address?.toLowerCase();
    return projects.filter(
      (project) =>
        project.creator?.toLowerCase() === address ||
        project.owner.toLowerCase() === address,
    );
  }, [projects, wallet.address]);
  const totalRevenue = sales.reduce(
    (sum, sale) => sum + Number(sale.price || 0),
    0,
  );

  async function download(projectId: number) {
    if (!wallet.address) return openWallet();
    setDownloadingId(projectId);
    try {
      await openVerifiedProjectDownload(projectId, wallet.address);
      toast.success("Download completed.");
      setActivities((current) => [
        {
          id: `local-${Date.now()}`,
          wallet: wallet.address!,
          type: "download",
          projectId,
          projectTitle: projectMap.get(projectId)?.title,
          timestamp: new Date().toISOString(),
        },
        ...current,
      ]);
    } catch (err) {
      toast.error(readableError(err, "Download could not be verified."));
    } finally {
      setDownloadingId(null);
    }
  }

  if (!wallet.connected) {
    return (
      <div
        style={{
          minHeight: "100vh",
          paddingTop: 64,
          background: TOKENS.bg0,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Card style={{ padding: 44, textAlign: "center", maxWidth: 430 }}>
          <Icon name="wallet" size={38} color={TOKENS.cyan} />
          <h1 style={{ fontSize: 24, margin: "18px 0 10px" }}>
            Connect your wallet
          </h1>
          <p
            style={{
              color: TOKENS.textMuted,
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            Connect MetaMask to view projects, sales, purchases, and activity.
          </p>
          <Btn onClick={openWallet} icon="wallet">
            Connect Wallet
          </Btn>
        </Card>
      </div>
    );
  }

  const displayName = wallet.username || shortAddress(wallet.address);

  return (
    <div
      className="dash-root"
      style={{
        minHeight: "100vh",
        paddingTop: 64,
        background: TOKENS.bg0,
        color: TOKENS.text,
        display: "flex",
      }}
    >
      <aside
        className="dash-sidebar"
        style={{
          width: 230,
          flexShrink: 0,
          padding: "30px 16px",
          background: TOKENS.bg1,
          borderRight: `1px solid ${TOKENS.border}`,
          position: "sticky",
          top: 64,
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "0 10px 22px",
            marginBottom: 18,
            borderBottom: `1px solid ${TOKENS.border}`,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 16 }}>{displayName}</div>
          <div
            style={{
              color: TOKENS.textMuted,
              fontSize: 11,
              marginTop: 5,
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            {shortAddress(wallet.address)}
          </div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "11px 13px",
                display: "flex",
                gap: 10,
                alignItems: "center",
                background:
                  active === item.id ? TOKENS.cyanDim : "transparent",
                color: active === item.id ? TOKENS.cyan : TOKENS.textMuted,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                textAlign: "left",
              }}
            >
              <Icon name={item.icon} size={15} color="currentColor" />
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => wallet.disconnect()}
          style={{
            marginTop: "auto",
            border: "none",
            background: "transparent",
            color: TOKENS.textDim,
            padding: 12,
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          Disconnect
        </button>
      </aside>

      <main className="dash-main" style={{ flex: 1, padding: 36, minWidth: 0 }}>
        {active === "overview" && (
          <>
            <div style={{ marginBottom: 26 }}>
              <h1 style={{ fontSize: 30, marginBottom: 6 }}>Dashboard</h1>
              <p style={{ color: TOKENS.textMuted }}>
                Welcome back, <span style={{ color: TOKENS.cyan }}>{displayName}</span>
              </p>
            </div>

            <div className="stats-grid">
              {[
                {
                  label: "Owned Projects",
                  value: String(ownedProjects.length),
                  note: "Uploaded or purchased",
                  color: TOKENS.cyan,
                },
                {
                  label: "Sales Revenue",
                  value: `${totalRevenue.toFixed(4)} INJ`,
                  note: `${sales.length} project${sales.length === 1 ? "" : "s"} sold`,
                  color: TOKENS.green,
                },
                {
                  label: "Purchases",
                  value: String(purchases.length),
                  note: "Verified purchase records",
                  color: TOKENS.gold,
                },
              ].map((stat) => (
                <Card key={stat.label} style={{ padding: 22 }}>
                  <div
                    style={{
                      color: TOKENS.textMuted,
                      textTransform: "uppercase",
                      fontSize: 11,
                      letterSpacing: ".06em",
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    style={{
                      color: stat.color,
                      fontSize: 30,
                      fontWeight: 800,
                      margin: "12px 0 6px",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ color: TOKENS.textMuted, fontSize: 12 }}>
                    {stat.note}
                  </div>
                </Card>
              ))}
            </div>

            <div className="overview-grid">
              <Card style={{ padding: 22 }}>
                <div className="section-heading">
                  <h2>Recent Transactions</h2>
                  <button onClick={() => setActive("history")}>View all</button>
                </div>
                {activities.length === 0
                  ? emptyState(
                      loading ? "Loading activity…" : "No transactions yet.",
                    )
                  : activities.slice(0, 6).map((activity) => (
                      <ActivityRow key={activity.id} activity={activity} />
                    ))}
              </Card>
              <Card style={{ padding: 22 }}>
                <div className="section-heading">
                  <h2>Owned Projects</h2>
                  <button onClick={() => setActive("owned")}>View all</button>
                </div>
                {ownedProjects.length === 0
                  ? emptyState("No owned projects yet.")
                  : ownedProjects.slice(0, 5).map((project) => (
                      <div
                        key={project.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 11,
                          padding: "10px 0",
                          borderBottom: `1px solid ${TOKENS.border}`,
                        }}
                      >
                        <ProjectPreview
                          project={project}
                          style={{ width: 44, height: 38, borderRadius: 8 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {project.title}
                          </div>
                          <div style={{ color: TOKENS.textMuted, fontSize: 11 }}>
                            {project.category}
                          </div>
                        </div>
                        <Btn
                          size="sm"
                          variant="ghost"
                          icon="download"
                          ariaLabel={`Download ${project.title}`}
                          disabled={downloadingId === project.id}
                          onClick={() => void download(project.id)}
                        />
                      </div>
                    ))}
              </Card>
            </div>
          </>
        )}

        {active === "owned" && (
          <SectionShell
            title="Owned Projects"
            subtitle="All projects this wallet uploaded or purchased."
          >
            {ownedProjects.length === 0 ? (
              <Card>{emptyState("No owned projects yet.")}</Card>
            ) : (
              <div className="project-grid">
                {ownedProjects.map((project) => (
                  <Card key={project.id} style={{ overflow: "hidden" }}>
                    <ProjectPreview project={project} style={{ height: 145 }} />
                    <div style={{ padding: 18 }}>
                      <div style={{ fontWeight: 800, marginBottom: 5 }}>
                        {project.title}
                      </div>
                      <div
                        style={{
                          color: TOKENS.textMuted,
                          fontSize: 12,
                          marginBottom: 16,
                        }}
                      >
                        {project.category}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn
                          variant="green"
                          size="sm"
                          icon="download"
                          disabled={downloadingId === project.id}
                          onClick={() => void download(project.id)}
                          style={{ flex: 1, justifyContent: "center" }}
                        >
                          {downloadingId === project.id
                            ? "Downloading…"
                            : "Download"}
                        </Btn>
                        <Btn
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`/project/${project.id}`)}
                        >
                          View
                        </Btn>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </SectionShell>
        )}

        {active === "sales" && (
          <SectionShell
            title="Sales Revenue"
            subtitle="Revenue and sales recorded after verified on-chain purchases."
          >
            <div className="stats-grid">
              <Card style={{ padding: 22 }}>
                <div style={{ color: TOKENS.textMuted, fontSize: 12 }}>
                  Total Revenue Earned
                </div>
                <div
                  style={{
                    color: TOKENS.green,
                    fontSize: 32,
                    fontWeight: 800,
                    marginTop: 10,
                  }}
                >
                  {totalRevenue.toFixed(4)} INJ
                </div>
              </Card>
              <Card style={{ padding: 22 }}>
                <div style={{ color: TOKENS.textMuted, fontSize: 12 }}>
                  Total Projects Sold
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, marginTop: 10 }}>
                  {sales.length}
                </div>
              </Card>
              <Card style={{ padding: 22 }}>
                <div style={{ color: TOKENS.textMuted, fontSize: 12 }}>
                  Active Listings
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, marginTop: 10 }}>
                  {listings.length}
                </div>
              </Card>
            </div>
            <Card style={{ overflow: "hidden" }}>
              <div className="table-title">Recent Sales</div>
              {sales.length === 0 ? (
                emptyState("No sales yet.")
              ) : (
                <DataTable
                  headers={["Project", "Buyer", "Price", "Date", "Transaction"]}
                  rows={sales.map((sale) => [
                    projectMap.get(sale.projectId)?.title ||
                      `Project #${sale.projectId}`,
                    usernames[sale.buyer.toLowerCase()] || "Marketplace user",
                    `${sale.price} INJ`,
                    formatDate(sale.timestamp),
                    sale.txHash || "—",
                  ])}
                />
              )}
            </Card>
          </SectionShell>
        )}

        {active === "history" && (
          <SectionShell
            title="Purchase History"
            subtitle="Verified purchases and recent wallet application activity."
          >
            <Card style={{ overflow: "hidden", marginBottom: 22 }}>
              <div className="table-title">Purchased Projects</div>
              {purchases.length === 0 ? (
                emptyState("No purchases yet.")
              ) : (
                <DataTable
                  headers={[
                    "Project",
                    "Seller",
                    "Price",
                    "Purchased",
                    "Transaction",
                  ]}
                  rows={purchases.map((purchase) => [
                    projectMap.get(purchase.projectId)?.title ||
                      `Project #${purchase.projectId}`,
                    usernames[purchase.seller.toLowerCase()] || "Verified seller",
                    `${purchase.price} INJ`,
                    formatDate(purchase.timestamp),
                    purchase.txHash || "—",
                  ])}
                />
              )}
            </Card>
            <Card style={{ padding: 22 }}>
              <div className="table-title" style={{ padding: "0 0 14px" }}>
                Recent Transactions
              </div>
              {activities.length === 0
                ? emptyState("No transactions yet.")
                : activities.map((activity) => (
                    <ActivityRow key={activity.id} activity={activity} />
                  ))}
            </Card>
          </SectionShell>
        )}

        {active === "wallet" && (
          <SectionShell
            title="Account"
            subtitle="Your public username and complete wallet details."
          >
            <div className="overview-grid">
              <Card style={{ padding: 28 }}>
                <div style={{ color: TOKENS.textMuted, fontSize: 12 }}>
                  Username
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: TOKENS.cyan,
                    marginTop: 10,
                  }}
                >
                  {wallet.username || "Not set"}
                </div>
                <Badge color="green">Public profile</Badge>
              </Card>
              <Card style={{ padding: 28 }}>
                <div style={{ color: TOKENS.textMuted, fontSize: 12 }}>
                  INJ Balance
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>
                  {wallet.balance ?? "Unavailable"} INJ
                </div>
              </Card>
            </div>
            <Card style={{ padding: 28, marginTop: 22 }}>
              <div style={{ color: TOKENS.textMuted, fontSize: 12 }}>
                Complete Wallet Address
              </div>
              <div
                style={{
                  padding: 15,
                  margin: "12px 0 16px",
                  background: TOKENS.bg2,
                  border: `1px solid ${TOKENS.border}`,
                  borderRadius: 10,
                  wordBreak: "break-all",
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 13,
                }}
              >
                {wallet.address}
              </div>
              <Btn
                variant="secondary"
                icon="copy"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(wallet.address || "");
                  toast.success("Address copied.");
                }}
              >
                Copy Address
              </Btn>
            </Card>
          </SectionShell>
        )}
      </main>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }
        .project-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .section-heading h2 {
          font-size: 15px;
        }
        .section-heading button {
          border: none;
          background: transparent;
          color: ${TOKENS.cyan};
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
        }
        .table-title {
          padding: 18px 20px;
          font-size: 15px;
          font-weight: 800;
          border-bottom: 1px solid ${TOKENS.border};
        }
        @media (max-width: 980px) {
          .dash-root {
            flex-direction: column;
          }
          .dash-sidebar {
            position: static !important;
            width: 100% !important;
            height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid ${TOKENS.border};
          }
          .dash-main {
            padding: 24px !important;
          }
          .stats-grid,
          .project-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .stats-grid,
          .overview-grid,
          .project-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function SectionShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 30, marginBottom: 6 }}>{title}</h1>
        <p style={{ color: TOKENS.textMuted }}>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function ActivityRow({ activity }: { activity: Activity }) {
  const labels: Record<Activity["type"], string> = {
    upload: "Uploaded",
    purchase: "Purchased",
    sale: "Sold",
    download: "Downloaded",
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 0",
        borderBottom: `1px solid ${TOKENS.border}`,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: TOKENS.cyanDim,
          display: "grid",
          placeItems: "center",
          color: TOKENS.cyan,
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        {labels[activity.type][0]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          {labels[activity.type]}{" "}
          {activity.projectTitle || `Project #${activity.projectId}`}
        </div>
        <div style={{ color: TOKENS.textMuted, fontSize: 11, marginTop: 2 }}>
          {formatDate(activity.timestamp)}
          {activity.amount ? ` · ${activity.amount} INJ` : ""}
        </div>
      </div>
      {activity.txHash && (
        <span
          title={activity.txHash}
          style={{
            color: TOKENS.textDim,
            fontFamily: "var(--font-mono), monospace",
            fontSize: 10,
          }}
        >
          {shortAddress(activity.txHash)}
        </span>
      )}
    </div>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: TOKENS.bg2 }}>
            {headers.map((header) => (
              <th
                key={header}
                style={{
                  padding: "13px 18px",
                  textAlign: "left",
                  color: TOKENS.textMuted,
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  whiteSpace: "nowrap",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} style={{ borderTop: `1px solid ${TOKENS.border}` }}>
              {row.map((value, cellIndex) => (
                <td
                  key={cellIndex}
                  style={{
                    padding: "15px 18px",
                    fontSize: 12,
                    color: cellIndex === 0 ? TOKENS.text : TOKENS.textMuted,
                    whiteSpace: "nowrap",
                  }}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
