"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import WalletModal from "./WalletModal";

interface Ctx {
  open: () => void;
  close: () => void;
}

const WalletModalCtx = createContext<Ctx>({ open: () => {}, close: () => {} });

export function useWalletModal() {
  return useContext(WalletModalCtx);
}

export default function WalletModalProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);

  const open = useCallback(() => setShow(true), []);
  const close = useCallback(() => setShow(false), []);

  return (
    <WalletModalCtx.Provider value={{ open, close }}>
      {children}
      {show && <WalletModal onClose={close} />}
    </WalletModalCtx.Provider>
  );
}
