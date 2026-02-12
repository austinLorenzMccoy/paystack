"use client";

import { useState } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { Wallet, LogOut, Copy, Check, AlertTriangle } from "lucide-react";

interface WalletConnectButtonProps {
  variant?: "primary" | "header" | "compact";
}

export function WalletConnectButton({ variant = "primary" }: WalletConnectButtonProps) {
  const { address, shortAddress, isConnecting, error, connectWallet, disconnectWallet } = useWallet();
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Connected state
  if (address) {
    if (variant === "compact") {
      return (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 border-2 border-border bg-concrete px-3 py-1.5 font-mono text-xs text-foreground transition-all hover:border-bitcoin-orange"
          >
            <span className="inline-block h-2 w-2 bg-success-green" aria-hidden="true" />
            {shortAddress}
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} aria-hidden="true" />
              <div className="absolute right-0 top-full z-50 mt-1 w-56 border-2 border-border bg-charcoal">
                <div className="border-b border-border px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-fog">Connected</p>
                  <p className="mt-1 break-all font-mono text-xs text-foreground">{address}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { handleCopy(); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 font-mono text-xs uppercase text-foreground transition-colors hover:bg-concrete"
                >
                  {copied ? <Check size={14} className="text-success-green" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy Address"}
                </button>
                <button
                  type="button"
                  onClick={() => { disconnectWallet(); setShowMenu(false); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 font-mono text-xs uppercase text-error-red transition-colors hover:bg-concrete"
                >
                  <LogOut size={14} />
                  Disconnect
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 border-2 border-border bg-concrete px-4 py-2.5 font-mono text-sm text-foreground transition-all hover:border-bitcoin-orange"
          aria-label="Copy wallet address"
        >
          <Wallet size={16} className="text-success-green" />
          {shortAddress}
          {copied ? <Check size={14} className="text-success-green" /> : <Copy size={14} className="text-slate-custom" />}
        </button>
        <button
          type="button"
          onClick={disconnectWallet}
          className="border-2 border-border bg-concrete p-2.5 text-foreground transition-all hover:border-error-red hover:text-error-red"
          aria-label="Disconnect wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  // Disconnected state
  if (variant === "compact") {
    return (
      <div>
        <button
          type="button"
          onClick={connectWallet}
          disabled={isConnecting}
          className="flex items-center gap-2 border-2 border-bitcoin-orange bg-bitcoin-orange px-3 py-1.5 font-mono text-xs font-bold uppercase text-background transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#000] disabled:pointer-events-none disabled:opacity-60"
        >
          <Wallet size={14} />
          {isConnecting ? "Connecting..." : "Connect"}
        </button>
        {error && (
          <div className="absolute right-0 top-full z-50 mt-1 w-64 border-2 border-error-red bg-charcoal p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-error-red" />
              <p className="font-mono text-xs text-error-red">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === "header") {
    return (
      <button
        type="button"
        onClick={connectWallet}
        disabled={isConnecting}
        className="border-3 border-background bg-bitcoin-orange px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-background transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] disabled:pointer-events-none disabled:opacity-60"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={connectWallet}
        disabled={isConnecting}
        className="flex items-center gap-3 border-3 border-background bg-bitcoin-orange px-8 py-4 font-mono text-sm font-bold uppercase tracking-wider text-background transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] disabled:pointer-events-none disabled:opacity-60"
      >
        <Wallet size={18} />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && (
        <div className="mt-3 flex items-start gap-2 border-2 border-error-red bg-charcoal p-3">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-error-red" />
          <p className="font-mono text-xs text-error-red">{error}</p>
        </div>
      )}
    </div>
  );
}
