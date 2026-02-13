"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface WalletState {
  address: string | null;
  publicKey: string | null;
  walletType: string | null;
  isConnecting: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  shortAddress: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

const STORAGE_KEY = "x402pay_wallet_address";
const STORAGE_KEY_PK = "x402pay_wallet_pk";
const STORAGE_KEY_TYPE = "x402pay_wallet_type";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    publicKey: null,
    walletType: null,
    isConnecting: false,
    error: null,
  });

  // Restore wallet from session storage on mount
  useEffect(() => {
    try {
      const savedAddress = sessionStorage.getItem(STORAGE_KEY);
      const savedPK = sessionStorage.getItem(STORAGE_KEY_PK);
      const savedType = sessionStorage.getItem(STORAGE_KEY_TYPE);
      if (savedAddress) {
        setState((prev) => ({
          ...prev,
          address: savedAddress,
          publicKey: savedPK,
          walletType: savedType,
        }));
      }
    } catch {
      // sessionStorage not available
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const { request, AddressPurpose } = await import("sats-connect");

      const response: any = await (request as any)("wallet_connect", {
        message: "Connect to x402Pay for Bitcoin-native content monetization",
      } as any);

      // Handle error response
      if (response?.status === "error") {
        const errorMsg = response?.error?.message || "Unknown error";
        const errorCode = response?.error?.code;
        const err: any = new Error(errorMsg);
        err.code = errorCode;
        throw err;
      }

      // Handle success response
      if (response?.status === "success" && response?.result?.addresses) {
        const addresses = response.result.addresses;

        const stacksAddress = addresses.find(
          (addr: any) =>
            addr.purpose === AddressPurpose.Stacks ||
            addr.addressType === "stacks"
        ) || addresses[0];

        if (stacksAddress?.address) {
          const walletData = {
            address: stacksAddress.address,
            publicKey: stacksAddress.publicKey || null,
            walletType: response.result.walletType || "software",
          };

          setState((prev) => ({
            ...prev,
            ...walletData,
            isConnecting: false,
          }));

          // Persist to session storage
          try {
            sessionStorage.setItem(STORAGE_KEY, walletData.address);
            if (walletData.publicKey) sessionStorage.setItem(STORAGE_KEY_PK, walletData.publicKey);
            if (walletData.walletType) sessionStorage.setItem(STORAGE_KEY_TYPE, walletData.walletType);
          } catch {
            // sessionStorage not available
          }
          return;
        }
      }

      throw new Error("No Stacks addresses found in wallet");
    } catch (err: any) {
      let errorMessage: string;

      if (err.code === -32002 || err.message?.includes("Access denied")) {
        errorMessage = "Connection cancelled. Please approve the request in your wallet.";
      } else if (err.message?.includes("not installed")) {
        errorMessage = "Please install Xverse or Leather wallet extension.";
      } else {
        errorMessage = err.message || "Failed to connect wallet";
      }

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setState({
      address: null,
      publicKey: null,
      walletType: null,
      isConnecting: false,
      error: null,
    });

    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY_PK);
      sessionStorage.removeItem(STORAGE_KEY_TYPE);
    } catch {
      // sessionStorage not available
    }
  }, []);

  const shortAddress = state.address
    ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
    : null;

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connectWallet,
        disconnectWallet,
        shortAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
