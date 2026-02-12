"use client";

import { useState } from "react";
import { Plus, Copy, Check, ExternalLink, Edit2 } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  type: string;
  price: string;
  asset: string;
  views: number;
  revenue: string;
  status: "active" | "draft";
}

const mockContent: ContentItem[] = [
  { id: "1", title: "Bitcoin Scaling Deep Dive", type: "Article", price: "0.10", asset: "STX", views: 342, revenue: "$45.20", status: "active" },
  { id: "2", title: "Stacks API Tutorial", type: "API", price: "0.05", asset: "STX", views: 218, revenue: "$32.10", status: "active" },
  { id: "3", title: "Smart Contract Masterclass", type: "Video", price: "0.50", asset: "sBTC", views: 156, revenue: "$28.00", status: "active" },
  { id: "4", title: "Weekly Newsletter #12", type: "Newsletter", price: "0.02", asset: "USDCx", views: 89, revenue: "$18.50", status: "active" },
  { id: "5", title: "DeFi Yield Strategies", type: "Article", price: "0.15", asset: "STX", views: 0, revenue: "$0.00", status: "draft" },
];

export default function ContentPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyEmbed = (id: string) => {
    navigator.clipboard.writeText(`<PaywallButton contentId="${id}" />`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-mono text-3xl font-extrabold uppercase text-foreground">
          Content
        </h1>
        <button
          type="button"
          className="flex items-center gap-2 border-3 border-background bg-bitcoin-orange px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-background transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_#000]"
        >
          <Plus size={16} />
          Add Content
        </button>
      </div>

      {/* Content Table */}
      <div className="overflow-x-auto border-2 border-border bg-charcoal">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog">Title</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog">Type</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog">Price</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog">Views</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog">Revenue</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog">Status</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockContent.map((item) => (
              <tr key={item.id} className="border-b border-border transition-colors hover:bg-concrete">
                <td className="px-4 py-4 font-mono text-sm text-foreground">{item.title}</td>
                <td className="px-4 py-4">
                  <span className="border border-border px-2 py-1 font-mono text-xs uppercase text-fog">
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-4 font-mono text-sm text-foreground">
                  {item.price} {item.asset}
                </td>
                <td className="px-4 py-4 font-mono text-sm text-foreground">{item.views}</td>
                <td className="px-4 py-4 font-mono text-sm font-bold text-bitcoin-orange">{item.revenue}</td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2 py-1 font-mono text-xs uppercase ${
                      item.status === "active"
                        ? "bg-success-green/10 text-success-green"
                        : "bg-warning-yellow/10 text-warning-yellow"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyEmbed(item.id)}
                      className="p-1.5 text-slate-custom transition-colors hover:text-foreground"
                      aria-label="Copy embed code"
                      title="Copy embed code"
                    >
                      {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      type="button"
                      className="p-1.5 text-slate-custom transition-colors hover:text-foreground"
                      aria-label="Edit content"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 text-slate-custom transition-colors hover:text-foreground"
                      aria-label="View content"
                      title="View"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
