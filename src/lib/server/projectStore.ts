import type { Category, Project } from "@/types";
import { getSalesCounts, getUsernames } from "@/lib/server/appStore";

const PROJECTS_TABLE = "projects";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface ProjectRecord {
  id: number;
  title: string;
  description: string;
  category: Category;
  price: number | string;
  owner: string;
  owner_username?: string | null;
  creator?: string | null;
  rating?: number | string | null;
  reviews?: number | null;
  tags?: string[] | null;
  preview: string;
  preview_images?: string[] | null;
  preview_cids?: string[] | null;
  featured?: boolean | null;
  sales?: number | null;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  storage_provider?: "supabase" | "supabase+ipfs" | "ipfs" | null;
  storage_path?: string | null;
  cid?: string | null;
  ipfs_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function supabaseRestUrl(path: string): string {
  return `${required(SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "")}/rest/v1/${path}`;
}

function supabaseHeaders(extra?: HeadersInit): HeadersInit {
  const key = required(SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTemporarySupabaseTimeout(status: number, body: string): boolean {
  return status === 544 || body.includes("DatabaseTimeout");
}

async function supabaseFetch(path: string, init?: RequestInit): Promise<Response> {
  let lastRes: Response | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const res = await fetch(supabaseRestUrl(path), init);
    if (res.ok) return res;

    const body = await res.clone().text();
    lastRes = res;
    if (!isTemporarySupabaseTimeout(res.status, body) || attempt === 2) {
      return res;
    }
    await wait(1500 * (attempt + 1));
  }

  return lastRes!;
}

async function parseSupabaseError(res: Response): Promise<Error> {
  const text = await res.text();
  if (isTemporarySupabaseTimeout(res.status, text)) {
    return new Error("Supabase is still waking up. Please wait one minute and try again.");
  }
  try {
    const data = JSON.parse(text) as { message?: string; error?: string };
    return new Error(data.message || data.error || text);
  } catch {
    return new Error(text || `Supabase request failed with ${res.status}`);
  }
}

function toRecord(project: Project): ProjectRecord {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    category: project.category,
    price: project.price,
    owner: project.owner,
    owner_username: project.ownerUsername || null,
    creator: project.creator || project.owner,
    rating: project.rating,
    reviews: project.reviews,
    tags: project.tags,
    preview: project.preview,
    preview_images: project.previewImages || [],
    preview_cids: project.previewCids || [],
    featured: project.featured,
    sales: project.sales,
    file_url: project.fileUrl || null,
    file_name: project.fileName || null,
    file_size: project.fileSize || null,
    storage_provider: project.storageProvider || "ipfs",
    storage_path: project.storagePath || null,
    cid: project.cid || null,
    ipfs_url: project.ipfsUrl || null,
    created_at: project.createdAt || new Date().toISOString(),
    updated_at: project.updatedAt || new Date().toISOString(),
  };
}

function fromRecord(record: ProjectRecord): Project {
  return {
    id: Number(record.id),
    title: record.title,
    description: record.description,
    category: record.category,
    price: Number(record.price),
    owner: record.owner,
    ownerUsername: record.owner_username || undefined,
    creator: record.creator || record.owner,
    rating: Number(record.rating || 0),
    reviews: Number(record.reviews || 0),
    tags: record.tags || [],
    preview: record.preview,
    previewImages: record.preview_images || (record.preview ? [record.preview] : []),
    previewCids: record.preview_cids || undefined,
    featured: Boolean(record.featured),
    sales: Number(record.sales || 0),
    fileUrl: record.file_url || undefined,
    fileName: record.file_name || undefined,
    fileSize: record.file_size || undefined,
    storageProvider: record.storage_provider || "supabase",
    storagePath: record.storage_path || undefined,
    cid: record.cid || undefined,
    ipfsUrl: record.ipfs_url || undefined,
    createdAt: record.created_at || undefined,
    updatedAt: record.updated_at || undefined,
  };
}

export function publicProject(project: Project): Project {
  const {
    fileUrl: _fileUrl,
    storagePath: _storagePath,
    cid: _cid,
    ipfsUrl: _ipfsUrl,
    previewCids: _previewCids,
    ...safeProject
  } = project;
  return safeProject;
}

export async function saveProject(project: Project): Promise<Project> {
  const res = await supabaseFetch(`${PROJECTS_TABLE}?on_conflict=id`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    }),
    body: JSON.stringify([toRecord(project)]),
  });

  if (!res.ok) throw await parseSupabaseError(res);
  const data = (await res.json()) as ProjectRecord[];
  return fromRecord(data[0]);
}

export async function getProject(id: number): Promise<Project | null> {
  const res = await supabaseFetch(
    `${PROJECTS_TABLE}?id=eq.${id}&select=*&limit=1`,
    { headers: supabaseHeaders() },
  );

  if (!res.ok) throw await parseSupabaseError(res);
  const data = (await res.json()) as ProjectRecord[];
  return data[0] ? fromRecord(data[0]) : null;
}

export async function listProjects(): Promise<Project[]> {
  const res = await supabaseFetch(
    `${PROJECTS_TABLE}?select=*&order=created_at.desc`,
    { headers: supabaseHeaders() },
  );

  if (!res.ok) throw await parseSupabaseError(res);
  const data = (await res.json()) as ProjectRecord[];
  const projects = data.map(fromRecord);
  const [usernames, salesCounts]: [
    Record<string, string>,
    Record<number, number>,
  ] = await Promise.all([
    getUsernames(projects.map((project) => project.owner)).catch(
      () => ({} as Record<string, string>),
    ),
    getSalesCounts(projects.map((project) => project.id)).catch(
      () => ({} as Record<number, number>),
    ),
  ]);
  return projects.map((project) => ({
    ...project,
    ownerUsername:
      project.ownerUsername || usernames[project.owner.toLowerCase()],
    sales: salesCounts[project.id] ?? project.sales,
  }));
}
