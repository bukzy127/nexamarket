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

export interface IpfsPinResult {
  cid: string;
  size: number;
  gateway: string;
  pinnedAt: string;
}

/**
 * Pin a file already uploaded to Supabase (or any HTTPS URL) to IPFS via the
 * server-side Pinata route. Returns the CID + public gateway URL.
 */
export async function pinFileToIpfs(args: {
  fileUrl: string;
  fileName: string;
  contentType?: string;
  owner: string;
  projectId?: string | number;
}): Promise<IpfsPinResult> {
  const res = await fetch("/api/storage/pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "IPFS pinning failed.");
  }

  return res.json();
}
