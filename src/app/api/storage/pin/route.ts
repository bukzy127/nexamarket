import { NextResponse } from "next/server";
import { pinFileToIpfs } from "@/lib/pinata";

export const runtime = "nodejs";
// Pinning a 100-300 MB file can exceed the default 15s budget on hosted
// runtimes. Give the route a 60s timeout when possible.
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const owner = String(form.get("owner") || "");
    const projectId = String(form.get("projectId") || "");
    const kind = String(form.get("kind") || "project");

    if (!file || !owner) {
      return NextResponse.json(
        { error: "file and owner are required" },
        { status: 400 },
      );
    }

    const result = await pinFileToIpfs(
      await file.arrayBuffer(),
      file.name,
      file.type || "application/octet-stream",
      {
        owner,
        ...(projectId ? { projectId: String(projectId) } : {}),
        kind,
        source: "nexamarket-direct-upload",
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
