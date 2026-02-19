"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSubscription,
  waitForTransaction,
} from "@/lib/subscription-contract";

interface SubscriptionEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  userAddress: string;
}

type EnrollmentStep = "configure" | "signing" | "confirming" | "success" | "error";

export function SubscriptionEnrollmentDialog({
  open,
  onOpenChange,
  onSuccess,
  userAddress,
}: SubscriptionEnrollmentDialogProps) {
  const [step, setStep] = useState<EnrollmentStep>("configure");
  const [depositAmount, setDepositAmount] = useState("12");
  const [planId, setPlanId] = useState("monthly");
  const [intervalBlocks, setIntervalBlocks] = useState("4320");
  const [autoStack, setAutoStack] = useState(true);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep("signing");

    try {
      const merchantPrincipal =
        process.env.NEXT_PUBLIC_MERCHANT_PRINCIPAL ??
        "SP000000000000000000002Q6VF78";

      const depositMicroStx = parseFloat(depositAmount) * 1_000_000;

      const { txId: transactionId } = await createSubscription(
        {
          merchantPrincipal,
          depositAmount: depositMicroStx,
          intervalBlocks: parseInt(intervalBlocks),
          autoStack,
        },
        userAddress
      );

      setTxId(transactionId);
      setStep("confirming");

      await waitForTransaction(transactionId);

      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          subscriberPrincipal: userAddress,
          merchantPrincipal,
          planId,
          depositAmount: depositMicroStx,
          intervalBlocks: parseInt(intervalBlocks),
          autoStack,
          txId: transactionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create subscription");
      }

      setStep("success");

      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
        resetDialog();
      }, 2000);
    } catch (err) {
      console.error("Subscription enrollment error:", err);
      setError(err instanceof Error ? err.message : "Enrollment failed");
      setStep("error");
    }
  };

  const resetDialog = () => {
    setStep("configure");
    setDepositAmount("12");
    setPlanId("monthly");
    setIntervalBlocks("4320");
    setAutoStack(true);
    setTxId(null);
    setError(null);
  };

  const handleClose = () => {
    if (step === "signing" || step === "confirming") {
      return;
    }
    onOpenChange(false);
    setTimeout(resetDialog, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-white/10 bg-[#13141A] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {step === "configure" && "Start Subscription"}
            {step === "signing" && "Sign Transaction"}
            {step === "confirming" && "Confirming..."}
            {step === "success" && "Subscription Active!"}
            {step === "error" && "Enrollment Failed"}
          </DialogTitle>
          <DialogDescription>
            {step === "configure" &&
              "Configure your subscription parameters and deposit amount."}
            {step === "signing" &&
              "Please sign the transaction in your wallet."}
            {step === "confirming" &&
              "Waiting for transaction confirmation on-chain."}
            {step === "success" &&
              "Your subscription is now active and ready."}
            {step === "error" && "Something went wrong. Please try again."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === "configure" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan" className="text-white">
                  Plan
                </Label>
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger className="border-white/20 bg-[#1A1B23] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#1A1B23]">
                    <SelectItem value="monthly">Monthly (4320 blocks)</SelectItem>
                    <SelectItem value="annual">Annual (51840 blocks)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit" className="text-white">
                  Deposit Amount (STX)
                </Label>
                <Input
                  id="deposit"
                  type="number"
                  min="1"
                  step="0.1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="border-white/20 bg-[#1A1B23] text-white"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 12 STX (covers 12 monthly charges)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interval" className="text-white">
                  Interval (Blocks)
                </Label>
                <Input
                  id="interval"
                  type="number"
                  min="144"
                  step="144"
                  value={intervalBlocks}
                  onChange={(e) => setIntervalBlocks(e.target.value)}
                  className="border-white/20 bg-[#1A1B23] text-white"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  4320 blocks ≈ 30 days
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autostack"
                  checked={autoStack}
                  onChange={(e) => setAutoStack(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-[#1A1B23]"
                />
                <Label htmlFor="autostack" className="text-sm text-white">
                  Enable auto-stacking for BTC rewards
                </Label>
              </div>

              <div className="rounded border border-orange-500/20 bg-orange-500/10 p-3 text-xs text-orange-300">
                <p>
                  <strong>Note:</strong> You'll deposit {depositAmount} STX into
                  escrow. The relayer will charge 1 STX every {intervalBlocks}{" "}
                  blocks.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 text-black hover:bg-orange-400"
              >
                Create Subscription
              </Button>
            </form>
          )}

          {step === "signing" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className="rounded-full bg-orange-500/10 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
              </div>
              <div className="text-center">
                <p className="text-sm text-white">
                  Please sign the transaction in your wallet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This will create your subscription on-chain
                </p>
              </div>
            </div>
          )}

          {step === "confirming" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className="rounded-full bg-blue-500/10 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm text-white">
                  Waiting for confirmation...
                </p>
                {txId && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    TX: {txId.slice(0, 8)}...{txId.slice(-8)}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className="rounded-full bg-green-500/10 p-4">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-white">
                  Subscription Created!
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your autopay is now active
                </p>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-4 py-6">
                <div className="rounded-full bg-red-500/10 p-4">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-white">Enrollment Failed</p>
                  {error && (
                    <p className="mt-1 text-xs text-red-400">{error}</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/5"
                onClick={() => setStep("configure")}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
