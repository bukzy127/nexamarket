"use client";

import type { Project } from "@/types";

export interface ChainTxResult {
  txHash: string;
  mock: boolean;
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT;
const MOCK_CHAIN_KEY = "nexamarket:mock-chain-access";

function hasContractConfig(): boolean {
  return Boolean(CONTRACT_ADDRESS);
}

function mockTxHash(prefix: string): string {
  return `${prefix}_${Date.now().toString(16)}_${Math.random()
    .toString(16)
    .slice(2, 10)}`;
}

function readMockAccess(): Record<string, number[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(MOCK_CHAIN_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeMockAccess(access: Record<string, number[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOCK_CHAIN_KEY, JSON.stringify(access));
}

function grantMockAccess(wallet: string, projectId: number) {
  const key = wallet.toLowerCase();
  const access = readMockAccess();
  const ids = new Set(access[key] || []);
  ids.add(projectId);
  writeMockAccess({ ...access, [key]: Array.from(ids) });
}

export function hasMockChainAccess(wallet: string, projectId: number): boolean {
  const access = readMockAccess();
  return Boolean(access[wallet.toLowerCase()]?.includes(projectId));
}

export function injToBaseUnits(price: number): string {
  return BigInt(Math.round(price * 1_000_000_000_000_000_000)).toString();
}

export async function checkWalletBalance(
  balance: string | null | undefined,
  price: number,
): Promise<void> {
  const available = Number(balance || 0);
  if (Number.isFinite(available) && available < price) {
    throw new Error(`Insufficient balance. You need ${price} INJ.`);
  }
}

export async function registerProjectOnChain(
  project: Project,
  walletAddress: string,
): Promise<ChainTxResult> {
  if (!hasContractConfig()) {
    grantMockAccess(walletAddress, project.id);
    return { txHash: mockTxHash("mock_register"), mock: true };
  }

  throw new Error(
    "Injective transaction broadcasting is not configured in the frontend yet. Deploy the contract and wire Keplr/Leap signing with the Injective/CosmJS client.",
  );
}

export async function purchaseProjectOnChain(
  project: Project,
  walletAddress: string,
  balance: string | null | undefined,
): Promise<ChainTxResult> {
  await checkWalletBalance(balance, project.price);

  if (!hasContractConfig()) {
    grantMockAccess(walletAddress, project.id);
    return { txHash: mockTxHash("mock_purchase"), mock: true };
  }

  throw new Error(
    "Injective transaction broadcasting is not configured in the frontend yet. Deploy the contract and wire Keplr/Leap signing with the Injective/CosmJS client.",
  );
}

export function purchaseExecuteMsg(project: Project) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    msg: { purchase: { project_id: String(project.id) } },
    funds: [{ denom: "inj", amount: injToBaseUnits(project.price) }],
  };
}

export function registerExecuteMsg(project: Project) {
  return {
    contractAddress: CONTRACT_ADDRESS,
    msg: {
      register_project: {
        project_id: String(project.id),
        price: injToBaseUnits(project.price),
        metadata_hash: project.storagePath || null,
      },
    },
    funds: [],
  };
}
