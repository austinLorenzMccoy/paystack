"use client";

import { useState, useCallback } from "react";

export interface X402Challenge {
  address: string;
  amount: number;
  asset: string;
  contract: string | null;
  token: string;
  expires: string;
}

export interface X402State {
  loading: boolean;
  challenge: X402Challenge | null;
  hasAccess: boolean;
  error: string | null;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function gatewayUrl(path: string) {
  return `${SUPABASE_URL}/functions/v1/x402-gateway${path}`;
}

export function useX402() {
  const [state, setState] = useState<X402State>({
    loading: false,
    challenge: null,
    hasAccess: false,
    error: null,
  });

  /**
   * Check if the user already has access to content.
   * If not, returns the 402 challenge with payment instructions.
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
          });
          return { hasAccess: true, challenge: null };
        }

        if (res.status === 402) {
          const data = await res.json();
          const challenge: X402Challenge = {
            address: res.headers.get("X-Payment-Address") ?? data.payment.address,
            amount: Number(res.headers.get("X-Payment-Amount") ?? data.payment.amount),
            asset: res.headers.get("X-Payment-Asset") ?? data.payment.asset,
            contract: res.headers.get("X-Payment-Contract") || data.payment.contract,
            token: res.headers.get("X-Payment-Token") ?? data.payment.token,
            expires: res.headers.get("X-Payment-Expires") ?? data.payment.expires,
          };

          setState({
            loading: false,
            challenge,
            hasAccess: false,
            error: null,
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
   */
  const submitReceipt = useCallback(
    async (token: string, txId: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        const res = await fetch(gatewayUrl(""), {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, txId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Receipt submission failed");
        }

        setState({
          loading: false,
          challenge: null,
          hasAccess: true,
          error: null,
        });

        return { success: true, paymentId: data.paymentId };
      } catch (err: any) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err.message ?? "Receipt submission failed",
        }));
        return { success: false, paymentId: null };
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      loading: false,
      challenge: null,
      hasAccess: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    checkAccess,
    submitReceipt,
    reset,
  };
}
