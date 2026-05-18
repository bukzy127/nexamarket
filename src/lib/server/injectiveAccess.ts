import { Contract, JsonRpcProvider } from "ethers";
import type { Project } from "@/types";
import { NEXA_MARKET_ACCESS_ABI } from "@/lib/contractAbi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT;
const RPC_URL =
  process.env.INJECTIVE_EVM_RPC_URL ||
  "https://k8s.testnet.json-rpc.injective.network/";

function requireContractAddress(): string {
  if (!CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_MARKETPLACE_CONTRACT is not configured.");
  }
  return CONTRACT_ADDRESS;
}

function contract() {
  const provider = new JsonRpcProvider(RPC_URL);
  return new Contract(
    requireContractAddress(),
    NEXA_MARKET_ACCESS_ABI,
    provider,
  );
}

export async function verifyProjectAccess(
  wallet: string,
  project: Project,
): Promise<boolean> {
  if (!wallet) return false;
  const marketplace = contract();
  return marketplace.hasAccess(BigInt(project.id), wallet);
}
