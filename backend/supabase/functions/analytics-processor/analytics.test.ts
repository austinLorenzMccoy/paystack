import {
  fetchCreatorMetrics,
  getDayKey,
  parseAnalyticsPayload,
  recordAnalyticsEvent,
} from "./analytics.ts";

Deno.test("parseAnalyticsPayload validates and normalizes fields", () => {
  const result = parseAnalyticsPayload({
    paymentId: "123",
    creatorId: "c1",
    contentId: "content",
    payerAddress: "ST1ABC",
    amount: 42,
    asset: "stx",
    isAIAgent: true,
  });

  if (result.asset !== "STX") throw new Error("asset not uppercased");
  if (!result.recordedAt) throw new Error("recordedAt missing");
});

Deno.test("parseAnalyticsPayload throws for missing fields", () => {
  let caught = false;
  try {
    parseAnalyticsPayload({ paymentId: "1" } as any);
  } catch (err) {
    caught = true;
    if (!String(err).includes("creatorId")) throw err;
  }
  if (!caught) throw new Error("expected error");
});

Deno.test("getDayKey normalizes to yyyy-mm-dd", () => {
  const key = getDayKey("2024-05-01T10:00:00Z");
  if (key !== "2024-05-01") throw new Error("invalid key");
});

class MockSupabaseClient {
  inserted: Record<string, unknown>[] = [];
  rpcArgs: Record<string, unknown>[] = [];
  from(table: string) {
    if (table !== "analytics_events") throw new Error("Unexpected table");
    return {
      insert: async (payload: Record<string, unknown>) => {
        this.inserted.push(payload);
        return { error: null };
      },
    };
  }
  rpc(_fn: string, args: Record<string, unknown>) {
    this.rpcArgs.push(args);
    return Promise.resolve({ data: null, error: null });
  }
}

Deno.test("recordAnalyticsEvent writes event and aggregates", async () => {
  const client = new MockSupabaseClient();
  const payload = {
    paymentId: "p",
    creatorId: "creator",
    contentId: "content",
    payerAddress: "ST1",
    amount: 10,
    asset: "STX",
    isAIAgent: false,
    metadata: null,
    recordedAt: new Date("2024-05-02T12:00:00Z").toISOString(),
  };

  await recordAnalyticsEvent(client as any, payload);

  if (client.inserted.length !== 1) throw new Error("insert not called");
  if (client.rpcArgs[0].p_day !== "2024-05-02") throw new Error("day key incorrect");
});

class MockMetricsClient {
  data: any[];
  constructor(data: any[]) {
    this.data = data;
  }
  from() {
    return {
      select: () => this,
      eq: () => this,
      gte: () => this,
      order: async () => ({ data: this.data, error: null }),
    };
  }
}

Deno.test("fetchCreatorMetrics aggregates data", async () => {
  const client = new MockMetricsClient([
    { day: "2024-05-01", total_revenue: 10, payment_count: 1, ai_payment_count: 0 },
    { day: "2024-05-02", total_revenue: 5, payment_count: 2, ai_payment_count: 1 },
  ]);

  const result = await fetchCreatorMetrics(client as any, "creator", 2);
  if (result.summary.totalRevenue !== 15) throw new Error("revenue mismatch");
  if (result.daily.length !== 2) throw new Error("daily length mismatch");
});
