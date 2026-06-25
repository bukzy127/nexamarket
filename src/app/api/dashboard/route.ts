import { NextResponse } from "next/server";
import {
  getUsernames,
  listActivities,
  listPurchases,
} from "@/lib/server/appStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const wallet = new URL(req.url).searchParams.get("wallet");
    if (!wallet) {
      return NextResponse.json({ error: "wallet is required" }, { status: 400 });
    }
    const [{ purchases, sales }, activities] = await Promise.all([
      listPurchases(wallet),
      listActivities(wallet),
    ]);
    const usernames = await getUsernames([
      ...purchases.flatMap((item) => [item.buyer, item.seller]),
      ...sales.flatMap((item) => [item.buyer, item.seller]),
    ]);
    return NextResponse.json({ purchases, sales, activities, usernames });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to load dashboard" },
      { status: 500 },
    );
  }
}
