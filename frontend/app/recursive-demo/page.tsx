"use client";

import { useState, useEffect } from "react";
import { Loader2, Lock, Unlock, Layers, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecursiveX402Demo() {
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const [currentLayer, setCurrentLayer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  // Load initial layer on mount
  useEffect(() => {
    loadLayer();
  }, []);

  const loadLayer = async (token?: string) => {
    setLoading(true);
    
    try {
      const url = token 
        ? `/api/recursive?token=${token}&session=${sessionId}`
        : `/api/recursive?session=${sessionId}`;
        
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        setCurrentLayer(data);
        setTotalSpent(data.totalSpent || 0);
        
        // Add to history
        setHistory(prev => [...prev, {
          depth: data.depth,
          title: data.title,
          content: data.content,
          spent: data.nextLayer?.price || 0,
        }]);
      }
    } catch (err) {
      console.error('Failed to load layer:', err);
    } finally {
      setLoading(false);
    }
  };

  const payForNextLayer = async () => {
    if (!currentLayer?.nextLayer) return;
    
    setLoading(true);
    
    try {
      // Simulate payment
      const fakeHash = Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      // Verify payment and get token
      const verifyRes = await fetch('/api/x402/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: fakeHash,
          walletAddress: 'SP2ABC...XYZ',
          amount: currentLayer.nextLayer.price,
        }),
      });
      
      const verifyData = await verifyRes.json();
      
      if (verifyData.accessToken) {
        // Load next layer with token
        await loadLayer(verifyData.accessToken);
      }
    } catch (err) {
      console.error('Payment failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    await fetch('/api/recursive/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    
    setCurrentLayer(null);
    setHistory([]);
    setTotalSpent(0);
    loadLayer();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="border border-purple-500/40 bg-transparent text-xs uppercase tracking-[0.3em] text-purple-400">
            Recursive x402 Payments
          </Badge>
          <h1 className="text-4xl font-bold">
            The <span className="text-purple-500">Infinite</span> Payment Chain
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each payment unlocks content that contains another paywall. Watch payments chain together autonomously.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-[#1A1A1A] border-purple-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <Layers className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{currentLayer?.depth ?? 0}</div>
                <div className="text-sm text-muted-foreground">Current Depth</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1A1A] border-orange-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{totalSpent.toFixed(1)} STX</div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1A1A] border-blue-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{history.length}</div>
                <div className="text-sm text-muted-foreground">Layers Unlocked</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
          {/* Current Layer */}
          <Card className="bg-[#1A1A1A] border-purple-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {currentLayer?.depth === 0 ? (
                    <Unlock className="h-5 w-5 text-green-500" />
                  ) : (
                    <Unlock className="h-5 w-5 text-purple-500" />
                  )}
                  {loading ? "Loading..." : currentLayer?.title || "Initializing..."}
                </CardTitle>
                <Badge variant="outline" className="border-purple-500/30">
                  Layer {currentLayer?.depth ?? 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : currentLayer ? (
                <>
                  <div className="bg-[#0A0A0A] rounded-lg p-6 border border-purple-500/10">
                    <p className="text-muted-foreground leading-relaxed">
                      {currentLayer.content}
                    </p>
                  </div>

                  {currentLayer.nextLayer ? (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <Lock className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2 text-purple-300">
                            Next Layer Locked
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {currentLayer.nextLayer.prompt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-purple-400">
                                {currentLayer.nextLayer.price} STX
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Payment required to unlock
                              </div>
                            </div>
                            <Button
                              onClick={payForNextLayer}
                              disabled={loading}
                              className="bg-purple-500 text-white hover:bg-purple-400"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  Pay & Unlock
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : currentLayer.message ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
                      <Unlock className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2 text-green-400">
                        Journey Complete!
                      </h3>
                      <p className="text-muted-foreground">
                        {currentLayer.message}
                      </p>
                    </div>
                  ) : null}
                </>
              ) : null}

              <Button
                onClick={reset}
                variant="outline"
                className="w-full border-white/20 text-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Start Over
              </Button>
            </CardContent>
          </Card>

          {/* History Sidebar */}
          <Card className="bg-[#1A1A1A] border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
              <CardDescription>Your recursive journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No payments yet
                  </p>
                ) : (
                  history.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0A0A0A] rounded-lg p-3 border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">
                          Layer {item.depth}
                        </span>
                        {item.spent > 0 && (
                          <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                            {item.spent} STX
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.title}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Explanation */}
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader>
            <CardTitle>How Recursive Payments Work</CardTitle>
            <CardDescription>The innovation behind the infinite chain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="bg-purple-500/10 text-purple-400 rounded-full w-10 h-10 flex items-center justify-center font-bold mb-2">
                  1
                </div>
                <h3 className="font-semibold">Pay for Content</h3>
                <p className="text-sm text-muted-foreground">
                  Submit payment to unlock current layer via x402 protocol
                </p>
              </div>
              <div className="space-y-2">
                <div className="bg-purple-500/10 text-purple-400 rounded-full w-10 h-10 flex items-center justify-center font-bold mb-2">
                  2
                </div>
                <h3 className="font-semibold">Reveal New Paywall</h3>
                <p className="text-sm text-muted-foreground">
                  Content includes another HTTP 402 endpoint requiring new payment
                </p>
              </div>
              <div className="space-y-2">
                <div className="bg-purple-500/10 text-purple-400 rounded-full w-10 h-10 flex items-center justify-center font-bold mb-2">
                  3
                </div>
                <h3 className="font-semibold">Chain Continues</h3>
                <p className="text-sm text-muted-foreground">
                  Process repeats infinitely - payments generate new paywalls
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
