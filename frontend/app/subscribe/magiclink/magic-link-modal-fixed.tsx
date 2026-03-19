"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
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

interface MagicLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MagicLinkModal({ open, onOpenChange, onSuccess }: MagicLinkModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMagicLink = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send magic link via your API
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/auth/callback?redirect=/subscribe`, // ← KEY FIX
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send magic link");
      }

      setSent(true);
    } catch (err) {
      console.error("Magic link error:", err);
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setSent(false);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#1A1A1A] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {sent ? "Check Your Email" : "Sign In with Magic Link"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {sent
              ? "We sent you a magic link to sign in."
              : "Enter your email to receive a magic link. No password required."}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="rounded-full bg-green-500/10 p-4 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                We sent a magic link to <strong className="text-white">{email}</strong>
              </p>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <p className="text-sm text-orange-200">
                <strong>⚡ Quick Start Bonus:</strong> You'll receive 5 free testnet STX to try x402Pay!
              </p>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <p>1. Check your inbox for an email from x402Pay</p>
              <p>2. Click the magic link in the email</p>
              <p>3. You'll be automatically signed in and redirected to your subscription page</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-white/20 text-white"
                onClick={() => setSent(false)}
              >
                Send Again
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-orange-500 text-black hover:bg-orange-400"
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    handleSendMagicLink();
                  }
                }}
                className="bg-[#0A0A0A] border-white/20 text-white placeholder:text-muted-foreground"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-200">How it works</p>
                  <p className="text-xs text-blue-300/80">
                    We'll email you a secure link. Click it to sign in instantly. No password needed!
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSendMagicLink}
              disabled={loading || !email}
              className="w-full bg-orange-500 text-black hover:bg-orange-400"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Magic Link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Magic Link
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
