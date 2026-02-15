"use client";

import { useState } from "react";
import { ExternalLink, CheckCircle, Code, Zap } from "lucide-react";

interface Contract {
  name: string;
  description: string;
  txid: string;
  address: string;
  features: string[];
  useCase: string;
}

const contracts: Contract[] = [
  {
    name: "Revenue Split",
    description: "Multi-party revenue sharing with configurable splits",
    txid: "STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-split",
    address: "STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-split",
    features: [
      "Creator/platform/collaborator shares",
      "Per-content configuration",
      "Automatic distribution",
      "Payment history tracking"
    ],
    useCase: "Content creators splitting revenue with collaborators and platform"
  },
  {
    name: "Subscription Manager",
    description: "Recurring billing with monthly/annual plans",
    txid: "0x7f0f6181f3f026e1349e7a1d3d51ed72f0d9828f74a9f5f18567f925eaf94155",
    address: "STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.subscription-manager",
    features: [
      "Monthly/annual billing cycles",
      "Auto-renewal support",
      "Plan management",
      "Subscription cancellation"
    ],
    useCase: "SaaS platforms, newsletters, premium content subscriptions"
  },
  {
    name: "Escrow with Refunds",
    description: "Refundable payments with dispute resolution",
    txid: "0x4698b9114d00dcc8adacfe6befdd6bac6739c106e2c78b3b9375be116f199227",
    address: "STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.escrow-refund",
    features: [
      "Funds held in escrow",
      "Refund mechanism",
      "Dispute resolution",
      "Time-locked releases"
    ],
    useCase: "Freelance payments, marketplace transactions, service agreements"
  },
  {
    name: "Time-Gated Access",
    description: "Paywall that expires to free (journalism model)",
    txid: "0x365a6e601c50070890e45558bb75e4c6f023ba3a3c7dcf79a1c3f141a44c1f31",
    address: "STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.time-gated-access",
    features: [
      "Configurable paywall window",
      "Automatic expiration to free",
      "Block-height based timing",
      "Creator revenue tracking"
    ],
    useCase: "News articles, research papers, time-sensitive premium content"
  },
  {
    name: "Royalty Cascade",
    description: "Perpetual creator royalties on every resale",
    txid: "0xad620a2cc3886b79673bead37112f5929488e5d88984d354bcdcd2941866198e",
    address: "STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.royalty-cascade",
    features: [
      "Royalty on every resale",
      "Perpetual creator revenue",
      "Ownership transfer tracking",
      "Configurable royalty rates"
    ],
    useCase: "Digital art, NFTs, collectibles, intellectual property"
  },
  {
    name: "Tiered Pricing",
    description: "Dynamic pricing by buyer tier (student/business/nonprofit)",
    txid: "0xe74ec60f13a95200e5f251408cbe5af736d5066e1be95c439a476563f7ca48da",
    address: "STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.tiered-pricing",
    features: [
      "Student discounts",
      "Business pricing",
      "Nonprofit rates",
      "Tier verification system"
    ],
    useCase: "Educational content, software licenses, API access"
  }
];

