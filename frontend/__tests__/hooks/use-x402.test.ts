import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useX402 } from "@/hooks/use-x402";

describe("useX402", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useX402());
    expect(result.current.loading).toBe(false);
    expect(result.current.challenge).toBeNull();
    expect(result.current.hasAccess).toBe(false);
    expect(result.current.error).toBeNull();
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

  it("checkAccess parses 402 challenge", async () => {
    const mockHeaders = new Map([
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
  });

  it("submitReceipt returns success on valid receipt", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: () =>
        Promise.resolve({ success: true, paymentId: "pay-789" }),
    });

    const { result } = renderHook(() => useX402());

    await act(async () => {
      const res = await result.current.submitReceipt("tok-abc", "0xdeadbeef");
      expect(res.success).toBe(true);
      expect(res.paymentId).toBe("pay-789");
    });

    expect(result.current.hasAccess).toBe(true);
    expect(result.current.challenge).toBeNull();
  });

  it("submitReceipt sets error on failure", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 404,
      ok: false,
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
