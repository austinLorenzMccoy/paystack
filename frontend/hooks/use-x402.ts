"use client";

import { useState, useCallback } from "react";

// ── x402 v2 Standard Types ───────────────────────────────────────────

export interface X402PaymentOption {
  scheme: string;
  network: string;
  amount: string;
  asset: string;
  payTo: string;
  extra?: Record<string, unknown>;
}

export interface X402PaymentRequirements {
  x402Version: number;
  scheme: string;
  network: string;
  resource: { url: string; description: string };
  accepts: X402PaymentOption[];
  extra?: { challengeToken: string; expires: string };
}

export interface X402Settlement {
  txId: string;
  status: string;
  amount: string;
  asset: string;
  payTo: string;
  settledAt: string;
}

// ── Legacy + Combined Challenge Type ─────────────────────────────────

export interface X402Challenge {
  address: string;
  amount: number;
  asset: string;
  contract: string | null;
  token: string;
  expires: string;
  // x402 v2 standard fields
  x402Version?: number;
  scheme?: string;
  network?: string;
  accepts?: X402PaymentOption[];
}

export interface X402State {
  loading: boolean;
  challenge: X402Challenge | null;
  hasAccess: boolean;
  error: string | null;
  settlement: X402Settlement | null;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function gatewayUrl(path: string) {
  return `${SUPABASE_URL}/functions/v1/x402-gateway${path}`;
}

function fromBase64<T = unknown>(str: string): T {
  return JSON.parse(atob(str));
}

function toBase64(obj: unknown): string {
  return btoa(JSON.stringify(obj));
}

export function useX402() {
  const [state, setState] = useState<X402State>({
    loading: false,
    challenge: null,
    hasAccess: false,
    error: null,
    settlement: null,
  });

  /**
   * Check if the user already has access to content.
   * If not, returns the 402 challenge with payment instructions.
   * Reads both x402 v2 PAYMENT-REQUIRED header and legacy headers/body.
   */
  const checkAccess = useCallback(
    async (contentId: string, address?: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        const params = new URLSearchParams({ contentId });
        if (address) params.set("address", address);

        const res = await fetch(gatewayUrl(`?${params}`), {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 200) {
          setState({
            loading: false,
            challenge: null,
            hasAccess: true,
            error: null,
            settlement: null,
          });
          return { hasAccess: true, challenge: null };
        }

        if (res.status === 402) {
          const data = await res.json();

          // Try x402 v2 standard PAYMENT-REQUIRED header first
          const paymentRequiredHeader = res.headers.get("Payment-Required");
          let challenge: X402Challenge;

          if (paymentRequiredHeader) {
            const requirements = fromBase64<X402PaymentRequirements>(paymentRequiredHeader);
            const primary = requirements.accepts[0];
            challenge = {
              address: primary?.payTo ?? data.payment?.address,
              amount: Number(primary?.amount ?? data.payment?.amount),
              asset: primary?.asset ?? data.payment?.asset,
              contract: primary?.extra?.contractAddress as string ?? data.payment?.contract ?? null,
              token: requirements.extra?.challengeToken ?? data.payment?.token,
              expires: requirements.extra?.expires ?? data.payment?.expires,
              x402Version: requirements.x402Version,
              scheme: requirements.scheme,
              network: requirements.network,
              accepts: requirements.accepts,
            };
          } else {
            // Fallback to legacy headers/body
            challenge = {
              address: res.headers.get("X-Payment-Address") ?? data.payment.address,
              amount: Number(res.headers.get("X-Payment-Amount") ?? data.payment.amount),
              asset: res.headers.get("X-Payment-Asset") ?? data.payment.asset,
              contract: res.headers.get("X-Payment-Contract") || data.payment.contract,
              token: res.headers.get("X-Payment-Token") ?? data.payment.token,
              expires: res.headers.get("X-Payment-Expires") ?? data.payment.expires,
            };
          }

          setState({
            loading: false,
            challenge,
            hasAccess: false,
            error: null,
            settlement: null,
          });
          return { hasAccess: false, challenge };
        }

        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `Unexpected status ${res.status}`);
      } catch (err: any) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err.message ?? "Access check failed",
        }));
        return { hasAccess: false, challenge: null };
      }
    },
    []
  );

  /**
   * Submit a payment receipt (txId) to unlock content.
   * Sends both x402 v2 PAYMENT-SIGNATURE header and legacy JSON body.
   */
  const submitReceipt = useCallback(
    async (token: string, txId: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        // Build x402 v2 PaymentPayload
        const paymentPayload = {
          scheme: "exact",
          network: state.challenge?.network ?? "stacks:2147483648",
          payload: { txId, token },
        };

        const res = await fetch(gatewayUrl(""), {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
            // x402 v2 standard header
            "Payment-Signature": toBase64(paymentPayload),
          },
          // Legacy body for backward compatibility
          body: JSON.stringify({ token, txId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Receipt submission failed");
        }

        // Read x402 v2 PAYMENT-RESPONSE header
        let settlement: X402Settlement | null = null;
        const paymentResponseHeader = res.headers.get("Payment-Response");
        if (paymentResponseHeader) {
          const parsed = fromBase64<{ settlement: X402Settlement }>(paymentResponseHeader);
          settlement = parsed.settlement;
        } else if (data.settlement) {
          settlement = data.settlement;
        }

        setState({
          loading: false,
          challenge: null,
          hasAccess: true,
          error: null,
          settlement,
        });

        return { success: true, paymentId: data.paymentId, settlement };
      } catch (err: any) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err.message ?? "Receipt submission failed",
        }));
        return { success: false, paymentId: null, settlement: null };
      }
    },
    [state.challenge?.network]
  );

  const reset = useCallback(() => {
    setState({
      loading: false,
      challenge: null,
      hasAccess: false,
      error: null,
      settlement: null,
    });
  }, []);

  return {
    ...state,
    checkAccess,
    submitReceipt,
    reset,
  };
}