export default function ContractsPage() {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b-2 border-border bg-charcoal px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center gap-3">
            <Zap className="text-bitcoin-orange" size={32} />
            <h1 className="font-mono text-4xl font-extrabold uppercase text-foreground">
              Live Contracts
            </h1>
          </div>
          <p className="mb-6 max-w-3xl font-mono text-lg text-fog">
            6 production-ready Clarity smart contracts deployed on Stacks testnet.
            All contracts tested (43 tests passing) and ready for mainnet.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="border-2 border-success-green bg-success-green/10 px-4 py-2">
              <span className="font-mono text-sm font-bold uppercase text-success-green">
                ✓ All Deployed
              </span>
            </div>
            <div className="border-2 border-bitcoin-orange bg-bitcoin-orange/10 px-4 py-2">
              <span className="font-mono text-sm font-bold uppercase text-bitcoin-orange">
                43 Tests Passing
              </span>
            </div>
            <div className="border-2 border-stacks-purple bg-stacks-purple/10 px-4 py-2">
              <span className="font-mono text-sm font-bold uppercase text-stacks-purple">
                Clarity v2 (Epoch 2.4)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Grid */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contracts.map((contract) => (
            <div
              key={contract.name}
              className="group cursor-pointer border-2 border-border bg-charcoal p-6 transition-all hover:border-bitcoin-orange hover:-translate-y-1"
              onClick={() => setSelectedContract(contract)}
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="font-mono text-lg font-bold uppercase text-foreground">
                  {contract.name}
                </h3>
                <Code className="text-slate-custom transition-colors group-hover:text-bitcoin-orange" size={20} />
              </div>
              
              <p className="mb-4 text-sm text-fog">
                {contract.description}
              </p>

              <div className="mb-4 space-y-2">
                {contract.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 flex-shrink-0 text-success-green" size={14} />
                    <span className="text-xs text-fog">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href={`https://explorer.hiro.so/txid/${contract.txid}?chain=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase text-bitcoin-orange transition-colors hover:text-bitcoin-orange/80"
                onClick={(e) => e.stopPropagation()}
              >
                View on Explorer
                <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedContract(null)}
        >
          <div 
            className="w-full max-w-3xl border-3 border-border bg-background p-8 shadow-[8px_8px_0_#000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="mb-2 font-mono text-2xl font-bold uppercase text-foreground">
                  {selectedContract.name}
                </h2>
                <p className="text-sm text-fog">{selectedContract.description}</p>
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="text-slate-custom transition-colors hover:text-foreground"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <h3 className="mb-2 font-mono text-sm font-bold uppercase text-slate-custom">
                  Contract Address
                </h3>
                <code className="block break-all border-2 border-border bg-charcoal p-3 font-mono text-xs text-foreground">
                  {selectedContract.address}
                </code>
              </div>

              <div>
                <h3 className="mb-2 font-mono text-sm font-bold uppercase text-slate-custom">
                  Features
                </h3>
                <div className="space-y-2">
                  {selectedContract.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 flex-shrink-0 text-success-green" size={16} />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-mono text-sm font-bold uppercase text-slate-custom">
                  Use Case
                </h3>
                <p className="text-sm text-fog">{selectedContract.useCase}</p>
              </div>

              <div>
                <h3 className="mb-2 font-mono text-sm font-bold uppercase text-slate-custom">
                  Transaction ID
                </h3>
                <code className="block break-all border-2 border-border bg-charcoal p-3 font-mono text-xs text-fog">
                  {selectedContract.txid}
                </code>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`https://explorer.hiro.so/txid/${selectedContract.txid}?chain=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border-3 border-background bg-bitcoin-orange px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-background transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_#000]"
              >
                View on Explorer
                <ExternalLink size={14} />
              </a>
              <button
                onClick={() => setSelectedContract(null)}
                className="border-2 border-border px-6 py-3 font-mono text-sm uppercase text-foreground transition-all hover:border-slate-custom"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="border-t-2 border-border bg-charcoal px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 font-mono text-2xl font-bold uppercase text-foreground">
            By The Numbers
          </h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="border-2 border-border bg-background p-6">
              <div className="mb-2 font-mono text-4xl font-bold text-bitcoin-orange">6</div>
              <div className="font-mono text-sm uppercase text-slate-custom">
                Production Contracts
              </div>
            </div>
            <div className="border-2 border-border bg-background p-6">
              <div className="mb-2 font-mono text-4xl font-bold text-success-green">43</div>
              <div className="font-mono text-sm uppercase text-slate-custom">
                Tests Passing
              </div>
            </div>
            <div className="border-2 border-border bg-background p-6">
              <div className="mb-2 font-mono text-4xl font-bold text-stacks-purple">100%</div>
              <div className="font-mono text-sm uppercase text-slate-custom">
                Testnet Deployed
              </div>
            </div>
            <div className="border-2 border-border bg-background p-6">
              <div className="mb-2 font-mono text-4xl font-bold text-foreground">2.4</div>
              <div className="font-mono text-sm uppercase text-slate-custom">
                Clarity Epoch
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
