"use client";

import React from "react"

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, SignalHigh, Activity } from "lucide-react";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { useWallet } from "@/contexts/wallet-context";

const navLinks = [
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "https://github.com", label: "GitHub", external: true },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { address } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-background/90 backdrop-blur-md">
      <div className="grid-overlay">
        <div className="flex items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-mono text-2xl font-black uppercase tracking-[0.6em] text-bitcoin-orange">
            <Image src="/paystack-logo.svg" alt="PayStack logo" width={32} height={32} className="h-8 w-8" />
            PAYSTACK
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {navLinks.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {address ? (
              <Link
                href="/dashboard"
                className="btn-brutalist hidden border-bitcoin-orange bg-bitcoin-orange text-background md:inline-block"
              >
                Launch Dashboard
              </Link>
            ) : (
              <div className="hidden md:block">
                <WalletConnectButton variant="header" />
              </div>
            )}
            <button
              type="button"
              className="text-foreground md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6 border-t-2 border-border bg-charcoal/70 px-6 py-2 text-[11px] font-mono uppercase tracking-[0.4em] text-fog">
          <span className="flex items-center gap-2 text-success-green">
            <SignalHigh size={14} /> Realtime x402 Feed: Online
          </span>
          <span className="hidden items-center gap-2 text-warning-yellow sm:flex">
            <Activity size={14} /> SDK Build 0.9.4-beta
          </span>
          <span className="hidden text-foreground lg:block">Stacked for Creators · Hardened for Agents</span>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t-2 border-border bg-charcoal px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
            {navLinks.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
              >
                {item.label}
              </NavLink>
            ))}
            {address ? (
              <Link
                href="/dashboard"
                className="mt-2 border-3 border-background bg-bitcoin-orange px-6 py-3 text-center font-mono text-sm font-bold uppercase tracking-wider text-background"
                onClick={() => setMobileMenuOpen(false)}
              >
                Launch Dashboard
              </Link>
            ) : (
              <div className="mt-2">
                <WalletConnectButton variant="header" />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
  onClick,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  target?: string;
  rel?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative font-mono text-sm uppercase text-foreground transition-colors"
      onClick={onClick}
      {...props}
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-bitcoin-orange transition-all group-hover:w-full" />
    </Link>
  );
}
