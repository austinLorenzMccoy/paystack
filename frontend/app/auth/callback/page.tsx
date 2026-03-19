"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// Component that uses useSearchParams
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirect = searchParams.get("redirect") || "/subscribe";
    
    // Small delay to ensure session is set
    setTimeout(() => {
      console.log(" Redirecting to:", redirect);
      router.push(redirect);
    }, 500);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-orange-500/10 p-4">
              <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Redirecting...
          </h1>
          <p className="text-muted-foreground">
            Please wait while we redirect you to your destination.
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-orange-500/10 p-4">
              <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Loading...
          </h1>
          <p className="text-muted-foreground">
            Please wait while we prepare your verification page.
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CallbackContent />
    </Suspense>
  );
}
