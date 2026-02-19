"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Loader2, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type ModalStep = "email" | "verify" | "success";

interface MagicLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MagicLinkModal({
  open,
  onOpenChange,
  onSuccess,
}: MagicLinkModalProps) {
  const [step, setStep] = useState<ModalStep>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !supabase) return;

    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/subscribe`,
        },
      });

      if (signInError) throw signInError;

      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    try {
      // Poll for session (user clicks link in email)
      const pollInterval = setInterval(async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          clearInterval(pollInterval);
          setStep("success");
          setLoading(false);

          // Wait a moment then close and trigger success callback
          setTimeout(() => {
            onOpenChange(false);
            onSuccess?.();
            resetModal();
          }, 2000);
        }
      }, 2000);

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setLoading(false);
        setError("Verification timed out. Please try again.");
      }, 5 * 60 * 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep("email");
    setEmail("");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetModal, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-white/10 bg-[#13141A] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {step === "email" && "Magic Link Onboarding"}
            {step === "verify" && "Check Your Email"}
            {step === "success" && "Welcome!"}
          </DialogTitle>
          <DialogDescription>
            {step === "email" &&
              "Enter your email to receive a magic link for instant access."}
            {step === "verify" &&
              "Click the link in your email to complete sign-in."}
            {step === "success" &&
              "You're all set! Your custodial wallet is ready."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === "email" && (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-white"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-white/20 bg-[#1A1B23] pl-10 text-white placeholder:text-muted-foreground"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-500 text-black hover:bg-orange-400"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>

              <div className="space-y-2 rounded border border-white/10 bg-black/20 p-3 text-xs text-muted-foreground">
                <p className="flex items-start gap-2">
                  <Wallet className="mt-0.5 h-3 w-3 flex-shrink-0" />
                  <span>
                    A custodial wallet will be created for you automatically.
                    You can connect your own wallet later.
                  </span>
                </p>
              </div>
            </form>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-4 py-6">
                <div className="rounded-full bg-orange-500/10 p-4">
                  <Mail className="h-8 w-8 text-orange-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-white">
                    We sent a magic link to:
                  </p>
                  <p className="mt-1 font-medium text-orange-400">{email}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Waiting for verification...
                </div>
              </div>

              {error && (
                <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/5"
                onClick={() => setStep("email")}
                disabled={loading}
              >
                Use Different Email
              </Button>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className="rounded-full bg-green-500/10 p-4">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-white">
                  Successfully Verified!
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your account is ready. Redirecting...
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
