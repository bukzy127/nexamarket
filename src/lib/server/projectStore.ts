import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { Project } from "@/types";

interface StoreShape {
  projects: Project[];
  access: Record<string, number[]>;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "nexamarket-store.json");

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIRESTORE_TOKEN = process.env.FIRESTORE_REST_TOKEN;

function useFirestore(): boolean {
  return Boolean(FIREBASE_PROJECT_ID && FIRESTORE_TOKEN);
}

function docUrl(id?: number | string): string {
  const base = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/projects`;
  return id ? `${base}/${id}` : base;
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${FIRESTORE_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function s(value: string | undefined | null) {
  return { stringValue: value ?? "" };
}

function n(value: number | undefined | null) {
  return { doubleValue: value ?? 0 };
}

function i(value: number | undefined | null) {
  return { integerValue: String(value ?? 0) };
}

function arr(values: string[] | undefined) {
  return {
    arrayValue: {
      values: (values || []).map((value) => ({ stringValue: value })),
    },
  };
}

function toFirestore(project: Project) {
  return {
    fields: {
      id: i(project.id),
      title: s(project.title),
      description: s(project.description),
      category: s(project.category),
      owner: s(project.owner),
      creator: s(project.creator || project.owner),
      price: n(project.price),
      fileUrl: s(project.fileUrl),
      fileName: s(project.fileName),
      fileSize: i(project.fileSize),
      storageProvider: s(project.storageProvider || "firebase"),
      storagePath: s(project.storagePath),
      tags: arr(project.tags),
      rating: n(project.rating),
      reviews: i(project.reviews),
      preview: s(project.preview),
      featured: { booleanValue: Boolean(project.featured) },
      sales: i(project.sales),
      createdAt: s(project.createdAt),
      updatedAt: s(project.updatedAt),
    },
  };
}

function fieldString(fields: Record<string, any>, key: string): string {
  return fields[key]?.stringValue || "";
}

function fieldNumber(fields: Record<string, any>, key: string): number {
  const field = fields[key];
  return Number(field?.integerValue ?? field?.doubleValue ?? 0);
}

function fromFirestore(doc: any): Project {
  const fields = doc.fields || {};
  return {
    id: fieldNumber(fields, "id"),
    title: fieldString(fields, "title"),
    description: fieldString(fields, "description"),
    category: fieldString(fields, "category") as Project["category"],
    owner: fieldString(fields, "owner"),
    creator: fieldString(fields, "creator"),
    price: fieldNumber(fields, "price"),
    fileUrl: fieldString(fields, "fileUrl"),
    fileName: fieldString(fields, "fileName"),
    fileSize: fieldNumber(fields, "fileSize"),
    storageProvider: "firebase",
    storagePath: fieldString(fields, "storagePath"),
    tags:
      fields.tags?.arrayValue?.values?.map((item: any) => item.stringValue) || [],
    rating: fieldNumber(fields, "rating"),
    reviews: fieldNumber(fields, "reviews"),
    preview: fieldString(fields, "preview") || "#0d2040",
    featured: Boolean(fields.featured?.booleanValue),
    sales: fieldNumber(fields, "sales"),
    createdAt: fieldString(fields, "createdAt"),
    updatedAt: fieldString(fields, "updatedAt"),
  };
}

async function readLocal(): Promise<StoreShape> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as StoreShape;
  } catch {
    return { projects: [], access: {} };
  }
}

async function writeLocal(store: StoreShape) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2));
}

export async function saveProject(project: Project): Promise<Project> {
  if (useFirestore()) {
    const res = await fetch(docUrl(project.id), {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(toFirestore(project)),
    });
    if (!res.ok) throw new Error(`Firestore save failed: ${await res.text()}`);
    return project;
  }

  const store = await readLocal();
  const nextProjects = [
    project,
    ...store.projects.filter((item) => item.id !== project.id),
  ];
  await writeLocal({ ...store, projects: nextProjects });
  return project;
}

export async function getProject(id: number): Promise<Project | null> {
  if (useFirestore()) {
    const res = await fetch(docUrl(id), { headers: headers() });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Firestore read failed: ${await res.text()}`);
    return fromFirestore(await res.json());
  }

  const store = await readLocal();
  return store.projects.find((project) => project.id === id) || null;
}

export async function listProjects(): Promise<Project[]> {
  if (useFirestore()) {
    const res = await fetch(docUrl(), { headers: headers() });
    if (!res.ok) throw new Error(`Firestore list failed: ${await res.text()}`);
    const data = await res.json();
    return (data.documents || []).map(fromFirestore);
  }

  const store = await readLocal();
  return store.projects;
}

export async function grantLocalAccess(wallet: string, projectId: number) {
  const key = wallet.toLowerCase();
  const store = await readLocal();
  const ids = new Set(store.access[key] || []);
  ids.add(projectId);
  await writeLocal({
    ...store,
    access: { ...store.access, [key]: Array.from(ids) },
  });
}

export async function hasLocalAccess(
  wallet: string,
  project: Project,
): Promise<boolean> {
  if (project.owner.toLowerCase() === wallet.toLowerCase()) return true;
  const store = await readLocal();
  return Boolean(store.access[wallet.toLowerCase()]?.includes(project.id));
}
