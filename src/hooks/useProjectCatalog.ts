"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Category, Project } from "@/types";

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

function normalizeAddress(addr: string | null | undefined): string {
  return (addr || "").toLowerCase();
}

function nextColor(id: number): string {
  const colors = ["#0d2040", "#1a0d40", "#0d3020", "#2d1a00", "#001a2d"];
  return colors[id % colors.length];
}

function publicCopy(project: Project): Project {
  const { fileUrl: _fileUrl, storagePath: _storagePath, ...safeProject } =
    project;
  return safeProject;
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
    storageProvider: "supabase",
    storagePath: input.storagePath,
    createdAt: now,
    updatedAt: now,
  };
}

export function useProjectCatalog(walletAddress?: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);

  const refresh = useCallback(() => {
    void fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : { projects: [] }))
      .then((data: { projects?: Project[] }) => {
        setProjects(data.projects || []);
      })
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(CATALOG_EVENT, refresh);
    return () => window.removeEventListener(CATALOG_EVENT, refresh);
  }, [refresh]);

  const walletKey = normalizeAddress(walletAddress);

  const addProject = useCallback((project: Project) => {
    setProjects((current) => [publicCopy(project), ...current]);
    window.dispatchEvent(new Event(CATALOG_EVENT));
  }, []);

  const markPurchased = useCallback(() => {
    window.dispatchEvent(new Event(CATALOG_EVENT));
  }, []);

  const hasAccess = useCallback(
    (project: Project | undefined) => {
      if (!project || !walletKey) return false;
      return normalizeAddress(project.owner) === walletKey;
    },
    [walletKey],
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
    uploadedProjects: projects,
    ownedProjects,
    addProject,
    markPurchased,
    hasAccess,
    findProject,
  };
}
