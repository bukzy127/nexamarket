import type { Category, Project } from "@/types";

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
  creator?: string | null;
  rating?: number | string | null;
  reviews?: number | null;
  tags?: string[] | null;
  preview: string;
  featured?: boolean | null;
  sales?: number | null;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  storage_provider?: "supabase" | null;
  storage_path?: string | null;
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

async function parseSupabaseError(res: Response): Promise<Error> {
  const text = await res.text();
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
    creator: project.creator || project.owner,
    rating: project.rating,
    reviews: project.reviews,
    tags: project.tags,
    preview: project.preview,
    featured: project.featured,
    sales: project.sales,
    file_url: project.fileUrl || null,
    file_name: project.fileName || null,
    file_size: project.fileSize || null,
    storage_provider: "supabase",
    storage_path: project.storagePath || null,
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
    creator: record.creator || record.owner,
    rating: Number(record.rating || 0),
    reviews: Number(record.reviews || 0),
    tags: record.tags || [],
    preview: record.preview,
    featured: Boolean(record.featured),
    sales: Number(record.sales || 0),
    fileUrl: record.file_url || undefined,
    fileName: record.file_name || undefined,
    fileSize: record.file_size || undefined,
    storageProvider: "supabase",
    storagePath: record.storage_path || undefined,
    createdAt: record.created_at || undefined,
    updatedAt: record.updated_at || undefined,
  };
}

export function publicProject(project: Project): Project {
  const { fileUrl: _fileUrl, storagePath: _storagePath, ...safeProject } = project;
  return safeProject;
}

export async function saveProject(project: Project): Promise<Project> {
  const res = await fetch(supabaseRestUrl(`${PROJECTS_TABLE}?on_conflict=id`), {
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
  const res = await fetch(
    supabaseRestUrl(`${PROJECTS_TABLE}?id=eq.${id}&select=*&limit=1`),
    { headers: supabaseHeaders() },
  );

  if (!res.ok) throw await parseSupabaseError(res);
  const data = (await res.json()) as ProjectRecord[];
  return data[0] ? fromRecord(data[0]) : null;
}

export async function listProjects(): Promise<Project[]> {
  const res = await fetch(
    supabaseRestUrl(`${PROJECTS_TABLE}?select=*&order=created_at.desc`),
    { headers: supabaseHeaders() },
  );

  if (!res.ok) throw await parseSupabaseError(res);
  const data = (await res.json()) as ProjectRecord[];
  return data.map(fromRecord);
}
