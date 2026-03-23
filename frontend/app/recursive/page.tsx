"use client";

import { useState, useEffect } from "react";
import { Loader2, Lock, Unlock, Layers, ArrowRight, RotateCcw, Zap, TrendingUp } from "lucide-react";

export default function RecursiveX402Demo() {
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const [currentLayer, setCurrentLayer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    usedHashesCount: 0,
  });

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
    loadLayer();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

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
      // Generate fake transaction hash
      const fakeHash = Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      // Verify payment and get token
      const res = await fetch('/api/x402/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: fakeHash,
          walletAddress: 'SP2ABC...XYZ',
          amount: currentLayer.nextLayer.price,
        }),
      });
      
      const data = await res.json();
      
      if (data.accessToken) {
        await loadLayer(data.accessToken);
        await fetchStats();
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
    <div className="min-h-screen bg-black text-white font-['IBM_Plex_Sans']">
      {/* Header */}
      <header className="sticky top-0 bg-black/90 backdrop-blur-md border-b-2 border-[#4A4A4A] z-50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="font-['JetBrains_Mono'] text-2xl font-extrabold text-[#F7931A] uppercase tracking-[0.1em]">
            X402PAY
          </div>
          <nav className="flex gap-8">
            <a href="/" className="font-['JetBrains_Mono'] text-sm uppercase text-white hover:text-[#F7931A] transition-colors relative group">
              HOME
              <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#F7931A] group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="/dashboard" className="font-['JetBrains_Mono'] text-sm uppercase text-white hover:text-[#F7931A] transition-colors relative group">
              DASHBOARD
              <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#F7931A] group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="#" className="font-['JetBrains_Mono'] text-sm uppercase text-[#F7931A] relative">
              RECURSIVE
              <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-[#F7931A]"></span>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="inline-block mb-6 px-4 py-2 border-2 border-[#5546FF] bg-transparent">
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.3em] text-[#5546FF]">
              RECURSIVE PAYMENTS
            </span>
          </div>
          <h1 className="font-['JetBrains_Mono'] text-6xl font-extrabold uppercase mb-6 leading-tight">
            THE <span className="text-[#F7931A]">INFINITE</span><br />
            PAYMENT CHAIN
          </h1>
          <p className="text-xl text-[#E0E0E0] max-w-2xl mx-auto">
            Each payment unlocks content that generates a new paywall.<br />
            Watch payments chain themselves autonomously.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1A1A1A] border-2 border-[#2D2D2D] p-8 transition-all duration-200 hover:border-[#F7931A] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0_#F7931A]">
            <div className="flex items-center gap-4 mb-4">
              <Layers className="w-8 h-8 text-[#5546FF]" />
              <span className="font-['JetBrains_Mono'] text-sm uppercase text-[#E0E0E0]">Depth</span>
            </div>
            <div className="font-['JetBrains_Mono'] text-4xl font-bold text-white">
              {currentLayer?.depth ?? 0}
            </div>
            <div className="font-['JetBrains_Mono'] text-xs text-[#4A4A4A] mt-2">CURRENT LAYER</div>
          </div>

          <div className="bg-[#1A1A1A] border-2 border-[#2D2D2D] p-8 transition-all duration-200 hover:border-[#F7931A] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0_#F7931A]">
            <div className="flex items-center gap-4 mb-4">
              <Zap className="w-8 h-8 text-[#F7931A]" />
              <span className="font-['JetBrains_Mono'] text-sm uppercase text-[#E0E0E0]">Spent</span>
            </div>
            <div className="font-['JetBrains_Mono'] text-4xl font-bold text-[#F7931A]">
              {totalSpent.toFixed(1)} STX
            </div>
            <div className="font-['JetBrains_Mono'] text-xs text-[#4A4A4A] mt-2">TOTAL INVESTED</div>
          </div>

          <div className="bg-[#1A1A1A] border-2 border-[#2D2D2D] p-8 transition-all duration-200 hover:border-[#F7931A] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0_#F7931A]">
            <div className="flex items-center gap-4 mb-4">
              <TrendingUp className="w-8 h-8 text-[#00FF41]" />
              <span className="font-['JetBrains_Mono'] text-sm uppercase text-[#E0E0E0]">Unlocked</span>
            </div>
            <div className="font-['JetBrains_Mono'] text-4xl font-bold text-white">
              {history.length}
            </div>
            <div className="font-['JetBrains_Mono'] text-xs text-[#4A4A4A] mt-2">LAYERS ACCESSED</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
          {/* Current Layer Card */}
          <div className="bg-[#1A1A1A] border-2 border-[#2D2D2D]">
            <div className="p-8 border-b-2 border-[#2D2D2D]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {currentLayer?.depth === 0 ? (
                    <Unlock className="w-6 h-6 text-[#00FF41]" />
                  ) : (
                    <Unlock className="w-6 h-6 text-[#5546FF]" />
                  )}
                  <h2 className="font-['JetBrains_Mono'] text-2xl font-bold uppercase">
                    {loading ? "LOADING..." : currentLayer?.title || "INITIALIZING..."}
                  </h2>
                </div>
                <div className="px-4 py-2 border-2 border-[#5546FF] bg-transparent">
                  <span className="font-['JetBrains_Mono'] text-xs uppercase text-[#5546FF]">
                    LAYER {currentLayer?.depth ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-12 h-12 animate-spin text-[#5546FF]" />
                </div>
              ) : currentLayer ? (
                <>
                  {/* Content */}
                  <div className="bg-black border-2 border-[#2D2D2D] p-8">
                    <p className="text-[#E0E0E0] leading-relaxed text-lg">
                      {currentLayer.content}
                    </p>
                  </div>

                  {/* Next Layer Payment */}
                  {currentLayer.nextLayer ? (
                    <div className="bg-[#5546FF]/10 border-2 border-[#5546FF]/30 p-8">
                      <div className="flex items-start gap-6">
                        <Lock className="w-12 h-12 text-[#5546FF] flex-shrink-0 mt-2" />
                        <div className="flex-1">
                          <h3 className="font-['JetBrains_Mono'] text-xl font-bold uppercase mb-4 text-[#5546FF]">
                            NEXT LAYER LOCKED
                          </h3>
                          <p className="text-[#E0E0E0] mb-6 leading-relaxed">
                            {currentLayer.nextLayer.prompt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-['JetBrains_Mono'] text-4xl font-bold text-[#5546FF]">
                                {currentLayer.nextLayer.price} STX
                              </div>
                              <div className="font-['JetBrains_Mono'] text-xs text-[#4A4A4A] mt-1 uppercase">
                                Payment Required
                              </div>
                            </div>
                            <button
                              onClick={payForNextLayer}
                              disabled={loading}
                              className="bg-[#5546FF] text-white px-8 py-4 font-['JetBrains_Mono'] text-sm uppercase font-bold border-2 border-[#5546FF] transition-all duration-200 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0_#F7931A] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? (
                                <span className="flex items-center gap-3">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  PROCESSING...
                                </span>
                              ) : (
                                <span className="flex items-center gap-3">
                                  PAY & UNLOCK
                                  <ArrowRight className="w-4 h-4" />
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : currentLayer.message ? (
                    <div className="bg-[#00FF41]/10 border-2 border-[#00FF41]/30 p-8 text-center">
                      <Unlock className="w-16 h-16 text-[#00FF41] mx-auto mb-6" />
                      <h3 className="font-['JetBrains_Mono'] text-2xl font-bold uppercase mb-4 text-[#00FF41]">
                        JOURNEY COMPLETE
                      </h3>
                      <p className="text-[#E0E0E0] text-lg">
                        {currentLayer.message}
                      </p>
                    </div>
                  ) : null}
                </>
              ) : null}

              <button
                onClick={reset}
                className="w-full bg-transparent text-white px-6 py-4 font-['JetBrains_Mono'] text-sm uppercase font-bold border-2 border-[#4A4A4A] transition-all duration-200 hover:border-[#F7931A] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0_#F7931A]"
              >
                <span className="flex items-center justify-center gap-3">
                  <RotateCcw className="w-4 h-4" />
                  START OVER
                </span>
              </button>
            </div>
          </div>

          {/* History Sidebar */}
          <div className="bg-[#1A1A1A] border-2 border-[#2D2D2D]">
            <div className="p-6 border-b-2 border-[#2D2D2D]">
              <h3 className="font-['JetBrains_Mono'] text-lg uppercase font-bold">
                PAYMENT HISTORY
              </h3>
              <p className="text-sm text-[#4A4A4A] mt-1">Your recursive journey</p>
            </div>
            <div className="p-6 space-y-4">
              {history.length === 0 ? (
                <p className="text-sm text-[#4A4A4A] text-center py-12 font-['JetBrains_Mono']">
                  NO PAYMENTS YET
                </p>
              ) : (
                history.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-black border-2 border-[#2D2D2D] p-4 transition-all duration-200 hover:border-[#5546FF]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-['JetBrains_Mono'] text-sm font-bold uppercase">
                        LAYER {item.depth}
                      </span>
                      {item.spent > 0 && (
                        <span className="px-2 py-1 border border-[#F7931A]/30 font-['JetBrains_Mono'] text-xs text-[#F7931A]">
                          {item.spent} STX
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#E0E0E0] line-clamp-2">
                      {item.title}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Flow Explanation */}
        <div className="mt-16 bg-[#1A1A1A] border-2 border-[#2D2D2D]">
          <div className="p-8 border-b-2 border-[#2D2D2D]">
            <h2 className="font-['JetBrains_Mono'] text-2xl font-bold uppercase">
              HOW RECURSIVE PAYMENTS WORK
            </h2>
            <p className="text-[#4A4A4A] mt-2">The innovation behind the infinite chain</p>
          </div>
          <div className="p-8 grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 bg-[#5546FF]/10 border-2 border-[#5546FF] flex items-center justify-center font-['JetBrains_Mono'] text-xl font-bold text-[#5546FF] mb-4">
                1
              </div>
              <h3 className="font-['JetBrains_Mono'] text-lg font-bold uppercase mb-3">PAY FOR CONTENT</h3>
              <p className="text-sm text-[#E0E0E0] leading-relaxed">
                Submit payment to unlock current layer via x402 protocol
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-[#5546FF]/10 border-2 border-[#5546FF] flex items-center justify-center font-['JetBrains_Mono'] text-xl font-bold text-[#5546FF] mb-4">
                2
              </div>
              <h3 className="font-['JetBrains_Mono'] text-lg font-bold uppercase mb-3">REVEAL NEW PAYWALL</h3>
              <p className="text-sm text-[#E0E0E0] leading-relaxed">
                Content includes another HTTP 402 endpoint requiring new payment
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-[#5546FF]/10 border-2 border-[#5546FF] flex items-center justify-center font-['JetBrains_Mono'] text-xl font-bold text-[#5546FF] mb-4">
                3
              </div>
              <h3 className="font-['JetBrains_Mono'] text-lg font-bold uppercase mb-3">CHAIN CONTINUES</h3>
              <p className="text-sm text-[#E0E0E0] leading-relaxed">
                Process repeats infinitely - payments generate new paywalls
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#2D2D2D] mt-24">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex justify-between items-center">
            <div className="font-['JetBrains_Mono'] text-sm text-[#4A4A4A]">
              2026 X402PAY. BUILT ON STACKS. SECURED BY BITCOIN.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse"></span>
              <span className="font-['JetBrains_Mono'] text-sm text-[#00FF41]">TESTNET</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
