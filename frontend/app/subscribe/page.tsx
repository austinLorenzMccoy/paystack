"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Sparkles, Zap, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MagicLinkModal } from "@/components/magic-link-modal";
import { SubscriptionEnrollmentDialog } from "@/components/subscription-enrollment-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/wallet-context";
import { useAuth } from "@/contexts/auth-context";

interface SubscriptionState {
  id?: string;
  status: "inactive" | "active";
  escrowBalance: number;
  intervalBlocks: number;
  strikes: number;
  autoStack: boolean;
  nextChargeBlock: number | null;
  lastChargeBlock: number | null;
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

const autopayTimeline = [
  {
    title: "Escrow Deposit",
    detail: "Subscriber deposits 12 STX (covers 12 cycles)",
  },
  {
    title: "Relayer Charge",
    detail: "Relayer calls charge-subscription when interval elapsed",
  },
  {
    title: "Auto-Stack",
    detail: "1 STX routed to PoX delegate for BTC yield",
  },
  {
    title: "Creator Paid",
    detail: "Balance + stacking stats update instantly",
  },
];

export default function SubscribePage() {
  const { shortAddress, connectWallet, isConnecting } = useWallet();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkOpen, setMagicLinkOpen] = useState(false);
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/subscription");
      const json = await res.json();
      setSubscription(json.subscription);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const handleStartSubscription = () => {
    if (!user) {
      setMagicLinkOpen(true);
      return;
    }
    if (!shortAddress) {
      connectWallet();
      return;
    }
    setEnrollmentOpen(true);
  };

  const handleTopUp = async () => {
    if (!subscription?.id || !shortAddress) return;
    setActionLoading(true);
    try {
      const { topUpSubscription, waitForTransaction } = await import("@/lib/subscription-contract");
      const amount = parseFloat(prompt("Enter top-up amount (STX):", "5") || "0");
      if (amount <= 0) return;

      const { txId } = await topUpSubscription(amount * 1_000_000, shortAddress);
      await waitForTransaction(txId);

      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "topup",
          subscriptionId: subscription.id,
          amount: amount * 1_000_000,
          txId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record top-up");
      }

      await fetchSubscription();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Top-up failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription?.id || !shortAddress) return;
    if (!confirm("Are you sure you want to cancel your subscription? Remaining balance will be refunded.")) return;
    
    setActionLoading(true);
    try {
      const { cancelSubscription, waitForTransaction } = await import("@/lib/subscription-contract");
      const { txId } = await cancelSubscription(shortAddress);
      await waitForTransaction(txId);

      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          subscriptionId: subscription.id,
          txId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      await fetchSubscription();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancellation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAutoStack = async () => {
    if (!subscription?.id || !shortAddress) return;
    setActionLoading(true);
    try {
      const { toggleAutoStack, waitForTransaction } = await import("@/lib/subscription-contract");
      const newState = !subscription.autoStack;
      const { txId } = await toggleAutoStack(newState, shortAddress);
      await waitForTransaction(txId);

      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-autostack",
          subscriptionId: subscription.id,
          autoStack: newState,
          txId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle auto-stack");
      }

      await fetchSubscription();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Toggle failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMagicLinkSuccess = () => {
    fetchSubscription();
  };

  const statusChip = useMemo(() => {
    if (!subscription) return null;
    if (subscription.status === "active") {
      return (
        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
          Active Autopay
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500/10 text-yellow-300 border-yellow-500/20">
        Not Subscribed
      </Badge>
    );
  }, [subscription]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-gradient-to-br from-[#0B0B0C] via-[#0F1115] to-[#1B1E24] px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-4 border border-orange-500/40 bg-transparent text-xs uppercase tracking-[0.3em] text-orange-400">
            Autopay + PoX Rewards
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Subscribe Monthly. Auto-Stack BTC Rewards.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Zero-friction autopay for creator memberships. Magic link onboarding, escrow safety,
            and automatic stacking yields.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button 
              size="lg" 
              className="bg-orange-500 text-black hover:bg-orange-400"
              onClick={handleStartSubscription}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Start Subscription"
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:border-white hover:bg-white/5"
            >
              View Autopay Contract
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              Non-custodial escrow
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
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
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <p>
                  Wallet: {shortAddress ?? "Connect wallet"} • Auth: {authLoading ? "Checking" : user ? "Magic link" : "Guest"}
                </p>
                {!user ? (
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white"
                    onClick={() => setMagicLinkOpen(true)}
                  >
                    Sign In with Magic Link
                  </Button>
                ) : !shortAddress ? (
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white"
                    onClick={connectWallet}
                    disabled={isConnecting}
                  >
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </Button>
                ) : subscription?.status === "active" ? (
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

      {shortAddress && (
        <SubscriptionEnrollmentDialog
          open={enrollmentOpen}
          onOpenChange={setEnrollmentOpen}
          onSuccess={fetchSubscription}
          userAddress={shortAddress}
        />
      )}
    </div>
  );
}
