"use client";

import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Cell,
  Pie,
  PieChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const revenueByAsset = [
  { asset: "STX", revenue: 520, color: "#5546FF" },
  { asset: "sBTC", revenue: 380, color: "#F7931A" },
  { asset: "USDCx", revenue: 334, color: "#00FF41" },
];

const agentVsHuman = [
  { name: "Human", value: 77, color: "#F7931A" },
  { name: "AI Agent", value: 23, color: "#5546FF" },
];

const monthlyBreakdown = [
  { month: "Jan", human: 90, agent: 30 },
  { month: "Feb", human: 135, agent: 45 },
  { month: "Mar", human: 180, agent: 70 },
  { month: "Apr", human: 225, agent: 95 },
  { month: "May", human: 340, agent: 140 },
  { month: "Jun", human: 430, agent: 190 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-mono text-3xl font-extrabold uppercase text-foreground">
          Analytics
        </h1>
        <div className="flex items-center gap-4">
          <select className="border-2 border-border bg-concrete px-4 py-2 font-mono text-sm text-foreground">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
          </select>
          <button
            type="button"
            className="flex items-center gap-2 border-2 border-border bg-concrete px-4 py-2 font-mono text-sm uppercase text-foreground transition-all hover:border-bitcoin-orange"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Revenue by Asset */}
      <div className="mb-8 border-2 border-border bg-charcoal p-6">
        <h2 className="mb-6 font-mono text-lg font-bold uppercase text-foreground">
          Revenue by Asset
        </h2>
        <ChartContainer
          config={{
            revenue: { label: "Revenue", color: "#F7931A" },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByAsset} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
              <XAxis dataKey="asset" stroke="#4A4A4A" fontSize={12} fontFamily="var(--font-jetbrains-mono)" />
              <YAxis stroke="#4A4A4A" fontSize={12} fontFamily="var(--font-jetbrains-mono)" tickFormatter={(v) => `$${v}`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" name="Revenue">
                {revenueByAsset.map((entry) => (
                  <Cell key={entry.asset} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Agent vs Human */}
        <div className="border-2 border-border bg-charcoal p-6">
          <h2 className="mb-6 font-mono text-lg font-bold uppercase text-foreground">
            Agent vs Human Traffic
          </h2>
          <ChartContainer
            config={{
              Human: { label: "Human", color: "#F7931A" },
              "AI Agent": { label: "AI Agent", color: "#5546FF" },
            }}
            className="mx-auto h-[250px] w-full max-w-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agentVsHuman}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  stroke="#1A1A1A"
                  strokeWidth={3}
                >
                  {agentVsHuman.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#E0E0E0", fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Monthly Comparison */}
        <div className="border-2 border-border bg-charcoal p-6">
          <h2 className="mb-6 font-mono text-lg font-bold uppercase text-foreground">
            Monthly Comparison
          </h2>
          <ChartContainer
            config={{
              human: { label: "Human", color: "#F7931A" },
              agent: { label: "AI Agent", color: "#5546FF" },
            }}
            className="h-[250px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBreakdown} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                <XAxis dataKey="month" stroke="#4A4A4A" fontSize={12} fontFamily="var(--font-jetbrains-mono)" />
                <YAxis stroke="#4A4A4A" fontSize={12} fontFamily="var(--font-jetbrains-mono)" tickFormatter={(v) => `$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="human" name="Human" fill="#F7931A" stackId="a" />
                <Bar dataKey="agent" name="AI Agent" fill="#5546FF" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
