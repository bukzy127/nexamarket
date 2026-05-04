/**
 * Frontend IPFS helpers — purely client-side URL building and a placeholder
 * upload that resolves with a fake CID. The real pinning step lives in the
 * backend (see BACKEND.md), but the UI is wired to call this module so it can
 * be swapped in one place.
 */

export const IPFS_GATEWAY = "https://gateway.pinata.cloud";

export function ipfsUrl(cid: string, path = ""): string {
  const trimmed = cid.replace(/^ipfs:\/\//, "");
  return `${IPFS_GATEWAY}/ipfs/${trimmed}${path ? `/${path}` : ""}`;
}

export interface UploadResult {
  cid: string;
  url: string;
  size: number;
}

/**
 * Mock client-side upload. Generates a deterministic-looking CID from the file
 * name + size so the UI has something to render. Replace with a real call to
 * `/api/ipfs` once the backend is wired up.
 */
export async function uploadToIpfs(file: File): Promise<UploadResult> {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
  const seed = `${file.name}-${file.size}-${file.lastModified}`;
  const cid = `bafybei${btoa(seed).replace(/[^a-z0-9]/gi, "").slice(0, 52).toLowerCase().padEnd(52, "x")}`;
  return { cid, url: ipfsUrl(cid), size: file.size };
}
