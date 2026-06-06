/**
 * Frontend-only wallet adapter.
 *
 * Detects whether Keplr / Leap / MetaMask are present and exposes a connect()
 * that returns a wallet address. Signing and on-chain calls are intentionally
 * out of scope here — they belong to the backend integration layer.
 */
import type { WalletType } from "@/types";

export const INJECTIVE_CHAIN_ID = "injective-888"; // testnet by default

declare global {
  interface Window {
    keplr?: KeplrLike;
    leap?: KeplrLike;
    ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
  }
}

interface KeplrLike {
  enable: (chainId: string) => Promise<void>;
  getKey: (chainId: string) => Promise<{ bech32Address: string; name: string }>;
}

export async function detectAvailable(): Promise<WalletType[]> {
  if (typeof window === "undefined") return [];
  const out: WalletType[] = [];
  if (window.keplr) out.push("keplr");
  if (window.leap) out.push("leap");
  if (window.ethereum) out.push("metamask");
  return out;
}

export async function connect(type: WalletType): Promise<{ address: string }> {
  if (typeof window === "undefined") throw new Error("No window");

  if (type === "keplr" || type === "leap") {
    const provider = type === "keplr" ? window.keplr : window.leap;
    if (!provider) {
      // Fall back to a mock address so the UI is still usable in dev.
      return { address: mockInjAddress() };
    }
    await provider.enable(INJECTIVE_CHAIN_ID);
    const key = await provider.getKey(INJECTIVE_CHAIN_ID);
    return { address: key.bech32Address };
  }

  if (type === "metamask") {
    if (!window.ethereum) return { address: mockInjAddress() };
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];
    if (!accounts?.[0]) throw new Error("No account selected");
    return { address: accounts[0] };
  }

  throw new Error(`Unknown wallet type: ${type}`);
}

function mockInjAddress(): string {
  const chars = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  let suffix = "";
  for (let i = 0; i < 38; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `inj1${suffix}`;
}

export function shortAddress(addr: string | null | undefined): string {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
