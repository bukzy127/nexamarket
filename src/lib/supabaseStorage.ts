"use client";

export interface SupabaseUploadResult {
  url: string;
  path: string;
  size: number;
  bucket: string;
}

export async function uploadToSupabaseStorage(
  file: File,
  owner: string,
): Promise<SupabaseUploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("owner", owner);

  const res = await fetch("/api/storage/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Supabase upload failed.");
  }

  return res.json();
}
