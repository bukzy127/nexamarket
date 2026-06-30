import { NextResponse } from "next/server";
import { verifyWalletSignature } from "@/lib/server/auth";
import { getProfile, saveProfile } from "@/lib/server/appStore";

export const runtime = "nodejs";

function profileError(err: unknown): string {
  const message =
    err instanceof Error ? err.message : "Unable to access the user profile";
  if (
    message.includes("public.profiles") ||
    message.toLowerCase().includes("schema cache")
  ) {
    return "Username storage is not set up yet. Run supabase/feature_update.sql in the Supabase SQL editor.";
  }
  return message;
}

export async function GET(
  _req: Request,
  { params }: { params: { wallet: string } },
) {
  try {
    return NextResponse.json({ profile: await getProfile(params.wallet) });
  } catch (err) {
    return NextResponse.json(
      { error: profileError(err) },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { wallet: string } },
) {
  try {
    const { username, message, signature } = (await req.json()) as {
      username?: string;
      message?: string;
      signature?: string;
    };
    const clean = (username || "").trim();
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(clean)) {
      return NextResponse.json(
        { error: "Username must be 3–24 letters, numbers, or underscores." },
        { status: 400 },
      );
    }
    if (!message || !signature) {
      return NextResponse.json(
        { error: "Wallet signature is required." },
        { status: 400 },
      );
    }
    verifyWalletSignature(params.wallet, message, signature);
    if (
      !message.includes(params.wallet) ||
      !message.includes(`Username: ${clean}`)
    ) {
      return NextResponse.json(
        { error: "The signed username request is invalid." },
        { status: 400 },
      );
    }
    return NextResponse.json({
      profile: await saveProfile(params.wallet, clean),
    });
  } catch (err) {
    const message = profileError(err);
    const conflict = message.toLowerCase().includes("duplicate");
    return NextResponse.json(
      { error: conflict ? "That username is already taken." : message },
      { status: conflict ? 409 : 500 },
    );
  }
}
