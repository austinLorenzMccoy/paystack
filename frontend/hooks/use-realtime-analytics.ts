"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface AnalyticsEvent {
  id: string;
  payment_id: string;
  creator_id: string;
  content_id: string;
  payer_address: string;
  amount: number;
  asset: string;
  is_ai_agent: boolean;
  recorded_at: string;
}

export function useRealtimeAnalytics(creatorId: string | null) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [connected, setConnected] = useState(false);

  const handleInsert = useCallback((payload: { new: AnalyticsEvent }) => {
    setEvents((prev) => [payload.new, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    if (!creatorId || !supabase) return;

    const channel = supabase
      .channel(`analytics:${creatorId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "analytics_events",
          filter: `creator_id=eq.${creatorId}`,
        },
        handleInsert
      )
      .subscribe((status: string) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase?.removeChannel(channel);
      setConnected(false);
    };
  }, [creatorId, handleInsert]);

  return { events, connected };
}
