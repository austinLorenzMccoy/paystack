"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ArrowLeft } from "lucide-react";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { useWallet } from "@/contexts/wallet-context";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, index + 1).join("/"),
    isLast: index === segments.length - 1,
  }));
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const { address } = useWallet();

  return (
    <header className="flex items-center justify-between border-b-2 border-border bg-charcoal px-4 py-3 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-foreground lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:block">
          <ol className="flex items-center gap-2 font-mono text-sm">
            <li>
              <Link href="/" className="text-bitcoin-orange transition-colors hover:text-bitcoin-orange/80">
                Home
              </Link>
            </li>
            {breadcrumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-2">
                <span className="text-slate-custom" aria-hidden="true">{">"}</span>
                {crumb.isLast ? (
                  <span className="text-fog" aria-current="page">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-fog transition-colors hover:text-foreground">
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-stacks-purple px-3 py-1.5 font-mono text-xs uppercase text-foreground">
          <span className="inline-block h-2 w-2 bg-success-green" aria-hidden="true" />
          Testnet
        </div>
        {address ? (
          <div className="relative hidden sm:block">
            <WalletConnectButton variant="compact" />
          </div>
        ) : (
          <div className="hidden sm:block">
            <WalletConnectButton variant="compact" />
          </div>
        )}
        <Link
          href="/"
          className="flex items-center gap-1 font-mono text-sm uppercase text-bitcoin-orange transition-colors hover:text-bitcoin-orange/80"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Home</span>
        </Link>
      </div>
    </header>
  );
}
