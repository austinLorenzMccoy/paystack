"use client";

import { useState } from "react";
import { Plus, Copy, Check, Trash2 } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

const mockKeys: ApiKey[] = [
  {
    id: "1",
    name: "Production Key",
    key: "ps_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    created: "Jan 15, 2026",
    lastUsed: "2 hours ago",
  },
  {
    id: "2",
    name: "Development Key",
    key: "ps_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    created: "Jan 10, 2026",
    lastUsed: "Never",
  },
];

export default function ApiKeysPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const truncateKey = (key: string) => {
    return key.slice(0, 12) + "..." + key.slice(-8);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-mono text-3xl font-extrabold uppercase text-foreground">
            API Keys
          </h1>
          <p className="mt-2 text-sm text-fog">
            Manage your API keys for SDK integration.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 border-3 border-background bg-bitcoin-orange px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-background transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_#000]"
        >
          <Plus size={16} />
          Generate New Key
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {mockKeys.map((apiKey) => (
          <div key={apiKey.id} className="border-2 border-border bg-charcoal p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-mono text-lg font-bold text-foreground">{apiKey.name}</h3>
                <p className="mt-1 font-mono text-xs text-slate-custom">
                  Created: {apiKey.created} | Last used: {apiKey.lastUsed}
                </p>
              </div>
              <button
                type="button"
                className="p-2 text-error-red transition-colors hover:text-error-red/80"
                aria-label={`Revoke ${apiKey.name}`}
                title="Revoke key"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 border-2 border-border bg-concrete px-4 py-3">
              <code className="flex-1 overflow-hidden font-mono text-sm text-foreground">
                {truncateKey(apiKey.key)}
              </code>
              <button
                type="button"
                onClick={() => handleCopy(apiKey.id, apiKey.key)}
                className="shrink-0 border-2 border-border px-3 py-1.5 font-mono text-xs uppercase text-foreground transition-all hover:border-bitcoin-orange"
                aria-label="Copy API key"
              >
                {copiedId === apiKey.id ? (
                  <span className="flex items-center gap-1"><Check size={12} /> Copied</span>
                ) : (
                  <span className="flex items-center gap-1"><Copy size={12} /> Copy</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
