import { Activity, Bot, Radio, SignalHigh, Zap } from "lucide-react";

const stream = [
  {
    label: "AI Agent",
    detail: "GPT-4o collector paid 1.2 STX",
    accent: "text-success-green",
  },
  {
    label: "Creator",
    detail: "@dawnfm unlocked premium essay",
    accent: "text-bitcoin-orange",
  },
  {
    label: "Settlement",
    detail: "sBTC routed through x402",
    accent: "text-warning-yellow",
  },
];

export function RealtimePanel() {
  return (
    <section className="px-6 py-20 lg:px-10">
      <div className="ticker-strip grid-overlay mb-6">
        <span className="flex items-center gap-2 text-success-green">
          <SignalHigh size={16} /> Realtime feed engaged
        </span>
        <span className="hidden items-center gap-2 text-warning-yellow sm:flex">
          <Radio size={16} /> Supabase subscriptions synced
        </span>
        <span className="hidden items-center gap-2 text-bitcoin-orange md:flex">
          <Zap size={16} /> sBTC · STX · USDCx
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card-brutalist p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-fog">Live Stream</p>
              <h2 className="mt-1 font-mono text-2xl font-black uppercase">AI x Human Traffic</h2>
            </div>
            <span className="font-mono text-4xl text-success-green">+18%</span>
          </div>

          <div className="mt-6 space-y-3">
            {stream.map((entry) => (
              <div key={entry.label} className="flex items-center justify-between border border-border px-4 py-3 text-sm">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.4em] text-fog">{entry.label}</p>
                  <p className={`text-foreground ${entry.accent}`}>{entry.detail}</p>
                </div>
                <span className="text-xs text-fog">{new Date().toUTCString().slice(0, 16)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-brutalist flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3 text-success-green">
            <Bot size={20} />
            <span className="text-xs uppercase tracking-[0.4em]">Agent Telemetry</span>
          </div>
          <div className="font-mono text-5xl font-black text-success-green">24 agents</div>
          <p className="text-xs text-fog">Connected via SDK webhooks + Supabase realtime.</p>
          <div className="space-y-2 text-xs text-foreground">
            <div className="flex items-center justify-between border border-border px-3 py-2">
              <span>Stacks Wallet</span>
              <span>Verified</span>
            </div>
            <div className="flex items-center justify-between border border-border px-3 py-2">
              <span>Clarity Contract</span>
              <span>Deployed</span>
            </div>
            <div className="flex items-center justify-between border border-border px-3 py-2">
              <span>Analytics Feed</span>
              <span>Streaming</span>
            </div>
          </div>
          <button type="button" className="btn-brutalist border-success-green text-success-green">
            View Supabase Channel
          </button>
        </div>
      </div>
    </section>
  );
}
