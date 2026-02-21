"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Zap, Coins, ArrowUpRight, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Strategy {
  id: string;
  name: string;
  protocol: string;
  apy: number;
  tvl: string;
  risk: "low" | "medium" | "high";
  description: string;
}

interface UserPosition {
  strategy: string;
  staked: number;
  earned: number;
  apyEarned: number;
}

export default function YieldDashboard() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchYieldData();
  }, []);

  async function fetchYieldData() {
    setLoading(true);
    try {
      // Mock data - in production, fetch from revenue-optimizer contract and oracles
      const mockStrategies: Strategy[] = [
        {
          id: "pox-stacking",
          name: "PoX Stacking",
          protocol: "Stacks PoX-4",
          apy: 8.5,
          tvl: "1.2M STX",
          risk: "low",
          description: "Stack STX and earn BTC rewards directly from the protocol"
        },
        {
          id: "alex-stx-usda",
          name: "STX-USDA LP",
          protocol: "ALEX",
          apy: 12.3,
          tvl: "850K STX",
          risk: "medium",
          description: "Provide liquidity to ALEX and earn trading fees + ALEX rewards"
        },
        {
          id: "bitflow-stx-btc",
          name: "STX-BTC LP",
          protocol: "Bitflow",
          apy: 15.7,
          tvl: "620K STX",
          risk: "medium",
          description: "Earn fees from STX/BTC swaps on Bitflow DEX"
        },
        {
          id: "stacking-dao",
          name: "Liquid Stacking (stSTX)",
          protocol: "StackingDAO",
          apy: 7.8,
          tvl: "2.1M STX",
          risk: "low",
          description: "Stake STX, receive liquid stSTX, earn BTC while staying liquid"
        }
      ];

      const mockPositions: UserPosition[] = [
        {
          strategy: "pox-stacking",
          staked: 1000,
          earned: 0.0042,
          apyEarned: 8.5
        },
        {
          strategy: "alex-stx-usda",
          staked: 500,
          earned: 0.0031,
          apyEarned: 12.3
        }
      ];

      setStrategies(mockStrategies);
      setPositions(mockPositions);
    } catch (err) {
      console.error("Failed to fetch yield data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshData() {
    setRefreshing(true);
    await fetchYieldData();
    setRefreshing(false);
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "high": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const totalStaked = positions.reduce((sum, p) => sum + p.staked, 0);
  const totalEarned = positions.reduce((sum, p) => sum + p.earned, 0);
  const avgAPY = positions.length > 0 
    ? positions.reduce((sum, p) => sum + p.apyEarned, 0) / positions.length 
    : 0;

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Yield Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Maximize your STX returns across DeFi protocols
            </p>
          </div>
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            className="border-white/10"
          >
            {refreshing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh APYs
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="border-white/10 bg-[#13141A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Staked</CardTitle>
            <Coins className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalStaked.toLocaleString()} STX</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {positions.length} strategies
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#13141A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalEarned.toFixed(6)} BTC</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime rewards
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#13141A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Average APY</CardTitle>
            <Zap className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{avgAPY.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Weighted by position size
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions */}
      {positions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Your Positions</h2>
          <div className="grid gap-4">
            {positions.map((position) => {
              const strategy = strategies.find(s => s.id === position.strategy);
              if (!strategy) return null;

              return (
                <Card key={position.strategy} className="border-white/10 bg-[#13141A]">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
                          <Badge className={getRiskColor(strategy.risk)}>
                            {strategy.risk} risk
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{strategy.protocol}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Staked</p>
                            <p className="text-white font-medium">{position.staked} STX</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Earned</p>
                            <p className="text-green-400 font-medium">{position.earned.toFixed(6)} BTC</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">APY</p>
                            <p className="text-purple-400 font-medium">{position.apyEarned}%</p>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-white/10">
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Strategies */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Available Strategies</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {strategies.map((strategy) => {
            const hasPosition = positions.some(p => p.strategy === strategy.id);

            return (
              <Card key={strategy.id} className="border-white/10 bg-[#13141A]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-white">{strategy.name}</CardTitle>
                        <Badge className={getRiskColor(strategy.risk)}>
                          {strategy.risk}
                        </Badge>
                      </div>
                      <CardDescription>{strategy.protocol}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">{strategy.apy}%</div>
                      <div className="text-xs text-muted-foreground">APY</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">TVL: </span>
                      <span className="text-white font-medium">{strategy.tvl}</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-orange-500 hover:bg-orange-600"
                      disabled={hasPosition}
                    >
                      {hasPosition ? "Active" : "Stake Now"}
                      {!hasPosition && <ArrowUpRight className="ml-1 h-3 w-3" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Info Banner */}
      <Card className="mt-8 border-orange-500/20 bg-orange-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">Auto-Optimization Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                The revenue optimizer will automatically rebalance your funds to the highest-yielding 
                strategy every 30 days. Enable auto-optimization in your subscription settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
