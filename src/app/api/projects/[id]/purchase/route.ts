import { NextResponse } from "next/server";
import { verifyWalletSignature } from "@/lib/server/auth";
import { verifyProjectAccess } from "@/lib/server/injectiveAccess";
import { getProject } from "@/lib/server/projectStore";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { wallet, txHash, message, signature } = (await req.json()) as {
    wallet?: string;
    txHash?: string;
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

  const verified = await verifyProjectAccess(wallet, project);
  if (!verified) {
    return NextResponse.json(
      { error: "purchase is not confirmed on Injective yet" },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, txHash: txHash || null });
}
