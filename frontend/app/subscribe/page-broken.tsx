"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Sparkles, Zap, Loader2, ArrowLeft, Wallet } from "lucide-react";
import { request, AddressPurpose } from 'sats-connect';

import { Button } from "@/components/ui/button";
import { SubscriptionEnrollmentDialog } from "@/components/subscription-enrollment-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SubscriptionState {
  id?: string;
  status: "inactive" | "active";
  escrowBalance: number;
  intervalBlocks: number;
  strikes: number;
  autoStack: boolean;
  nextChargeBlock: number | null;
  lastChargeBlock: number | null;
  walletAddress: string;
}

const plans = [
  {
    id: "monthly",
    label: "Monthly Autopay",
    price: "1 STX",
    description: "Covers 1 month of premium drops + auto-stacking",
    perks: [
      "Auto-charge every ~30 days",
      "PoX rewards streamed to creator",
      "Cancel anytime with refunds",
      "Auto-stack every payout",
    ],
  },
  {
    id: "annual",
    label: "Annual Autopay",
    price: "10 STX",
    description: "12 months paid upfront, 2 months free",
    perks: [
      "Price-locked for a year",
      "Priority access to launches",
      "Auto-stack every payout",
    ],
  },
];

export default function SubscribePage() {
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  
  // Subscription state
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);

  // Check for saved wallet address on mount
  useEffect(() => {
    const saved = localStorage.getItem('walletAddress');
    if (saved) {
      setWalletAddress(saved);
    }
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    setIsConnecting(true);
    setWalletError(null);

    try {
      const response: any = await request('wallet_connect', {
        message: 'Connect to x402Pay for subscription management'
      } as any);

      console.log('Wallet response:', response);

      // Handle error response
      if (response?.status === 'error') {
        const errorMsg = response?.error?.message || 'Unknown error';
        const errorCode = response?.error?.code;
        
        const error: any = new Error(errorMsg);
        error.code = errorCode;
        throw error;
      }

      // Handle success response
      if (response?.status === 'success' && response?.result?.addresses) {
        const addresses = response.result.addresses;
        
        // Find Stacks address
        const stacksAddress = addresses.find((addr: any) => 
          addr.purpose === AddressPurpose.Stacks || 
          addr.addressType === 'stacks'
        );

        if (stacksAddress?.address) {
          setWalletAddress(stacksAddress.address);
          localStorage.setItem('walletAddress', stacksAddress.address);
          return;
        }
      }

      throw new Error('No Stacks addresses found in wallet');
    } catch (err: any) {
      console.error('Connection error:', err);
      
      // Handle specific errors
      if (err.code === -32002) {
        setWalletError('Connection cancelled. Please approve the request in your wallet.');
      } else if (err.message?.includes('not installed')) {
        setWalletError('Please install Xverse or Leather wallet extension.');
      } else {
        setWalletError(err.message || 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Fetch subscription data
  const fetchSubscription = async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription', {
        headers: {
          'x-wallet-address': walletAddress,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription when wallet connects
  useEffect(() => {
    if (walletAddress) {
      fetchSubscription();
    }
  }, [walletAddress]);

  // Handle subscription actions
  const handleSubscriptionAction = async (action: string, data?: any) => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': walletAddress,
        },
        body: JSON.stringify({ action, ...data }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      const result = await response.json();
      await fetchSubscription(); // Refresh data
    } catch (err) {
      console.error('Action error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  // Handle start subscription
  const handleStartSubscription = () => {
    if (!walletAddress) {
      connectWallet();
      return;
    }
    setEnrollmentOpen(true);
  };

  const getStatusBadge = () => {
    if (!subscription) return null;
    
    switch (subscription.status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500/20 text-gray-400">Inactive</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ArrowLeft className="h-5 w-5 mr-4 cursor-pointer hover:text-gray-400" onClick={() => window.history.back()} />
              <h1 className="text-xl font-semibold">x402Pay Subscriptions</h1>
            </div>
            {walletAddress && (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-400">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              Auto-stacking enabled
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              Relayer monitored every 10 minutes
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-16 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="border border-white/10 bg-[#13141A]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{plan.label}</CardTitle>
                {plan.id === "annual" ? (
                  <Badge className="bg-purple-500/20 text-purple-200">Best value</Badge>
                ) : null}
              </div>
              <CardDescription className="text-lg text-white">
                {plan.price}
                <span className="text-sm text-muted-foreground"> / interval</span>
              </CardDescription>
              <p className="text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm text-muted-foreground">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-orange-400" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-orange-500 text-black hover:bg-orange-400"
                onClick={handleStartSubscription}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : `Choose ${plan.label.split(" ")[0]}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="border-white/10 bg-[#101217]">
            <CardHeader>
              <CardTitle className="text-white">How Autopay Works</CardTitle>
              <CardDescription>Every charge is monitored and mirrored in Supabase.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {autopayTimeline.map((step) => (
                <div key={step.title} className="rounded border border-white/5 p-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                    {step.title}
                  </p>
                  <p className="mt-2 text-base text-white">{step.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-lime-500/20 bg-[#0E1107]">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Subscription Status</CardTitle>
                {statusChip}
              </div>
              <CardDescription>
                {subscription?.status === "active"
                  ? "Relayer checks every 10 minutes."
                  : "Complete magic link onboarding to unlock autopay."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white">
              {loading ? (
                <p className="text-muted-foreground">Loading subscription...</p>
              ) : error ? (
                <p className="text-red-400">{error}</p>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground">Escrow Balance</span>
                    <strong>{subscription?.escrowBalance ?? 0} STX</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Interval</span>
                    <strong>{subscription?.intervalBlocks ?? 4320} blocks</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Strikes</span>
                    <strong>{subscription?.strikes ?? 0} / 3</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Auto-stack</span>
                    <strong>{subscription?.autoStack ? "Enabled" : "Disabled"}</strong>
                  </div>
                  {subscription?.nextChargeBlock ? (
                    <div className="rounded bg-black/40 p-3 text-xs text-muted-foreground">
                      Next charge #{subscription.nextChargeBlock} • Last #{subscription.lastChargeBlock}
                    </div>
                  ) : null}
                </>
              )}
              <div className="mt-4 text-xs text-muted-foreground">
                <p>
                  Wallet: {shortAddress ?? "Not connected"} • Auth: {authLoading ? "Checking" : user ? `✅ ${user.email}` : "❌ Not logged in"}
                </p>
                
                {walletError && (
                  <div className="text-red-400 text-xs mt-2">
                    {walletError}
                  </div>
                )}
                
                {!user ? (
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white"
                    onClick={() => setMagicLinkOpen(true)}
                  >
                    Sign In with Magic Link
                  </Button>
                ) : !walletAddress ? (
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white"
                    onClick={connectWallet}
                    disabled={isConnecting}
                  >
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </Button>
                ) : (
                  <>
                    <div className="text-xs text-green-400 mb-2">
                      ✓ Wallet Connected: {shortAddress}
                    </div>
                    {subscription?.status === "active" ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-white/30 text-white"
                          onClick={handleTopUp}
                          disabled={actionLoading}
                        >
                          Top Up
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-red-500/30 text-red-400"
                          onClick={handleCancel}
                          disabled={actionLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground hover:text-white"
                      onClick={disconnectWallet}
                    >
                      Disconnect Wallet
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <MagicLinkModal
        open={magicLinkOpen}
        onOpenChange={setMagicLinkOpen}
        onSuccess={handleMagicLinkSuccess}
      />

      {walletAddress && (
        <SubscriptionEnrollmentDialog
          open={enrollmentOpen}
          onOpenChange={setEnrollmentOpen}
          onSuccess={fetchSubscription}
          userAddress={walletAddress}
        />
      )}
    </div>
  );
}