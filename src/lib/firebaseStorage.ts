"use client";

export interface FirebaseUploadResult {
  url: string;
  path: string;
  size: number;
  bucket: string;
}

const FIREBASE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildPath(file: File, owner: string | null | undefined): string {
  const safeOwner = slugify(owner || "anonymous");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeName = slugify(file.name) || "project-file";
  return `project-assets/${safeOwner}/${stamp}-${safeName}`;
}

function downloadUrl(bucket: string, path: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
    path,
  )}?alt=media`;
}

function mockUpload(file: File, path: string): FirebaseUploadResult {
  return {
    url: `mock-firebase-storage://${path}`,
    path,
    size: file.size,
    bucket: "local-demo",
  };
}

/**
 * Uploads directly to Firebase Storage when NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * is configured. Without Firebase config, it returns a mock Firebase-style URL
 * so the ownership-gated frontend flow remains testable.
 */
export async function uploadToFirebaseStorage(
  file: File,
  owner: string | null | undefined,
): Promise<FirebaseUploadResult> {
  const path = buildPath(file, owner);

  if (!FIREBASE_BUCKET) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return mockUpload(file, path);
  }

  const endpoint = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o?uploadType=media&name=${encodeURIComponent(
    path,
  )}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`Firebase upload failed: ${await res.text()}`);
  }

  return {
    url: downloadUrl(FIREBASE_BUCKET, path),
    path,
    size: file.size,
    bucket: FIREBASE_BUCKET,
  };
}
