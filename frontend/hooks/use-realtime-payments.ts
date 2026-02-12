"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface RealtimePayment {
  id: string;
  payer_address: string;
  amount: number;
  asset: string;
  is_ai_agent: boolean;
  processed_at: string;
  content_id: string;
}

export function useRealtimePayments(creatorId: string | null) {
  const [payments, setPayments] = useState<RealtimePayment[]>([]);
  const [connected, setConnected] = useState(false);

  const handleInsert = useCallback((payload: { new: RealtimePayment }) => {
    setPayments((prev) => [payload.new, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    if (!creatorId) return;

    const channel = supabase
      .channel(`payments:${creatorId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "payments",
          filter: `creator_id=eq.${creatorId}`,
        },
        handleInsert
      )
      .subscribe((status: string) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [creatorId, handleInsert]);

  return { payments, connected };
}
