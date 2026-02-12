import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRealtimeAnalytics } from "@/hooks/use-realtime-analytics";
import { supabase } from "@/lib/supabase";

describe("useRealtimeAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty events and disconnected when no creatorId", () => {
    const { result } = renderHook(() => useRealtimeAnalytics(null));
    expect(result.current.events).toEqual([]);
    expect(result.current.connected).toBe(false);
  });

  it("subscribes to analytics channel when creatorId is provided", () => {
    renderHook(() => useRealtimeAnalytics("creator-456"));
    expect(supabase.channel).toHaveBeenCalledWith("analytics:creator-456");
  });

  it("cleans up channel on unmount", () => {
    const { unmount } = renderHook(() => useRealtimeAnalytics("creator-456"));
    unmount();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });

  it("does not subscribe when creatorId is null", () => {
    renderHook(() => useRealtimeAnalytics(null));
    expect(supabase.channel).not.toHaveBeenCalled();
  });
});
