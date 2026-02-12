"use client";

import { useState } from "react";
import { Download, ExternalLink, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Payment {
  id: string;
  txHash: string;
  from: string;
  amount: string;
  asset: string;
  content: string;
  status: "confirmed" | "pending";
  date: string;
}

const mockPayments: Payment[] = [
  { id: "1", txHash: "0x1a3f...8b2d", from: "0x9d2b...5e3c", amount: "0.10", asset: "STX", content: "Bitcoin Deep Dive", status: "confirmed", date: "2026-02-10 14:32" },
  { id: "2", txHash: "0x4c7e...1f9a", from: "0x6f1a...4d8e", amount: "0.50", asset: "sBTC", content: "API Tutorial", status: "confirmed", date: "2026-02-10 14:27" },
  { id: "3", txHash: "0x7b9d...3c4f", from: "0x3e5c...7a2f", amount: "0.25", asset: "USDCx", content: "Masterclass", status: "confirmed", date: "2026-02-10 14:20" },
  { id: "4", txHash: "0x2e6a...9d1b", from: "0xa1c4...8f3e", amount: "1.20", asset: "STX", content: "Newsletter #12", status: "pending", date: "2026-02-10 14:15" },
  { id: "5", txHash: "0x5f8c...2a7d", from: "0xb3d7...6e2a", amount: "0.08", asset: "sBTC", content: "Bitcoin Deep Dive", status: "confirmed", date: "2026-02-10 13:58" },
  { id: "6", txHash: "0x8a1d...4b6e", from: "0xc5e9...1d4b", amount: "0.30", asset: "STX", content: "API Tutorial", status: "confirmed", date: "2026-02-10 13:45" },
  { id: "7", txHash: "0x3c9e...7f2a", from: "0xd8a2...3c5f", amount: "0.15", asset: "USDCx", content: "Masterclass", status: "confirmed", date: "2026-02-10 13:30" },
  { id: "8", txHash: "0x6d4b...1e8c", from: "0xe2f6...9a7d", amount: "0.45", asset: "STX", content: "Newsletter #12", status: "confirmed", date: "2026-02-10 13:12" },
];

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAsset, setFilterAsset] = useState("all");

  const filteredPayments = mockPayments.filter((p) => {
    const matchesSearch = p.txHash.includes(searchQuery) || p.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAsset = filterAsset === "all" || p.asset === filterAsset;
    return matchesSearch && matchesAsset;
  });

  return (
    <div>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-mono text-3xl font-extrabold uppercase text-foreground">
          Payments
        </h1>
        <button
          type="button"
          className="flex items-center gap-2 border-2 border-border bg-concrete px-4 py-2 font-mono text-sm uppercase text-foreground transition-all hover:border-bitcoin-orange"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-custom" />
          <input
            type="text"
            placeholder="Search by tx hash or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-2 border-border bg-concrete py-2.5 pl-10 pr-4 font-mono text-sm text-foreground placeholder:text-slate-custom focus:border-bitcoin-orange focus:outline-none"
          />
        </div>
        <select
          value={filterAsset}
          onChange={(e) => setFilterAsset(e.target.value)}
          className="border-2 border-border bg-concrete px-4 py-2.5 font-mono text-sm text-foreground"
        >
          <option value="all">All Assets</option>
          <option value="STX">STX</option>
          <option value="sBTC">sBTC</option>
          <option value="USDCx">USDCx</option>
        </select>
        <select className="border-2 border-border bg-concrete px-4 py-2.5 font-mono text-sm text-foreground">
          <option>All Status</option>
          <option>Confirmed</option>
          <option>Pending</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto border-2 border-border bg-charcoal">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog">Tx Hash</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog">From</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog">Amount</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog">Content</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog">Status</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog">Date</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-fog sr-only">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="border-b border-border transition-colors hover:bg-concrete">
                <td className="px-4 py-4 font-mono text-sm text-foreground">{payment.txHash}</td>
                <td className="px-4 py-4 font-mono text-sm text-fog">{payment.from}</td>
                <td className="px-4 py-4 font-mono text-sm font-bold text-foreground">
                  {payment.amount} <span className="text-bitcoin-orange">{payment.asset}</span>
                </td>
                <td className="px-4 py-4 font-mono text-sm text-fog">{payment.content}</td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2 py-1 font-mono text-xs uppercase ${
                      payment.status === "confirmed"
                        ? "bg-success-green/10 text-success-green"
                        : "bg-warning-yellow/10 text-warning-yellow"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="px-4 py-4 font-mono text-xs text-slate-custom">{payment.date}</td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    className="p-1.5 text-slate-custom transition-colors hover:text-foreground"
                    aria-label="View on explorer"
                    title="View on explorer"
                  >
                    <ExternalLink size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-xs text-slate-custom">
          Showing {filteredPayments.length} of {mockPayments.length} payments
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="border-2 border-border p-2 text-foreground transition-colors hover:border-bitcoin-orange"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="border-2 border-bitcoin-orange bg-bitcoin-orange px-3 py-1.5 font-mono text-xs font-bold text-background">
            1
          </span>
          <button
            type="button"
            className="border-2 border-border p-2 text-foreground transition-colors hover:border-bitcoin-orange"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
