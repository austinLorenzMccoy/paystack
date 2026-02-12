"use client";

import { useState } from "react";
import { Check, Copy, Zap, Wallet, Shield, Layers } from "lucide-react";
import Link from "next/link";

const assets = [
  {
    key: "sbtc",
    label: "sBTC",
    tagline: "Bitcoin security, L2 speed",
    details: ["Multi-sig settlement", "Bridged via x402", "Ideal for premium drops"],
  },
  {
    key: "stx",
    label: "STX",
    tagline: "Programmable yield",
    details: ["Stacks smart contracts", "Stacking rewards", "Low-fee paywall"],
  },
  {
    key: "usdcx",
    label: "USDCx",
    tagline: "Stable payout rail",
    details: ["Fiat parity", "Daily settlement", "Great for subscriptions"],
  },
];

const steps = [
  {
    title: "Install",
    description: "Install the SDK and import the Paywall primitives.",
    code: "pnpm add @paystack/sdk",
  },
  {
    title: "Configure",
    description: "Register content + assets in Supabase or via Edge Functions.",
    code: "paystack.register({ contentId, asset, price })",
  },
  {
    title: "Launch",
    description: "Drop the PaywallButton or use the REST hooks for agents.",
    code: "<PaywallButton contentId=\"pro-pack\" asset=\"STX\" />",
  },
];

const checklist = [
  "Hiro Wallet connected & signature verified",
  "Content registered in revenue-split Clarity map",
  "Supabase access_grants policy enabled",
  "Analytics processor Edge Function deployed",
];

export default function DocsPage() {
  const [copied, setCopied] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `import { PaywallButton } from '@paystack/sdk'\n\n<PaywallButton\n  contentId="${selectedAsset.label.toLowerCase()}-drop"\n  asset="${selectedAsset.label}"\n  price={0.001}\n/>`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b-2 border-border bg-charcoal/70 px-6 py-12 lg:px-10">
        <p className="text-xs uppercase tracking-[0.5em] text-fog">Documentation</p>
        <h1 className="mt-4 font-mono text-4xl font-black uppercase leading-tight text-bitcoin-orange md:text-5xl">
          Wire Bitcoin-native paywalls in minutes.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-fog">
          This SDK syncs your Supabase tables, analytics Edge Function, and Clarity revenue splits into a single integration surface. Select an asset rail below and drop the component anywhere React renders.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link href="/dashboard" className="btn-brutalist border-bitcoin-orange bg-bitcoin-orange text-background">
            Launch Dashboard
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="btn-brutalist border-stacks-purple text-foreground"
          >
            View GitHub Examples
          </a>
        </div>
      </div>

      <section className="grid gap-6 px-6 py-12 lg:grid-cols-[2fr_1fr] lg:px-10">
        <div className="card-brutalist p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-fog">SDK Quickstart</p>
          <div className="mt-6 space-y-6">
            {steps.map((step, index) => (
              <div key={step.title} className="border border-border p-4">
                <div className="flex items-center gap-3 text-bitcoin-orange">
                  <span className="font-mono text-lg font-black">0{index + 1}</span>
                  <h3 className="font-mono text-lg uppercase">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm text-fog">{step.description}</p>
                <pre className="mt-3 overflow-x-auto bg-concrete px-4 py-2 font-mono text-xs text-success-green">
                  {step.code}
                </pre>
              </div>
            ))}
          </div>
        </div>

        <div className="card-brutalist flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3 text-success-green">
            <Shield size={18} />
            <span className="text-xs uppercase tracking-[0.4em]">Security Checklist</span>
          </div>
          <ul className="space-y-3 text-sm text-foreground">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check size={16} className="text-success-green" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 px-6 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <div className="card-brutalist p-6">
          <div className="flex flex-wrap gap-3">
            {assets.map((asset) => (
              <button
                key={asset.key}
                type="button"
                onClick={() => setSelectedAsset(asset)}
                className={`btn-brutalist border ${
                  selectedAsset.key === asset.key
                    ? "border-bitcoin-orange text-bitcoin-orange"
                    : "border-border text-foreground"
                }`}
              >
                {asset.label}
              </button>
            ))}
          </div>
          <div className="mt-6 border border-border p-4 text-sm text-foreground">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-fog">{selectedAsset.label} Rail</p>
            <p className="mt-2 text-base text-bitcoin-orange">{selectedAsset.tagline}</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-fog">
              {selectedAsset.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
          <div className="mt-6 border border-border bg-charcoal text-sm">
            <div className="border-b border-border px-4 py-2 font-mono text-xs uppercase tracking-[0.4em] text-fog">
              Drop-in Component
            </div>
            <pre className="relative px-4 py-4 font-mono text-[13px] leading-6 text-success-green">
{`import { PaywallButton } from '@paystack/sdk'

<PaywallButton
  contentId="${selectedAsset.label.toLowerCase()}-drop"
  asset="${selectedAsset.label}"
  price={0.001}
/>`}
              <button
                type="button"
                onClick={handleCopy}
                className="absolute right-4 top-3 text-fog hover:text-foreground"
                aria-label="Copy snippet"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </pre>
          </div>
        </div>

        <div className="card-brutalist flex flex-col gap-4 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-fog">End-to-end flow</p>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 border border-border p-3">
              <Wallet size={18} className="text-success-green" />
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-success-green">Signal</p>
                <p className="text-fog">User or AI agent signs a Hiro wallet intent.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border border-border p-3">
              <Layers size={18} className="text-bitcoin-orange" />
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-bitcoin-orange">Contract</p>
                <p className="text-fog">Revenue-split Clarity contract settles + logs analytics event.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border border-border p-3">
              <Zap size={18} className="text-warning-yellow" />
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-warning-yellow">Access</p>
                <p className="text-fog">Supabase grants access, SDK unlocks premium content instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
