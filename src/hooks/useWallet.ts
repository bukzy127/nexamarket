"use client";

import { create } from "zustand";
import type { WalletState, WalletType } from "@/types";
import {
  connect as walletConnect,
  readBalance,
  shortAddress,
} from "@/lib/wallet";

interface WalletStore extends WalletState {
  username: string | null;
  profileLoaded: boolean;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  setUsername: (username: string) => void;
  short: () => string;
}

export const useWallet = create<WalletStore>((set, get) => {
  return {
    address: null,
    type: null,
    balance: null,
    connected: false,
    username: null,
    profileLoaded: false,

    async connect(type) {
      const { address } = await walletConnect(type);
      const balance = await readBalance(address);
      let username: string | null = null;
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(address)}`);
        if (res.ok) {
          const data = (await res.json()) as {
            profile?: { username?: string } | null;
          };
          username = data.profile?.username || null;
        }
      } catch {
        // Profile setup is optional for preserving wallet connectivity.
      }
      const state: WalletState = {
        address,
        type,
        balance,
        connected: true,
      };
      set({ ...state, username, profileLoaded: true });
    },

    disconnect() {
      const state: WalletState = { address: null, type: null, balance: null, connected: false };
      set({ ...state, username: null, profileLoaded: false });
    },

    async refreshBalance() {
      const address = get().address;
      if (!address) return;
      set({ balance: await readBalance(address) });
    },

    setUsername(username) {
      set({ username });
    },

    short() {
      return shortAddress(get().address);
    },
  };
});
