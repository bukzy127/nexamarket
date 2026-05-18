"use client";

import { ethers } from "ethers";
import type { Project } from "@/types";
import { NEXA_MARKET_ACCESS_ABI } from "@/lib/contractAbi";
import { ensureInjectiveNetwork, getBrowserProvider } from "@/lib/wallet";

export interface ChainTxResult {
  txHash: string;
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT;

function requireContractAddress(): string {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "NEXT_PUBLIC_MARKETPLACE_CONTRACT is missing. Deploy NexaMarketAccess.sol on Injective EVM Testnet and add its address to .env.local.",
    );
  }
  return CONTRACT_ADDRESS;
}

async function signerContract() {
  await ensureInjectiveNetwork();
  const provider = await getBrowserProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(
    requireContractAddress(),
    NEXA_MARKET_ACCESS_ABI,
    signer,
  );
}

export function injToWei(price: number): bigint {
  const priceAsString = String(price);
  return ethers.parseEther(priceAsString);
}

export async function registerProjectOnChain(
  project: Project,
): Promise<ChainTxResult> {
  const marketplace = await signerContract();
  const projectPrice = injToWei(project.price);
  const tx = await marketplace.registerProject(
    BigInt(project.id),
    projectPrice,
    project.storagePath || "",
  );
  const receipt = await tx.wait();
  return { txHash: receipt?.hash || tx.hash };
}

export async function purchaseProjectOnChain(
  project: Project,
): Promise<ChainTxResult> {
  const marketplace = await signerContract();
  const projectPrice = injToWei(project.price);
  const tx = await marketplace.purchase(BigInt(project.id), {
    value: projectPrice,
  });
  const receipt = await tx.wait();
  return { txHash: receipt?.hash || tx.hash };
}
