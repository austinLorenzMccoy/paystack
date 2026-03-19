"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function AuthVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your magic link...");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          setStatus("error");
          setMessage("Invalid magic link. No token provided.");
          return;
        }

        // Verify token via API
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        // Success!
        setStatus("success");
        setMessage("Successfully signed in! Redirecting...");

        // Store session
        if (data.session) {
          localStorage.setItem("x402pay_session", JSON.stringify(data.session));
        }

        // Redirect to the intended page
        const redirectTo = data.redirectTo || "/subscribe";
        setTimeout(() => {
          router.push(redirectTo);
        }, 1500);

      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error 
            ? error.message 
            : "Failed to verify magic link. Please try again."
        );
        
        // Redirect to home after error
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {status === "loading" && (
              <div className="rounded-full bg-orange-500/10 p-4">
                <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="rounded-full bg-green-500/10 p-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            )}
            {status === "error" && (
              <div className="rounded-full bg-red-500/10 p-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3">
            {status === "loading" && "Verifying..."}
            {status === "success" && "Welcome Back!"}
            {status === "error" && "Verification Failed"}
          </h1>

          {/* Message */}
          <p className="text-muted-foreground mb-6">
            {message}
          </p>

          {/* Progress dots for loading */}
          {status === "loading" && (
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}

          {/* Success bonus info */}
          {status === "success" && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-6">
              <p className="text-sm text-green-200">
                🎁 <strong>Welcome Bonus:</strong> 5 testnet STX credited to your account!
              </p>
            </div>
          )}

          {/* Error action */}
          {status === "error" && (
            <button
              onClick={() => router.push("/")}
              className="w-full bg-orange-500 hover:bg-orange-400 text-black font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Return to Home
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Built on Stacks • Secured by Bitcoin
        </p>
      </div>
    </div>
  );
}
