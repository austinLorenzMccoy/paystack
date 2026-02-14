"use client";

import { useMemo, useState } from "react";
import { Plus, Copy, Check, ExternalLink, Edit2, X } from "lucide-react";

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
  const [contentItems, setContentItems] = useState<ContentItem[]>(() => structuredClone(mockContent));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    type: "Article",
    price: "0.10",
    asset: "STX",
  });

  const resetForm = () => {
    setFormState({ title: "", type: "Article", price: "0.10", asset: "STX" });
  };

  const handleCopyEmbed = (id: string) => {
    navigator.clipboard.writeText(`<PaywallButton contentId="${id}" />`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddContent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const newItem: ContentItem = {
      id: crypto.randomUUID(),
      title: formState.title || "Untitled Content",
      type: formState.type,
      price: formState.price,
      asset: formState.asset,
      views: 0,
      revenue: "$0.00",
      status: "draft",
    };

    setContentItems((prev) => [newItem, ...prev]);
    resetForm();
    setSubmitting(false);
    setIsDialogOpen(false);
  };

  const disableSubmit = useMemo(() => !formState.title.trim() || Number(formState.price) <= 0, [formState]);

  return (
    <div>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-mono text-3xl font-extrabold uppercase text-foreground">
          Content
        </h1>
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
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
            {contentItems.map((item) => (
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

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg border-3 border-border bg-background p-6 shadow-[8px_8px_0_#000]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-xl font-bold uppercase text-foreground">Add Content</h2>
              <button
                type="button"
                className="text-slate-custom transition-colors hover:text-foreground"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
                aria-label="Close add content dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleAddContent}>
              <div>
                <label className="mb-1 block font-mono text-xs uppercase text-slate-custom">Title</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full border-2 border-border bg-concrete px-3 py-2 font-mono text-sm text-foreground focus:border-bitcoin-orange focus:outline-none"
                  placeholder="Stacks API Tutorial"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-mono text-xs uppercase text-slate-custom">Content Type</label>
                  <select
                    value={formState.type}
                    onChange={(e) => setFormState((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full border-2 border-border bg-concrete px-3 py-2 font-mono text-sm text-foreground"
                  >
                    <option value="Article">Article</option>
                    <option value="Video">Video</option>
                    <option value="Newsletter">Newsletter</option>
                    <option value="API">API</option>
                    <option value="Course">Course</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-mono text-xs uppercase text-slate-custom">Asset</label>
                  <select
                    value={formState.asset}
                    onChange={(e) => setFormState((prev) => ({ ...prev, asset: e.target.value }))}
                    className="w-full border-2 border-border bg-concrete px-3 py-2 font-mono text-sm text-foreground"
                  >
                    <option value="STX">STX</option>
                    <option value="sBTC">sBTC</option>
                    <option value="USDCx">USDCx</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-mono text-xs uppercase text-slate-custom">Price</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.price}
                    onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full border-2 border-border bg-concrete px-3 py-2 font-mono text-sm text-foreground focus:border-bitcoin-orange focus:outline-none"
                  />
                  <span className="font-mono text-sm text-slate-custom">{formState.asset}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="border-2 border-border px-4 py-2 font-mono text-xs uppercase text-foreground transition-all hover:border-slate-custom"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disableSubmit || submitting}
                  className="flex items-center gap-2 border-3 border-background bg-bitcoin-orange px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-background transition-all disabled:opacity-60"
                >
                  {submitting ? "Adding..." : "Add Content"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
