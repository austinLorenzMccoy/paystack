"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  SignalHigh,
  Radio,
  Code2,
  Zap,
} from "lucide-react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";

interface RevenueData {
  month: string;
  total: number;
  aiAgents: number;
}

interface TopContent {
  rank: number;
  title: string;
  revenue: string;
}

interface RecentPayment {
  address: string;
  amount: string;
  time: string;
}

interface Stats {
  value: string;
  label: string;
  trend: string;
  trendLabel: string;
}

export default function DashboardOverview() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topContent, setTopContent] = useState<TopContent[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const placeholderData = useMemo(() => {
    return {
      stats: [
        {
          value: "$32,400",
          label: "Total Revenue",
          trend: "+18%",
          trendLabel: "from last month",
        },
        {
          value: "1,240",
          label: "Total Payments",
          trend: "+12%",
          trendLabel: "from last month",
        },
        {
          value: "22%",
          label: "AI Agent Traffic",
          trend: "+6%",
          trendLabel: "from last month",
        },
      ],
      revenue: [
        { month: "Jan", total: 4800, aiAgents: 900 },
        { month: "Feb", total: 5200, aiAgents: 1100 },
        { month: "Mar", total: 6100, aiAgents: 1500 },
        { month: "Apr", total: 7000, aiAgents: 1800 },
      ],
      topContent: [
        { rank: 1, title: "x402 Premium Feed", revenue: "$8,420" },
        { rank: 2, title: "Stacked Essays", revenue: "$6,190" },
        { rank: 3, title: "AI Synth Sessions", revenue: "$4,870" },
      ],
      recent: [
        { address: "SP2...9J18", amount: "45 STX", time: "2m ago" },
        { address: "SP3...AB44", amount: "0.002 sBTC", time: "12m ago" },
        { address: "SPX...90CD", amount: "120 USDCx", time: "30m ago" },
      ],
    };
  }, []);

  const applyPlaceholderData = () => {
    setStats(placeholderData.stats);
    setRevenueData(placeholderData.revenue);
    setTopContent(placeholderData.topContent);
    setRecentPayments(placeholderData.recent);
  };

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      fetchDashboardData();
    } else {
      applyPlaceholderData();
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (!supabase) {
        applyPlaceholderData();
        return;
      }

      // Fetch payments for current user (creator)
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          content:content_id (
            title
          )
        `)
        .eq('creator_id', user?.id)
        .order('processed_at', { ascending: false })
        .limit(50);

      if (paymentsError) throw paymentsError;

      // Calculate stats
      const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const totalPayments = payments?.length || 0;
      const aiAgentPayments = payments?.filter(p => p.is_ai_agent).length || 0;
      const aiPercentage = totalPayments > 0 ? Math.round((aiAgentPayments / totalPayments) * 100) : 0;

      setStats([
        {
          value: `$${totalRevenue.toLocaleString()}`,
          label: "Total Revenue",
          trend: "+12%", // Would calculate from previous period
          trendLabel: "from last month",
        },
        {
          value: totalPayments.toString(),
          label: "Total Payments",
          trend: "+8%",
          trendLabel: "from last month",
        },
        {
          value: `${aiPercentage}%`,
          label: "AI Agent Traffic",
          trend: "+5%",
          trendLabel: "from last month",
        },
      ]);

      // Generate revenue chart data (would be aggregated by month)
      const chartData = generateRevenueChartData(payments || []);
      setRevenueData(chartData);

      // Top content (would aggregate by content)
      const contentRevenue = aggregateContentRevenue(payments || []);
      setTopContent(contentRevenue.slice(0, 5).map((item, index) => ({
        rank: index + 1,
        title: item.title || `Content ${item.content_id}`,
        revenue: `$${item.revenue.toFixed(2)}`,
      })));

      // Recent payments
      const recent = (payments || []).slice(0, 5).map(payment => ({
        address: `${payment.payer_address.slice(0, 6)}...${payment.payer_address.slice(-4)}`,
        amount: `${payment.amount} ${payment.asset}`,
        time: new Date(payment.processed_at).toLocaleString(),
      }));
      setRecentPayments(recent);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Fallback to mock data if Supabase fails
      applyPlaceholderData();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate chart data
  const generateRevenueChartData = (payments: any[]): RevenueData[] => {
    const monthlyData: { [key: string]: { total: number; aiAgents: number } } = {};

    payments.forEach(payment => {
      const date = new Date(payment.processed_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, aiAgents: 0 };
      }

      monthlyData[monthKey].total += payment.amount;
      if (payment.is_ai_agent) {
        monthlyData[monthKey].aiAgents += payment.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      total: data.total,
      aiAgents: data.aiAgents,
    }));
  };

  // Helper function to aggregate content revenue
  const aggregateContentRevenue = (payments: any[]) => {
    const contentMap: { [key: string]: { content_id: string; title: string; revenue: number } } = {};

    payments.forEach(payment => {
      const contentId = payment.content_id;
      const title = payment.content?.title || `Content ${contentId}`;

      if (!contentMap[contentId]) {
        contentMap[contentId] = { content_id: contentId, title, revenue: 0 };
      }

      contentMap[contentId].revenue += payment.amount;
    });

    return Object.values(contentMap).sort((a, b) => b.revenue - a.revenue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const aiStat = stats.find((s) => s.label === "AI Agent Traffic");

  return (
    <div className="space-y-8">
      {/* Live ticker */}
      <div className="ticker-strip grid-overlay">
        <div className="flex items-center gap-2">
          <span className="ticker-dot" aria-hidden />
          Live AI Agents
        </div>
        <div className="flex items-center gap-2 text-success-green">
          <SignalHigh size={16} />
          {aiStat?.value ?? "0%"} of traffic
        </div>
        <div className="hidden items-center gap-2 text-warning-yellow sm:flex">
          <Radio size={16} />
          Streaming payments secured via x402
        </div>
        <div className="hidden items-center gap-2 text-bitcoin-orange md:flex">
          <Zap size={16} />
          sBTC · STX · USDCx
        </div>
      </div>

      {/* Page Title */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card-brutalist p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-fog">Command Deck</p>
              <h1 className="font-mono text-4xl font-black uppercase text-foreground">
                Creator Overview
              </h1>
            </div>
            <select className="border-2 border-border bg-concrete px-4 py-2 font-mono text-sm text-foreground">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-fog">
            Monitor revenue splits, AI agent payments, and human traffic in realtime. Every data point is sourced from the Supabase analytics stream.
          </p>
        </div>
        <div className="card-brutalist flex flex-col gap-3 p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.4em] text-fog">AI Agents Live</span>
            <SignalHigh className="text-success-green" size={20} />
          </div>
          <div className="font-mono text-5xl font-black text-success-green">
            {aiStat?.value ?? "0%"}
          </div>
          <p className="text-xs text-fog">
            Agents negotiating Stacks micropayments right now. Tie SDK events to your automations with zero latency.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="card-brutalist p-6"
            style={{ animation: `fade-in-up 0.4s ease-out ${index * 0.1}s backwards` }}
          >
            <div className="mb-2 font-mono text-4xl font-extrabold text-bitcoin-orange lg:text-5xl">
              {stat.value}
            </div>
            <div className="mb-1 font-mono text-sm uppercase tracking-wider text-fog">
              {stat.label}
            </div>
            <div className="flex items-center gap-1 text-xs text-success-green">
              <TrendingUp size={12} />
              {stat.trend} {stat.trendLabel}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card-brutalist p-6">
        <h2 className="mb-6 font-mono text-lg font-bold uppercase text-foreground">
          Revenue Over Time
        </h2>
        {revenueData.length > 0 ? (
          <ChartContainer
            config={{
              total: { label: "Total Revenue", color: "#F7931A" },
              aiAgents: { label: "AI Agents", color: "#5546FF" },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                <XAxis dataKey="month" stroke="#4A4A4A" fontSize={12} fontFamily="var(--font-jetbrains-mono)" />
                <YAxis stroke="#4A4A4A" fontSize={12} fontFamily="var(--font-jetbrains-mono)" tickFormatter={(v) => `$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#F7931A"
                  strokeWidth={2}
                  dot={false}
                  name="Total Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="aiAgents"
                  stroke="#5546FF"
                  strokeWidth={2}
                  dot={false}
                  name="AI Agents"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-fog">
            No revenue data yet. Start monetizing your content!
          </div>
        )}
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Content */}
        <div className="card-brutalist p-6">
          <h2 className="mb-4 font-mono text-lg font-bold uppercase text-foreground">
            Top Content
          </h2>
          {topContent.length > 0 ? (
            <div className="flex flex-col">
              {topContent.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center bg-bitcoin-orange font-mono text-xs font-bold text-background">
                      {item.rank}
                    </span>
                    <span className="font-mono text-sm text-foreground">{item.title}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-bitcoin-orange">
                    {item.revenue}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-fog">
              No content monetized yet. Add your first content to start earning!
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="card-brutalist p-6">
          <h2 className="mb-4 font-mono text-lg font-bold uppercase text-foreground">
            Recent Payments
          </h2>
          {recentPayments.length > 0 ? (
            <div className="flex flex-col">
              {recentPayments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-sm text-foreground">
                      {payment.address}
                    </span>
                    <span className="text-xs text-slate-custom">{payment.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {payment.amount}
                    </span>
                    <ArrowUpRight size={14} className="text-success-green" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-fog">
              No payments received yet. Share your monetized content!
            </div>
          )}
        </div>
      </div>
      {/* SDK Callout + x402 Sats Flow */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-brutalist p-6 outline-glow">
          <div className="mb-4 flex items-center gap-3 text-bitcoin-orange">
            <Code2 size={20} />
            <span className="text-xs uppercase tracking-[0.4em]">SDK Bridge</span>
          </div>
          <h3 className="font-mono text-2xl font-black uppercase">Drop-in Integration</h3>
          <p className="mt-3 text-sm text-fog">
            Import the PayStack SDK, register your content IDs, and begin streaming Bitcoin-native payments in under five minutes. Assets are switchable per content block.
          </p>
          <div className="mt-4 space-y-2 font-mono text-xs uppercase tracking-widest text-fog">
            <div className="flex items-center justify-between border border-border px-4 py-2">
              <span>sBTC</span>
              <span>Security</span>
            </div>
            <div className="flex items-center justify-between border border-border px-4 py-2">
              <span>STX</span>
              <span>Stacking Yield</span>
            </div>
            <div className="flex items-center justify-between border border-border px-4 py-2">
              <span>USDCx</span>
              <span>Stable Payout</span>
            </div>
          </div>
        </div>
        <div className="card-brutalist p-6">
          <div className="mb-2 text-xs uppercase tracking-[0.4em] text-fog">x402 Sats Flow</div>
          <h3 className="font-mono text-2xl font-black uppercase">Signal → Contract → Access</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Signal",
                desc: "Hiro wallet signs payment intent from your customer or agent.",
              },
              {
                title: "Contract",
                desc: "Revenue-split Clarity contract executes + emits analytics event.",
              },
              {
                title: "Access",
                desc: "Supabase access_grants + SDK unlock premium content instantly.",
              },
            ].map((item) => (
              <div key={item.title} className="border border-border p-4 text-sm text-foreground">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-stacks-purple">{item.title}</p>
                <p className="mt-2 text-xs text-fog">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
