"use client";

import { create } from "zustand";
import type { WalletState, WalletType } from "@/types";
import {
  connect as walletConnect,
  readBalance,
  shortAddress,
} from "@/lib/wallet";

interface WalletStore extends WalletState {
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  short: () => string;
}

export const useWallet = create<WalletStore>((set, get) => {
  return {
    address: null,
    type: null,
    balance: null,
    connected: false,

    async connect(type) {
      const { address } = await walletConnect(type);
      const balance = await readBalance(address);
      const state: WalletState = {
        address,
        type,
        balance,
        connected: true,
      };
      set(state);
    },

    disconnect() {
      const state: WalletState = { address: null, type: null, balance: null, connected: false };
      set(state);
    },

    async refreshBalance() {
      const address = get().address;
      if (!address) return;
      set({ balance: await readBalance(address) });
    },

    short() {
      return shortAddress(get().address);
    },
  };
});
