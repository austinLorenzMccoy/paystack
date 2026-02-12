import { detectAgent } from "./agent-bridge.ts";

// ── Agent bridge tests ──────────────────────────────────────────────

Deno.test("detectAgent returns true for X-Agent-Id header", () => {
  const req = new Request("https://example.com", {
    headers: { "x-agent-id": "gpt-4o-research" },
  });
  if (!detectAgent(req)) throw new Error("Expected agent");
});

Deno.test("detectAgent returns true for python-requests UA", () => {
  const req = new Request("https://example.com", {
    headers: { "user-agent": "python-requests/2.31.0" },
  });
  if (!detectAgent(req)) throw new Error("Expected agent");
});

Deno.test("detectAgent returns true for curl UA", () => {
  const req = new Request("https://example.com", {
    headers: { "user-agent": "curl/8.4.0" },
  });
  if (!detectAgent(req)) throw new Error("Expected agent");
});

Deno.test("detectAgent returns false for Chrome browser UA", () => {
  const req = new Request("https://example.com", {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (detectAgent(req)) throw new Error("Expected human");
});

Deno.test("detectAgent returns true for empty UA", () => {
  const req = new Request("https://example.com", {
    headers: { "user-agent": "" },
  });
  if (!detectAgent(req)) throw new Error("Expected agent for empty UA");
});

Deno.test("detectAgent returns true for openai SDK UA", () => {
  const req = new Request("https://example.com", {
    headers: { "user-agent": "openai-node/4.20.0" },
  });
  if (!detectAgent(req)) throw new Error("Expected agent");
});

Deno.test("detectAgent returns true for langchain UA", () => {
  const req = new Request("https://example.com", {
    headers: { "user-agent": "langchain-js/0.1.0" },
  });
  if (!detectAgent(req)) throw new Error("Expected agent");
});
