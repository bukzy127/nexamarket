/**
 * Server-side Pinata helpers.
 *
 * Required env:
 *   PINATA_JWT          — admin JWT from Pinata dashboard (scope: pinFileToIPFS, unpin)
 *   PINATA_GATEWAY      — optional host like "gateway.pinata.cloud" or a dedicated subdomain
 *
 * The JWT must NEVER reach the browser; only import this module from `app/api/*` routes.
 */

const PINATA_API = "https://api.pinata.cloud";

export interface PinataPinResult {
  cid: string;
  size: number;
  gateway: string;
  pinnedAt: string;
}

function getJwt(): string {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error(
      "Pinata is not configured. Set PINATA_JWT in .env.local to enable IPFS pinning.",
    );
  }
  return jwt;
}

function getGatewayHost(): string {
  return process.env.PINATA_GATEWAY?.replace(/^https?:\/\//, "").replace(/\/$/, "")
    || "gateway.pinata.cloud";
}

export function ipfsGatewayUrl(cid: string): string {
  return `https://${getGatewayHost()}/ipfs/${cid}`;
}

/**
 * Pin a file (Blob or ArrayBuffer) to IPFS via Pinata.
 *
 * Returns the CID, pinned size in bytes, and a public gateway URL.
 */
export async function pinFileToIpfs(
  bytes: ArrayBuffer,
  fileName: string,
  contentType = "application/octet-stream",
  metadata?: Record<string, string>,
): Promise<PinataPinResult> {
  const jwt = getJwt();
  const form = new FormData();
  // Wrap into a Uint8Array-backed Blob to satisfy the stricter
  // SharedArrayBuffer-aware BlobPart signature in newer TypeScript libs.
  const view = new Uint8Array(bytes);
  const blob = new Blob([view], { type: contentType });
  form.append("file", blob, fileName);

  if (metadata) {
    form.append(
      "pinataMetadata",
      JSON.stringify({
        name: fileName,
        keyvalues: metadata,
      }),
    );
  } else {
    form.append("pinataMetadata", JSON.stringify({ name: fileName }));
  }
  form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Pinata pin failed (${res.status}): ${body || res.statusText}`,
    );
  }

  const data = (await res.json()) as {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
  };

  return {
    cid: data.IpfsHash,
    size: data.PinSize,
    gateway: ipfsGatewayUrl(data.IpfsHash),
    pinnedAt: data.Timestamp,
  };
}

/**
 * Unpin a CID (e.g. when a project listing is removed).
 * Best-effort: errors are swallowed so callers don't break on transient failures.
 */
export async function unpinFromIpfs(cid: string): Promise<boolean> {
  try {
    const jwt = getJwt();
    const res = await fetch(`${PINATA_API}/pinning/unpin/${cid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
