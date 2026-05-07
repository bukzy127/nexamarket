import type { Project } from "@/types";
import { hasLocalAccess } from "./projectStore";

interface AccessQueryResponse {
  data?: {
    has_access?: boolean;
  };
}

const CONTRACT_ADDRESS =
  process.env.MARKETPLACE_CONTRACT ||
  process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT;

const LCD_URL =
  process.env.INJECTIVE_LCD_URL ||
  (process.env.NEXT_PUBLIC_INJECTIVE_NETWORK === "mainnet"
    ? "https://sentry.lcd.injective.network"
    : "https://testnet.sentry.lcd.injective.network");

export function hasContractConfig(): boolean {
  return Boolean(CONTRACT_ADDRESS && LCD_URL);
}

function smartQueryUrl(query: object): string {
  const encoded = Buffer.from(JSON.stringify(query), "utf8").toString("base64");
  return `${LCD_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encoded}`;
}

export async function verifyProjectAccess(
  wallet: string,
  project: Project,
): Promise<boolean> {
  if (!wallet) return false;

  if (!hasContractConfig()) {
    return hasLocalAccess(wallet, project);
  }

  const res = await fetch(
    smartQueryUrl({
      has_access: {
        project_id: String(project.id),
        wallet,
      },
    }),
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error(`Injective access query failed: ${await res.text()}`);
  }

  const body = (await res.json()) as AccessQueryResponse;
  return Boolean(body.data?.has_access);
}
