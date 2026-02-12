import { classifyAgent } from "./classifier.ts";

// ── Unit tests for Groq classifier ──────────────────────────────────

Deno.test("classifyAgent returns fallback when API key is invalid", async () => {
  const result = await classifyAgent("invalid-key", {
    userAgent: "Mozilla/5.0",
    agentId: null,
    bodyKeys: [],
    hasSignature: false,
  });

  // Should gracefully fallback, not throw
  if (typeof result.isAgent !== "boolean") throw new Error("isAgent must be boolean");
  if (typeof result.confidence !== "number") throw new Error("confidence must be number");
  if (typeof result.reasoning !== "string") throw new Error("reasoning must be string");
  if (result.confidence < 0 || result.confidence > 1) throw new Error("confidence out of range");
});

Deno.test("classifyAgent returns structured result shape", async () => {
  // With no real API key, we test the fallback path
  const result = await classifyAgent("", {
    userAgent: "python-requests/2.31.0",
    agentId: "gpt-4o-agent",
    bodyKeys: ["model", "prompt"],
    hasSignature: true,
  });

  const keys = Object.keys(result);
  if (!keys.includes("isAgent")) throw new Error("missing isAgent");
  if (!keys.includes("confidence")) throw new Error("missing confidence");
  if (!keys.includes("reasoning")) throw new Error("missing reasoning");
});
