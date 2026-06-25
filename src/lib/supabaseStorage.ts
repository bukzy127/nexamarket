"use client";

export interface IpfsPinResult {
  cid: string;
  size: number;
  gateway: string;
  pinnedAt: string;
}

/**
 * Upload and pin a browser File directly to IPFS through the server-side
 * Pinata route. The Pinata credential never reaches the browser.
 */
export async function pinFileToIpfs(args: {
  file: File;
  owner: string;
  projectId?: string | number;
  kind?: "project" | "preview";
}): Promise<IpfsPinResult> {
  const form = new FormData();
  form.append("file", args.file);
  form.append("owner", args.owner);
  if (args.projectId) form.append("projectId", String(args.projectId));
  if (args.kind) form.append("kind", args.kind);

  const res = await fetch("/api/storage/pin", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "IPFS pinning failed.");
  }

  return res.json();
}
