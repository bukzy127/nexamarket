import { NextResponse } from "next/server";
import { verifyWalletSignature } from "@/lib/server/auth";
import { getProject } from "@/lib/server/projectStore";
import { verifyProjectAccess } from "@/lib/server/injectiveAccess";

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
    return NextResponse.json({ error: "access denied" }, { status: 403 });
  }

  return NextResponse.json({
    fileUrl: project.fileUrl,
    fileName: project.fileName,
    storagePath: project.storagePath,
  });
}
