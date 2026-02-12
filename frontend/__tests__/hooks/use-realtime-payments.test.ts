import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRealtimePayments } from "@/hooks/use-realtime-payments";
import { supabase } from "@/lib/supabase";

describe("useRealtimePayments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty payments and disconnected when no creatorId", () => {
    const { result } = renderHook(() => useRealtimePayments(null));
    expect(result.current.payments).toEqual([]);
    expect(result.current.connected).toBe(false);
  });

  it("subscribes to channel when creatorId is provided", () => {
    renderHook(() => useRealtimePayments("creator-123"));
    expect(supabase.channel).toHaveBeenCalledWith("payments:creator-123");
  });

  it("cleans up channel on unmount", () => {
    const { unmount } = renderHook(() => useRealtimePayments("creator-123"));
    unmount();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });

  it("does not subscribe when creatorId is null", () => {
    renderHook(() => useRealtimePayments(null));
    expect(supabase.channel).not.toHaveBeenCalled();
  });
});
