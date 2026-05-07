"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SAMPLE_PROJECTS } from "@/lib/mock";
import type { Category, Project } from "@/types";

const PROJECTS_KEY = "nexamarket:firebase-projects";
const PURCHASES_KEY = "nexamarket:purchases";
const CATALOG_EVENT = "nexamarket:catalog-updated";

export interface UploadedProjectInput {
  title: string;
  description: string;
  category: Category;
  price: number;
  tags: string[];
  owner: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  storagePath: string;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(CATALOG_EVENT));
}

function readUploadedProjects(): Project[] {
  return readJson<Project[]>(PROJECTS_KEY, []);
}

function readPurchases(): Record<string, number[]> {
  return readJson<Record<string, number[]>>(PURCHASES_KEY, {});
}

function normalizeAddress(addr: string | null | undefined): string {
  return (addr || "").toLowerCase();
}

function nextColor(id: number): string {
  const colors = ["#0d2040", "#1a0d40", "#0d3020", "#2d1a00", "#001a2d"];
  return colors[id % colors.length];
}

export function createUploadedProject(input: UploadedProjectInput): Project {
  const now = new Date().toISOString();
  const id = Date.now();
  return {
    id,
    title: input.title,
    description: input.description,
    category: input.category,
    price: input.price,
    owner: input.owner,
    creator: input.owner,
    rating: 0,
    reviews: 0,
    tags: input.tags,
    preview: nextColor(id),
    featured: false,
    sales: 0,
    fileUrl: input.fileUrl,
    fileName: input.fileName,
    fileSize: input.fileSize,
    storageProvider: "firebase",
    storagePath: input.storagePath,
    createdAt: now,
    updatedAt: now,
  };
}

export function useProjectCatalog(walletAddress?: string | null) {
  const [uploadedProjects, setUploadedProjects] = useState<Project[]>([]);
  const [serverProjects, setServerProjects] = useState<Project[]>([]);
  const [purchases, setPurchases] = useState<Record<string, number[]>>({});

  const refresh = useCallback(() => {
    setUploadedProjects(readUploadedProjects());
    setPurchases(readPurchases());
  }, []);

  useEffect(() => {
    refresh();
    void fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : { projects: [] }))
      .then((data: { projects?: Project[] }) => {
        setServerProjects(data.projects || []);
      })
      .catch(() => setServerProjects([]));
    window.addEventListener(CATALOG_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CATALOG_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const projects = useMemo(() => {
    const byId = new Map<number, Project>();
    [...SAMPLE_PROJECTS, ...serverProjects, ...uploadedProjects].forEach(
      (project) => {
        byId.set(project.id, project);
      },
    );
    return Array.from(byId.values()).reverse();
  }, [serverProjects, uploadedProjects]);

  const walletKey = normalizeAddress(walletAddress);

  const addProject = useCallback((project: Project) => {
    const next = [project, ...readUploadedProjects()];
    writeJson(PROJECTS_KEY, next);
    setUploadedProjects(next);
  }, []);

  const markPurchased = useCallback(
    (projectId: number) => {
      if (!walletKey) return;
      const current = readPurchases();
      const owned = new Set(current[walletKey] || []);
      owned.add(projectId);
      const next = { ...current, [walletKey]: Array.from(owned) };
      writeJson(PURCHASES_KEY, next);
      setPurchases(next);
    },
    [walletKey],
  );

  const hasAccess = useCallback(
    (project: Project | undefined) => {
      if (!project || !walletKey) return false;
      if (normalizeAddress(project.owner) === walletKey) return true;
      return Boolean(purchases[walletKey]?.includes(project.id));
    },
    [purchases, walletKey],
  );

  const ownedProjects = useMemo(
    () => projects.filter((project) => hasAccess(project)),
    [hasAccess, projects],
  );

  const findProject = useCallback(
    (id: number | string) => {
      const numericId = typeof id === "string" ? Number(id) : id;
      return projects.find((project) => project.id === numericId);
    },
    [projects],
  );

  return {
    projects,
    uploadedProjects,
    ownedProjects,
    addProject,
    markPurchased,
    hasAccess,
    findProject,
  };
}
