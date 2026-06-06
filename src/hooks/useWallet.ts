"use client";

import { create } from "zustand";
import type { WalletState, WalletType } from "@/types";
import { connect as walletConnect, shortAddress } from "@/lib/wallet";

interface WalletStore extends WalletState {
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  short: () => string;
}

const STORAGE_KEY = "nexamarket:wallet";

function persisted(): Partial<WalletState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<WalletState>) : {};
  } catch {
    return {};
  }
}

function persist(state: WalletState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Generate a plausible-looking mock balance for the dashboard. */
function mockBalance(): string {
  return (Math.random() * 50 + 5).toFixed(3);
}

export const useWallet = create<WalletStore>((set, get) => {
  const initial = persisted();
  return {
    address: initial.address ?? null,
    type: initial.type ?? null,
    balance: initial.balance ?? null,
    connected: Boolean(initial.address),

    async connect(type) {
      const { address } = await walletConnect(type);
      const state: WalletState = {
        address,
        type,
        balance: mockBalance(),
        connected: true,
      };
      persist(state);
      set(state);
    },

    disconnect() {
      const state: WalletState = { address: null, type: null, balance: null, connected: false };
      persist(state);
      set(state);
    },

    async refreshBalance() {
      if (!get().address) return;
      set({ balance: mockBalance() });
    },

    short() {
      return shortAddress(get().address);
    },
  };
});
