"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function AuthCallbackPage() {
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

        // Redirect to the intended page
        const redirectTo = data.redirectTo || "/subscribe";
        setTimeout(() => {
          router.push(redirectTo);
        }, 2000);
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Verification failed");
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          {status === "loading" && (
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          )}
          {status === "success" && (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          )}
          {status === "error" && (
            <XCircle className="h-12 w-12 text-red-500" />
          )}
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">
            {status === "loading" && "Verifying..."}
            {status === "success" && "Success!"}
            {status === "error" && "Error"}
          </h1>
          <p className="text-gray-400">
            {message}
          </p>
        </div>

        {status === "error" && (
          <button
            onClick={() => router.push("/subscribe")}
            className="mt-4 px-6 py-2 bg-orange-500 text-black rounded-lg hover:bg-orange-400 transition-colors"
          >
            Back to Subscribe
          </button>
        )}
      </div>
    </div>
  );
}
