import "@testing-library/jest-dom/vitest";
import "whatwg-fetch";

// Polyfill IntersectionObserver for jsdom
globalThis.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(private cb: IntersectionObserverCallback, private opts?: IntersectionObserverInit) {}
  observe(target: Element) {
    // Immediately trigger with isIntersecting: true
    this.cb(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
} as unknown as typeof IntersectionObserver;

// Polyfill ResizeObserver for jsdom (required by recharts)
globalThis.ResizeObserver = class ResizeObserver {
  constructor(private cb: ResizeObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => {
    const React = require("react");
    return React.createElement("a", { href, ...props }, children);
  },
}));

// Mock Supabase client
vi.mock("@/lib/supabase", () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn(),
  };
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  };
  return {
    supabase: mockSupabase,
    createClient: vi.fn(() => mockSupabase),
  };
});

// Mock wallet context
vi.mock("@/contexts/wallet-context", () => ({
  useWallet: vi.fn(() => ({
    address: null,
    connected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  WalletProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock auth context
vi.mock("@/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
