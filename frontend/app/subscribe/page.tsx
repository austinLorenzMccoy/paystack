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
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Section */}
        {subscription && (
          <Card className="bg-[#1A1A1A] border-gray-800 mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  Your Subscription
                </CardTitle>
                {getStatusBadge()}
              </div>
              <CardDescription>
                Manage your autopay subscription and rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Escrow Balance</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {subscription.escrowBalance} STX
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Auto-Stack</p>
                  <p className="text-lg font-semibold">
                    {subscription.autoStack ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Strikes</p>
                  <p className="text-lg font-semibold">{subscription.strikes}/3</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Next Charge</p>
                  <p className="text-lg font-semibold">
                    {subscription.nextChargeBlock 
                      ? `Block ${subscription.nextChargeBlock}`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                {subscription.status === 'active' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleSubscriptionAction('topup', { amount: 5 })}
                      disabled={loading}
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Top Up (5 STX)
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleSubscriptionAction('cancel')}
                      disabled={loading}
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Cancel Subscription
                    </Button>
                  </>
                )}
                {subscription.autoStack && (
                  <Button
                    onClick={() => handleSubscriptionAction('toggle-autostack')}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Disable Auto-Stack
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-gray-400 mb-8">
            Start earning Bitcoin rewards on your subscription payments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan) => (
            <Card key={plan.id} className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle>{plan.label}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500 mb-6">
                  {plan.price}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.perks.map((perk, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{perk}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => setEnrollmentOpen(true)}
                  disabled={!walletAddress}
                >
                  {!walletAddress ? 'Connect Wallet First' : `Choose ${plan.label}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Wallet Connection */}
        {!walletAddress && (
          <Card className="bg-[#1A1A1A] border-gray-800 text-center">
            <CardContent className="py-12">
              <Wallet className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 mb-6">
                Connect your Stacks wallet to manage subscriptions
              </p>
              <Button onClick={handleStartSubscription} disabled={isConnecting}>
                {isConnecting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Connect Wallet
              </Button>
              {walletError && (
                <p className="text-sm text-red-400 mt-4">{walletError}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* x402 Demo Link */}
        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardContent className="py-8 text-center">
            <Zap className="h-8 w-8 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Try HTTP 402 Payment Protocol</h3>
            <p className="text-gray-400 mb-4">
              Experience the future of micropayments with our interactive demo
            </p>
            <Button variant="outline" asChild>
              <a href="/x402-demo">View x402 Demo</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Dialog */}
      <SubscriptionEnrollmentDialog
        open={enrollmentOpen}
        onOpenChange={setEnrollmentOpen}
        walletAddress={walletAddress}
        onSuccess={() => {
          setEnrollmentOpen(false);
          fetchSubscription();
        }}
      />

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500 rounded-lg p-4 max-w-md">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
