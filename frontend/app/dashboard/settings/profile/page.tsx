"use client";

import { User } from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";

export default function ProfilePage() {
  const { address } = useWallet();

  return (
    <div>
      <h1 className="mb-8 font-mono text-3xl font-extrabold uppercase text-foreground">
        Profile
      </h1>

      <div className="max-w-2xl border-2 border-border bg-charcoal p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-bitcoin-orange" />

        {/* Avatar */}
        <div className="mb-8 flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center border-2 border-border bg-concrete">
            <User size={32} className="text-slate-custom" />
          </div>
          <div>
            <button
              type="button"
              className="border-2 border-border bg-concrete px-4 py-2 font-mono text-sm uppercase text-foreground transition-all hover:border-bitcoin-orange"
            >
              Upload Avatar
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="wallet" className="mb-2 block font-mono text-xs uppercase tracking-wider text-fog">
              Wallet Address
            </label>
            <input
              id="wallet"
              type="text"
              value={address || "Not connected"}
              readOnly
              className="w-full border-2 border-border bg-concrete px-4 py-3 font-mono text-sm text-foreground opacity-60"
            />
          </div>

          <div>
            <label htmlFor="displayName" className="mb-2 block font-mono text-xs uppercase tracking-wider text-fog">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              placeholder="Enter display name"
              defaultValue="satoshi_creator"
              className="w-full border-2 border-border bg-concrete px-4 py-3 font-mono text-sm text-foreground placeholder:text-slate-custom focus:border-bitcoin-orange focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block font-mono text-xs uppercase tracking-wider text-fog">
              Email (Optional)
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="w-full border-2 border-border bg-concrete px-4 py-3 font-mono text-sm text-foreground placeholder:text-slate-custom focus:border-bitcoin-orange focus:outline-none"
            />
          </div>

          <button
            type="button"
            className="mt-2 self-start border-3 border-background bg-bitcoin-orange px-8 py-3 font-mono text-sm font-bold uppercase tracking-wider text-background transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_#000]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
