"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Lock, Unlock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function X402DemoPage() {
  const [step, setStep] = useState<"locked" | "paying" | "unlocked">("locked");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    usedHashesCount: 0,
  });

  // Fetch stats on mount
  useState(() => {
    fetchStats();
  });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Step 1: Try to access protected endpoint (expect 402)
  const tryAccessEndpoint = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/generate?prompt=web3 payments');
      const data = await res.json();

      if (res.status === 402) {
        console.log("💰 HTTP 402 Payment Required:", data);
        setError(data.message);
        setStep("paying");
      } else {
        // Already have access
        setAiContent(data.content);
        setStep("unlocked");
      }
    } catch (err) {
      setError("Failed to access endpoint");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Simulate payment and get access token
  const simulatePayment = async () => {
    if (!txHash) {
      setError("Please enter a transaction hash");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/x402/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash,
          walletAddress: "ST1PQHQKV0RJXZYY1D4XZDGVXN5BGSJVGX13EHHJ",
          amount: 1,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Payment verified:", data);
        setAccessToken(data.accessToken);
        setStep("unlocked");
        
        // Auto-fetch content with token
        await fetchContentWithToken(data.accessToken);
        
        // Refresh stats
        await fetchStats();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Payment verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Fetch protected content with token
  const fetchContentWithToken = async (token: string) => {
    try {
      const res = await fetch('/api/ai/generate?prompt=web3 payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setAiContent(data.content);
      } else {
        setError("Failed to fetch content");
      }
    } catch (err) {
      setError("Content fetch failed");
    }
  };

  // Generate a fake transaction hash for demo
  const generateDemoHash = () => {
    const hash = Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setTxHash(hash);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            x402 Payment Protocol Demo
          </h1>
          <p className="text-xl text-gray-400">
            Experience HTTP 402 Payment Required - The Future of Micropayments
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-[#1A1A1A] border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {stats.totalTransactions}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {stats.totalRevenue} STX total revenue
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Used Hashes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {stats.usedHashesCount}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Unique transaction hashes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full ${step === 'unlocked' ? 'bg-green-500' : 'bg-gray-600'}`} />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold capitalize">
                {step === 'locked' && 'Content Locked'}
                {step === 'paying' && 'Payment Required'}
                {step === 'unlocked' && 'Access Unlocked'}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {accessToken ? 'Token valid' : 'No token'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Demo Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Flow */}
          <Card className="bg-[#1A1A1A] border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {step === 'locked' && <Lock className="h-5 w-5 text-red-500" />}
                {step === 'paying' && <Zap className="h-5 w-5 text-orange-500" />}
                {step === 'unlocked' && <Unlock className="h-5 w-5 text-green-500" />}
                Payment Flow
              </CardTitle>
              <CardDescription>
                Step-by-step HTTP 402 payment process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className={`p-4 rounded-lg border ${
                step === 'locked' ? 'border-red-500 bg-red-500/10' : 'border-gray-700'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Step 1: Request Protected Content</h3>
                  {step !== 'locked' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  Try to access AI-generated content without payment
                </p>
                <Button 
                  onClick={tryAccessEndpoint}
                  disabled={loading || step !== 'locked'}
                  className="w-full"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Request Protected Endpoint
                </Button>
              </div>

              {/* Step 2 */}
              <div className={`p-4 rounded-lg border ${
                step === 'paying' ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700'
              } ${step === 'locked' ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Step 2: Complete Payment</h3>
                  {step === 'unlocked' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  Submit transaction hash to verify on-chain payment
                </p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Transaction hash (64 chars)"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      disabled={step !== 'paying'}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={generateDemoHash}
                      disabled={step !== 'paying'}
                    >
                      Demo Hash
                    </Button>
                  </div>
                  <Button 
                    onClick={simulatePayment}
                    disabled={loading || step !== 'paying'}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Simulate Payment (1 STX)
                  </Button>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`p-4 rounded-lg border ${
                step === 'unlocked' ? 'border-green-500 bg-green-500/10' : 'border-gray-700'
              } ${step === 'locked' ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Step 3: Access Unlocked</h3>
                  {step === 'unlocked' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  Content automatically unlocked with access token
                </p>
                {accessToken && (
                  <div className="p-2 bg-gray-800 rounded text-xs font-mono break-all">
                    Token: {accessToken.slice(0, 20)}...
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Display */}
          <Card className="bg-[#1A1A1A] border-gray-800">
            <CardHeader>
              <CardTitle>Protected Content</CardTitle>
              <CardDescription>
                AI-generated Web3 payment insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiContent ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      Content Unlocked
                    </Badge>
                    <span className="text-sm text-gray-400">
                      Generated by x402-ai-v1
                    </span>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <p className="text-gray-300 leading-relaxed">
                      {aiContent}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('locked')}
                    className="w-full"
                  >
                    Reset Demo
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">
                    Content is locked behind HTTP 402 payment
                  </p>
                  <p className="text-sm text-gray-500">
                    Complete the payment flow to unlock AI-generated insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* HTTP 402 Info */}
        <Card className="bg-[#1A1A1A] border-gray-800 mt-8">
          <CardHeader>
            <CardTitle>HTTP 402 Payment Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-orange-500">What is HTTP 402?</h4>
                <p className="text-sm text-gray-400">
                  A status code proposed in 1998 for "Payment Required", waiting for its killer app. x402Pay brings it to life with Bitcoin.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-orange-500">How it Works</h4>
                <p className="text-sm text-gray-400">
                  Server returns 402 → Client pays → Gets access token → Unlocks content. No email, no passwords, just pure Web3.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-orange-500">Why it Matters</h4>
                <p className="text-sm text-gray-400">
                  Enables true micropayments, reduces fees from 10-20% to 2.5%, and puts creators in control of their monetization.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
