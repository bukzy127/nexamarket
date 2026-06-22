import { NextResponse } from "next/server";
import { pinFileToIpfs } from "@/lib/pinata";

export const runtime = "nodejs";
// Pinning a 100-300 MB file can exceed the default 15s budget on hosted
// runtimes. Give the route a 60s timeout when possible.
export const maxDuration = 60;

interface PinRequest {
  /** Public Supabase URL (or any HTTPS URL) of the file to pin. */
  fileUrl: string;
  fileName: string;
  /** Optional content type to forward to Pinata. */
  contentType?: string;
  /** Wallet address of the owner; recorded in Pinata metadata. */
  owner: string;
  /** Optional project id to record in Pinata metadata for later lookups. */
  projectId?: string | number;
}

export async function POST(req: Request) {
  let body: PinRequest;
  try {
    body = (await req.json()) as PinRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fileUrl, fileName, contentType, owner, projectId } = body;
  if (!fileUrl || !fileName || !owner) {
    return NextResponse.json(
      { error: "fileUrl, fileName, and owner are required" },
      { status: 400 },
    );
  }

  try {
    // Pull the file bytes server-side. This stays inside Node and never
    // exposes the Pinata JWT to the browser.
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      return NextResponse.json(
        { error: `Source file fetch failed (${fileRes.status})` },
        { status: 502 },
      );
    }
    const arrayBuffer = await fileRes.arrayBuffer();
    const resolvedContentType =
      contentType ||
      fileRes.headers.get("content-type") ||
      "application/octet-stream";

    const result = await pinFileToIpfs(
      arrayBuffer,
      fileName,
      resolvedContentType,
      {
        owner,
        ...(projectId ? { projectId: String(projectId) } : {}),
        source: "nexamarket-upload",
      },
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Pinning failed" },
      { status: 500 },
    );
  }
}
