import { NextResponse } from "next/server";
import { hasContractConfig, verifyProjectAccess } from "@/lib/server/injectiveAccess";
import { getProject, grantLocalAccess } from "@/lib/server/projectStore";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { wallet, txHash } = (await req.json()) as {
    wallet?: string;
    txHash?: string;
  };
  const id = Number(params.id);

  if (!wallet) {
    return NextResponse.json({ error: "wallet is required" }, { status: 400 });
  }

  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }

  if (hasContractConfig()) {
    const verified = await verifyProjectAccess(wallet, project);
    if (!verified) {
      return NextResponse.json(
        { error: "purchase is not confirmed on Injective yet" },
        { status: 409 },
      );
    }
  } else {
    await grantLocalAccess(wallet, id);
  }

  return NextResponse.json({ ok: true, txHash: txHash || null });
}
