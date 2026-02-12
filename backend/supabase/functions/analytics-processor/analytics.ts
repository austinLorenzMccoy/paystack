import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AnalyticsPayload {
  paymentId: string;
  creatorId: string;
  contentId: string;
  payerAddress: string;
  amount: number;
  asset: string;
  isAIAgent: boolean;
  metadata?: Record<string, unknown> | null;
  recordedAt: string;
}

export interface SupabaseLike {
  from(table: string): any;
  rpc(functionName: string, args: Record<string, unknown>): Promise<{ data: unknown; error: Error | null }>;
}

export function parseAnalyticsPayload(body: Record<string, unknown> | null): AnalyticsPayload {
  if (!body) {
    throw new Error("Payload required");
  }

  const requiredFields: Array<keyof AnalyticsPayload> = [
    "paymentId",
    "creatorId",
    "contentId",
    "payerAddress",
    "amount",
    "asset",
  ];

  for (const field of requiredFields) {
    if (body[field as string] === undefined || body[field as string] === null) {
      throw new Error(`Missing field: ${field}`);
    }
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid amount value");
  }

  const asset = String(body.asset).trim().toUpperCase();
  if (!asset) {
    throw new Error("Invalid asset value");
  }

  const recordedAt = body.recordedAt
    ? new Date(String(body.recordedAt)).toISOString()
    : new Date().toISOString();

  return {
    paymentId: String(body.paymentId),
    creatorId: String(body.creatorId),
    contentId: String(body.contentId),
    payerAddress: String(body.payerAddress),
    amount,
    asset,
    isAIAgent: Boolean(body.isAIAgent),
    metadata: (body.metadata as Record<string, unknown>) ?? null,
    recordedAt,
  };
}

export function getDayKey(recordedAt: string | Date): string {
  const date = recordedAt instanceof Date ? recordedAt : new Date(recordedAt);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid recordedAt date");
  }
  return date.toISOString().slice(0, 10);
}

export async function recordAnalyticsEvent(client: SupabaseLike, payload: AnalyticsPayload) {
  const recordedAt = payload.recordedAt ?? new Date().toISOString();

  const { error: insertError } = await client
    .from("analytics_events")
    .insert({
      payment_id: payload.paymentId,
      creator_id: payload.creatorId,
      content_id: payload.contentId,
      payer_address: payload.payerAddress,
      amount: payload.amount,
      asset: payload.asset,
      is_ai_agent: payload.isAIAgent,
      metadata: payload.metadata,
      recorded_at: recordedAt,
    });

  if (insertError) {
    throw insertError;
  }

  const dayKey = getDayKey(recordedAt);
  const { error: rpcError } = await client.rpc("increment_creator_daily_metrics", {
    p_creator_id: payload.creatorId,
    p_day: dayKey,
    p_amount: payload.amount,
    p_is_ai_agent: payload.isAIAgent,
  });

  if (rpcError) {
    throw rpcError;
  }
}

export async function fetchCreatorMetrics(
  client: SupabaseClient,
  creatorId: string,
  days = 30
) {
  const dayCount = Number.isFinite(days) && days > 0 ? Math.min(days, 90) : 30;
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (dayCount - 1));
  const sinceKey = getDayKey(since);

  const { data, error } = await client
    .from("creator_daily_metrics")
    .select("day,total_revenue,payment_count,ai_payment_count")
    .eq("creator_id", creatorId)
    .gte("day", sinceKey)
    .order("day", { ascending: true });

  if (error) {
    throw error;
  }

  const summary = (data ?? []).reduce(
    (acc, row) => {
      acc.totalRevenue += Number(row.total_revenue ?? 0);
      acc.paymentCount += Number(row.payment_count ?? 0);
      acc.aiPaymentCount += Number(row.ai_payment_count ?? 0);
      return acc;
    },
    { totalRevenue: 0, paymentCount: 0, aiPaymentCount: 0 }
  );

  return {
    summary,
    daily: data ?? [],
  };
}
