import { NextResponse } from "next/server";
import { verifyWalletSignature } from "@/lib/server/auth";
import { getProject } from "@/lib/server/projectStore";
import { verifyProjectAccess } from "@/lib/server/injectiveAccess";
import { recordActivity } from "@/lib/server/appStore";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { wallet, message, signature } = (await req.json()) as {
    wallet?: string;
    message?: string;
    signature?: string;
  };
  const id = Number(params.id);

  if (!wallet) {
    return NextResponse.json({ error: "wallet is required" }, { status: 400 });
  }
  if (!message || !signature) {
    return NextResponse.json(
      { error: "message and signature are required" },
      { status: 400 },
    );
  }

  verifyWalletSignature(wallet, message, signature);

  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }

  const hasAccess = await verifyProjectAccess(wallet, project);
  if (!hasAccess) {
    return NextResponse.json(
      { error: "You must purchase this project before downloading." },
      { status: 403 },
    );
  }
  if (!project.fileUrl) {
    return NextResponse.json(
      { error: "project IPFS file URL is missing" },
      { status: 404 },
    );
  }

  await recordActivity({
    wallet,
    type: "download",
    projectId: project.id,
    projectTitle: project.title,
  }).catch(() => undefined);

  return NextResponse.json({
    fileUrl: project.fileUrl,
    downloadUrl: project.fileUrl,
    fileName: project.fileName,
    cid: project.cid,
  });
}
