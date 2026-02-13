import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useX402 } from "@/hooks/use-x402";

// Helper to base64-encode an object (mirrors the hook's toBase64)
function toBase64(obj: unknown): string {
  return btoa(JSON.stringify(obj));
}

describe("useX402", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default state including settlement", () => {
    const { result } = renderHook(() => useX402());
    expect(result.current.loading).toBe(false);
    expect(result.current.challenge).toBeNull();
    expect(result.current.hasAccess).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.settlement).toBeNull();
  });

  it("exposes checkAccess, submitReceipt, and reset functions", () => {
    const { result } = renderHook(() => useX402());
    expect(typeof result.current.checkAccess).toBe("function");
    expect(typeof result.current.submitReceipt).toBe("function");
    expect(typeof result.current.reset).toBe("function");
  });

  it("reset clears state back to defaults", async () => {
    const { result } = renderHook(() => useX402());

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.challenge).toBeNull();
    expect(result.current.hasAccess).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.settlement).toBeNull();
  });

  it("checkAccess sets hasAccess true on 200 response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve({ access: true }),
    });

    const { result } = renderHook(() => useX402());

    await act(async () => {
      const res = await result.current.checkAccess("content-123", "SP1ABC");
      expect(res.hasAccess).toBe(true);
    });

    expect(result.current.hasAccess).toBe(true);
    expect(result.current.challenge).toBeNull();
  });

  it("checkAccess parses x402 v2 PAYMENT-REQUIRED header", async () => {
    const paymentRequirements = {
      x402Version: 2,
      scheme: "exact",
      network: "stacks:2147483648",
      resource: { url: "/x402-gateway?contentId=content-456", description: "Test Article" },
      accepts: [
        {
          scheme: "exact",
          network: "stacks:2147483648",
          amount: "1000",
          asset: "STX",
          payTo: "SP1CREATOR",
          extra: { contractAddress: "SP1.revenue-split" },
        },
      ],
      extra: { challengeToken: "tok-abc-123", expires: "2026-02-12T00:00:00Z" },
    };

    const paymentRequiredB64 = toBase64(paymentRequirements);

    const mockHeaders = new Map([
      ["Payment-Required", paymentRequiredB64],
      ["X-Payment-Address", "SP1CREATOR"],
      ["X-Payment-Amount", "1000"],
      ["X-Payment-Asset", "STX"],
      ["X-Payment-Contract", "SP1.revenue-split"],
      ["X-Payment-Token", "tok-abc-123"],
      ["X-Payment-Expires", "2026-02-12T00:00:00Z"],
    ]);

    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 402,
      ok: false,
      headers: { get: (k: string) => mockHeaders.get(k) ?? null },
      json: () =>
        Promise.resolve({
          ...paymentRequirements,
          payment: {
            address: "SP1CREATOR",
            amount: 1000,
            asset: "STX",
            contract: "SP1.revenue-split",
            token: "tok-abc-123",
            expires: "2026-02-12T00:00:00Z",
          },
        }),
    });

    const { result } = renderHook(() => useX402());

    await act(async () => {
      const res = await result.current.checkAccess("content-456");
      expect(res.hasAccess).toBe(false);
      expect(res.challenge?.token).toBe("tok-abc-123");
    });

    expect(result.current.hasAccess).toBe(false);
    expect(result.current.challenge?.amount).toBe(1000);
    expect(result.current.challenge?.asset).toBe("STX");
    expect(result.current.challenge?.x402Version).toBe(2);
    expect(result.current.challenge?.scheme).toBe("exact");
    expect(result.current.challenge?.network).toBe("stacks:2147483648");
    expect(result.current.challenge?.accepts).toHaveLength(1);
    expect(result.current.challenge?.accepts?.[0].payTo).toBe("SP1CREATOR");
  });

  it("checkAccess falls back to legacy headers when PAYMENT-REQUIRED is absent", async () => {
    const mockHeaders = new Map([
      ["X-Payment-Address", "SP1CREATOR"],
      ["X-Payment-Amount", "500"],
      ["X-Payment-Asset", "sBTC"],
      ["X-Payment-Contract", ""],
      ["X-Payment-Token", "tok-legacy"],
      ["X-Payment-Expires", "2026-03-01T00:00:00Z"],
    ]);

    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 402,
      ok: false,
      headers: { get: (k: string) => mockHeaders.get(k) ?? null },
      json: () =>
        Promise.resolve({
          payment: {
            address: "SP1CREATOR",
            amount: 500,
            asset: "sBTC",
            contract: null,
            token: "tok-legacy",
            expires: "2026-03-01T00:00:00Z",
          },
        }),
    });

    const { result } = renderHook(() => useX402());

    await act(async () => {
      const res = await result.current.checkAccess("content-789");
      expect(res.challenge?.token).toBe("tok-legacy");
    });

    expect(result.current.challenge?.amount).toBe(500);
    expect(result.current.challenge?.asset).toBe("sBTC");
    expect(result.current.challenge?.x402Version).toBeUndefined();
  });

  it("submitReceipt sends PAYMENT-SIGNATURE header and reads PAYMENT-RESPONSE", async () => {
    const settlementResponse = {
      x402Version: 2,
      scheme: "exact",
      network: "stacks:2147483648",
      settlement: {
        txId: "0xdeadbeef",
        status: "confirmed",
        amount: "1000",
        asset: "STX",
        payTo: "SP1CREATOR",
        settledAt: "2026-02-12T12:00:00Z",
      },
    };

    const paymentResponseB64 = toBase64(settlementResponse);

    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: { get: (k: string) => k === "Payment-Response" ? paymentResponseB64 : null },
      json: () =>
        Promise.resolve({
          success: true,
          paymentId: "pay-789",
          settlement: settlementResponse.settlement,
        }),
    });

    const { result } = renderHook(() => useX402());

    await act(async () => {
      const res = await result.current.submitReceipt("tok-abc", "0xdeadbeef");
      expect(res.success).toBe(true);
      expect(res.paymentId).toBe("pay-789");
      expect(res.settlement?.txId).toBe("0xdeadbeef");
      expect(res.settlement?.status).toBe("confirmed");
    });

    expect(result.current.hasAccess).toBe(true);
    expect(result.current.settlement?.txId).toBe("0xdeadbeef");

    // Verify PAYMENT-SIGNATURE header was sent
    const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = fetchCall[1].headers;
    expect(headers["Payment-Signature"]).toBeDefined();
    const payload = JSON.parse(atob(headers["Payment-Signature"]));
    expect(payload.scheme).toBe("exact");
    expect(payload.payload.txId).toBe("0xdeadbeef");
    expect(payload.payload.token).toBe("tok-abc");
  });

  it("submitReceipt sets error on failure", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 404,
      ok: false,
      headers: { get: () => null },
      json: () =>
        Promise.resolve({ error: "Invalid or expired challenge token" }),
    });

    const { result } = renderHook(() => useX402());

    await act(async () => {
      const res = await result.current.submitReceipt("bad-tok", "0x123");
      expect(res.success).toBe(false);
    });

    expect(result.current.hasAccess).toBe(false);
    expect(result.current.error).toBe("Invalid or expired challenge token");
  });
});
