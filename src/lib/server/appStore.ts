import type { Activity, ActivityType, Purchase, UserProfile } from "@/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function restUrl(path: string): string {
  return `${required(SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "")}/rest/v1/${path}`;
}

function headers(extra?: HeadersInit): HeadersInit {
  const key = required(SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  };
}

async function request(path: string, init?: RequestInit) {
  const res = await fetch(restUrl(path), init);
  if (res.ok) return res;
  const text = await res.text();
  try {
    const data = JSON.parse(text) as { message?: string; error?: string };
    throw new Error(data.message || data.error || text);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(text || `Supabase request failed with ${res.status}`);
    }
    throw err;
  }
}

interface ProfileRecord {
  wallet_address: string;
  username: string;
  created_at: string;
  updated_at?: string;
}

interface PurchaseRecord {
  id: string;
  project_id: number;
  buyer: string;
  seller: string;
  price: number | string;
  tx_hash: string;
  purchased_at: string;
}

interface ActivityRecord {
  id: string;
  wallet: string;
  type: ActivityType;
  project_id?: number | null;
  project_title?: string | null;
  counterparty?: string | null;
  amount?: number | string | null;
  tx_hash?: string | null;
  created_at: string;
}

function normalize(address: string) {
  return address.toLowerCase();
}

export async function getProfile(wallet: string): Promise<UserProfile | null> {
  const res = await request(
    `profiles?wallet_address=eq.${encodeURIComponent(normalize(wallet))}&select=*&limit=1`,
    { headers: headers() },
  );
  const rows = (await res.json()) as ProfileRecord[];
  const row = rows[0];
  return row
    ? {
        address: row.wallet_address,
        username: row.username,
        createdAt: row.created_at,
      }
    : null;
}

export async function saveProfile(
  wallet: string,
  username: string,
): Promise<UserProfile> {
  const now = new Date().toISOString();
  const res = await request("profiles?on_conflict=wallet_address", {
    method: "POST",
    headers: headers({
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    }),
    body: JSON.stringify([
      {
        wallet_address: normalize(wallet),
        username,
        updated_at: now,
      },
    ]),
  });
  const [row] = (await res.json()) as ProfileRecord[];
  return {
    address: row.wallet_address,
    username: row.username,
    createdAt: row.created_at || now,
  };
}

export async function getUsernames(
  wallets: string[],
): Promise<Record<string, string>> {
  const unique = [...new Set(wallets.map(normalize).filter(Boolean))];
  if (!unique.length) return {};
  const values = unique.map((wallet) => `"${wallet}"`).join(",");
  const res = await request(
    `profiles?wallet_address=in.(${encodeURIComponent(values)})&select=wallet_address,username`,
    { headers: headers() },
  );
  const rows = (await res.json()) as ProfileRecord[];
  return Object.fromEntries(
    rows.map((row) => [normalize(row.wallet_address), row.username]),
  );
}

export async function recordPurchase(input: {
  projectId: number;
  buyer: string;
  seller: string;
  price: number;
  txHash: string;
}): Promise<void> {
  await request("purchases?on_conflict=tx_hash", {
    method: "POST",
    headers: headers({
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=minimal",
    }),
    body: JSON.stringify([
      {
        project_id: input.projectId,
        buyer: normalize(input.buyer),
        seller: normalize(input.seller),
        price: input.price,
        tx_hash: input.txHash,
      },
    ]),
  });
}

export async function recordActivity(input: {
  wallet: string;
  type: ActivityType;
  projectId?: number;
  projectTitle?: string;
  counterparty?: string;
  amount?: number;
  txHash?: string;
}): Promise<void> {
  await request("activities?on_conflict=wallet,type,tx_hash", {
    method: "POST",
    headers: headers({
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=minimal",
    }),
    body: JSON.stringify([
      {
        wallet: normalize(input.wallet),
        type: input.type,
        project_id: input.projectId || null,
        project_title: input.projectTitle || null,
        counterparty: input.counterparty
          ? normalize(input.counterparty)
          : null,
        amount: input.amount ?? null,
        tx_hash: input.txHash || null,
      },
    ]),
  });
}

export async function getSalesCounts(
  projectIds: number[],
): Promise<Record<number, number>> {
  if (!projectIds.length) return {};
  const values = projectIds.join(",");
  const res = await request(
    `purchases?project_id=in.(${values})&select=project_id`,
    { headers: headers() },
  );
  const rows = (await res.json()) as { project_id: number }[];
  return rows.reduce<Record<number, number>>((counts, row) => {
    const id = Number(row.project_id);
    counts[id] = (counts[id] || 0) + 1;
    return counts;
  }, {});
}

export async function listPurchases(wallet: string): Promise<{
  purchases: Purchase[];
  sales: Purchase[];
}> {
  const key = encodeURIComponent(normalize(wallet));
  const [purchaseRes, salesRes] = await Promise.all([
    request(`purchases?buyer=eq.${key}&select=*&order=purchased_at.desc`, {
      headers: headers(),
    }),
    request(`purchases?seller=eq.${key}&select=*&order=purchased_at.desc`, {
      headers: headers(),
    }),
  ]);
  const map = (row: PurchaseRecord): Purchase => ({
    id: row.id,
    projectId: Number(row.project_id),
    buyer: row.buyer,
    seller: row.seller,
    price: String(row.price),
    txHash: row.tx_hash,
    timestamp: row.purchased_at,
  });
  return {
    purchases: ((await purchaseRes.json()) as PurchaseRecord[]).map(map),
    sales: ((await salesRes.json()) as PurchaseRecord[]).map(map),
  };
}

export async function listActivities(wallet: string): Promise<Activity[]> {
  const res = await request(
    `activities?wallet=eq.${encodeURIComponent(normalize(wallet))}&select=*&order=created_at.desc&limit=100`,
    { headers: headers() },
  );
  const rows = (await res.json()) as ActivityRecord[];
  const usernames = await getUsernames(
    rows.flatMap((row) => (row.counterparty ? [row.counterparty] : [])),
  );
  return rows.map((row) => ({
    id: row.id,
    wallet: row.wallet,
    type: row.type,
    projectId: row.project_id || undefined,
    projectTitle: row.project_title || undefined,
    counterparty: row.counterparty || undefined,
    counterpartyUsername: row.counterparty
      ? usernames[normalize(row.counterparty)]
      : undefined,
    amount:
      row.amount === null || row.amount === undefined
        ? undefined
        : String(row.amount),
    txHash: row.tx_hash || undefined,
    timestamp: row.created_at,
  }));
}
