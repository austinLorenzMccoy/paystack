"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function Hero() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `import { PaywallButton } from '@x402pay/sdk'\n\n<PaywallButton\n  contentId="article-1"\n  price={0.10}\n  asset="STX"\n/>`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden grid-overlay">
      {/* Background layers */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(26,26,26,0.85) 100%)`,
        }}
        aria-hidden="true"
      />
      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <h1 className="mb-8 font-mono text-4xl font-extrabold uppercase leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          <span
            className="block text-bitcoin-orange"
            style={{ animation: "fade-in-up 0.6s ease-out backwards" }}
          >
            One Line of Code.
          </span>
          <span
            className="block text-stacks-purple"
            style={{ animation: "fade-in-up 0.6s ease-out 0.2s backwards" }}
          >
            Bitcoin-Native Payments.
          </span>
          <span
            className="block text-foreground"
            style={{ animation: "fade-in-up 0.6s ease-out 0.4s backwards" }}
          >
            Creator-First Monetization.
          </span>
        </h1>

        <p
          className="mx-auto mb-10 max-w-2xl text-lg text-fog"
          style={{ animation: "fade-in-up 0.6s ease-out 0.5s backwards" }}
        >
          The first Bitcoin-native SDK for content monetization. Built on Stacks.
          Powered by x402.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animation: "fade-in-up 0.6s ease-out 0.6s backwards" }}>
          <Link href="/dashboard" className="btn-brutalist border-bitcoin-orange bg-bitcoin-orange text-background">
            Launch Dashboard
          </Link>
          <Link href="/docs" className="btn-brutalist border-stacks-purple text-foreground">
            Read SDK Docs
          </Link>
        </div>

        {/* Code Block + AI Agents */}
        <div className="grid gap-4 pt-12 lg:grid-cols-[2fr_1fr]" style={{ animation: "fade-in-up 0.6s ease-out 0.8s backwards" }}>
          <div className="relative mx-auto w-full max-w-2xl border-2 border-border bg-charcoal text-left">
            <div className="h-1 w-full bg-bitcoin-orange" aria-hidden="true" />
            <button
              type="button"
              onClick={handleCopy}
              className="absolute right-3 top-4 text-slate-custom transition-colors hover:text-foreground"
              aria-label="Copy code"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <div className="p-6 font-mono text-sm leading-relaxed">
              <div className="text-fog">
                {"$ npm install @x402pay/sdk"}
              </div>
              <div className="mt-4 text-slate-custom">
                {"// Add payment to any content"}
              </div>
              <div className="text-stacks-purple">
                {"<PaywallButton"}
              </div>
              <div className="pl-4 text-success-green">
                {'contentId="article-1"'}
              </div>
              <div className="pl-4 text-success-green">
                {"price={0.10}"}
              </div>
              <div className="pl-4 text-success-green">
                {'asset="STX"'}
              </div>
              <div className="text-stacks-purple">
                {"/>"}
                <span className="ml-0.5 inline-block h-4 w-2 bg-bitcoin-orange" style={{ animation: "blink 1s infinite" }} />
              </div>
            </div>
          </div>

          <div className="card-brutalist p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-fog">AI Agent Indicator</p>
            <p className="mt-2 text-sm text-fog">Realtime dataplane pulling from analytics-processor.</p>
            <div className="mt-6 text-5xl font-black text-success-green">
              22%
            </div>
            <p className="text-xs uppercase text-success-green">of payments in the last hour</p>
            <div className="mt-4 border border-border p-3 text-xs text-foreground">
              Hiro · BRC-20 Agents · Custom GPTs
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
