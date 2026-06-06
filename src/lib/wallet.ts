"use client";

import { ethers } from "ethers";
import type { WalletType } from "@/types";

export const INJECTIVE_EVM_TESTNET = {
  chainId: "0x59f",
  chainName: "Injective EVM Testnet",
  rpcUrls: ["https://k8s.testnet.json-rpc.injective.network/"],
  nativeCurrency: {
    name: "Injective",
    symbol: "INJ",
    decimals: 18,
  },
  blockExplorerUrls: ["https://testnet.blockscout.injective.network/"],
};

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        handler: (...args: unknown[]) => void,
      ) => void;
    };
  }
}

function requireEthereum() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is required. Install MetaMask and try again.");
  }
  return window.ethereum;
}

export async function detectAvailable(): Promise<WalletType[]> {
  return typeof window !== "undefined" && window.ethereum ? ["metamask"] : [];
}

export async function ensureInjectiveNetwork() {
  const ethereum = requireEthereum();
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: INJECTIVE_EVM_TESTNET.chainId }],
    });
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code !== 4902) throw err;
    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [INJECTIVE_EVM_TESTNET],
    });
  }
}

export async function getBrowserProvider() {
  requireEthereum();
  await ensureInjectiveNetwork();
  return new ethers.BrowserProvider(window.ethereum!);
}

export async function connect(type: WalletType): Promise<{ address: string }> {
  if (type !== "metamask") throw new Error("Only MetaMask is supported.");
  const provider = await getBrowserProvider();
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return { address: await signer.getAddress() };
}

export async function readBalance(address: string): Promise<string> {
  const provider = await getBrowserProvider();
  const balance = await provider.getBalance(address);
  return Number(ethers.formatEther(balance)).toFixed(4);
}

export async function signWalletMessage(message: string): Promise<string> {
  const provider = await getBrowserProvider();
  const signer = await provider.getSigner();
  return signer.signMessage(message);
}

export function shortAddress(addr: string | null | undefined): string {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
