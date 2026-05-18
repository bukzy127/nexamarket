import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "project-files";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const owner = String(form.get("owner") || "");

    if (!file || !owner) {
      return NextResponse.json(
        { error: "file and owner are required" },
        { status: 400 },
      );
    }
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: "Supabase storage environment is not configured" },
        { status: 500 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = slugify(file.name) || "project-file";
    const safeOwner = slugify(owner);
    const storagePath = `project-assets/${safeOwner}/${Date.now()}-${safeName}`;
    const encodedPath = storagePath.split("/").map(encodeURIComponent).join("/");
    const baseUrl = SUPABASE_URL.replace(/\/$/, "");
    const uploadUrl = `${baseUrl}/storage/v1/object/${SUPABASE_BUCKET}/${encodedPath}`;

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: bytes,
    });

    if (!uploadRes.ok) {
      throw new Error(`Supabase upload failed: ${await uploadRes.text()}`);
    }

    return NextResponse.json({
      url: `${baseUrl}/storage/v1/object/public/${SUPABASE_BUCKET}/${encodedPath}`,
      path: storagePath,
      size: file.size,
      bucket: SUPABASE_BUCKET,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
