import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { classifyAgent } from "./classifier.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agent-id, x-agent-signature, user-agent",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ── 1. Collect signals ──────────────────────────────────────────
    const userAgent = req.headers.get("user-agent") ?? "";
    const agentId = req.headers.get("x-agent-id") ?? null;
    const agentSig = req.headers.get("x-agent-signature") ?? null;
    const contentType = req.headers.get("content-type") ?? "";

    let body: Record<string, unknown> = {};
    if (contentType.includes("application/json")) {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    // ── 2. Heuristic pre-check (fast path) ──────────────────────────
    const heuristic = heuristicDetect(userAgent, agentId, body);

    // ── 3. Groq LLM classification (slow path, optional) ───────────
    let groqResult: { isAgent: boolean; confidence: number; reasoning: string } | null = null;
    const groqApiKey = Deno.env.get("GROQ_API_KEY");

    if (groqApiKey && !heuristic.definite) {
      groqResult = await classifyAgent(groqApiKey, {
        userAgent,
        agentId,
        bodyKeys: Object.keys(body),
        hasSignature: !!agentSig,
      });
    }

    // ── 4. Final verdict ────────────────────────────────────────────
    const isAgent =
      heuristic.definite
        ? heuristic.isAgent
        : groqResult
        ? groqResult.isAgent
        : heuristic.isAgent;

    const confidence = groqResult?.confidence ?? heuristic.confidence;

    // ── 5. Log to Supabase ──────────────────────────────────────────
    await supabaseClient.from("agent_detections").insert({
      user_agent: userAgent,
      agent_id: agentId,
      is_agent: isAgent,
      confidence,
      reasoning: groqResult?.reasoning ?? heuristic.reason,
      detected_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        isAgent,
        confidence,
        agentId,
        reasoning: groqResult?.reasoning ?? heuristic.reason,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Agent detection error:", error);
    return new Response(
      JSON.stringify({ error: "Agent detection failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ── Heuristic detection ───────────────────────────────────────────────
interface HeuristicResult {
  isAgent: boolean;
  confidence: number;
  reason: string;
  definite: boolean; // skip LLM if true
}

const KNOWN_AGENT_PATTERNS = [
  /^gpt/i,
  /^claude/i,
  /^anthropic/i,
  /openai/i,
  /langchain/i,
  /autogpt/i,
  /agent-protocol/i,
  /^axios/i,
  /^node-fetch/i,
  /^python-requests/i,
  /^httpx/i,
  /^curl/i,
  /^wget/i,
  /^go-http-client/i,
  /^rust-reqwest/i,
  /bot\b/i,
  /spider/i,
  /crawler/i,
  /^groq-sdk/i,
];

const KNOWN_BROWSER_PATTERNS = [
  /mozilla.*chrome.*safari/i,
  /mozilla.*firefox/i,
  /mozilla.*edg\//i,
  /^mozilla\/5\.0.*applewebkit/i,
];

function heuristicDetect(
  userAgent: string,
  agentId: string | null,
  body: Record<string, unknown>
): HeuristicResult {
  // Explicit agent header → definite
  if (agentId) {
    return {
      isAgent: true,
      confidence: 0.99,
      reason: `Explicit X-Agent-Id header: ${agentId}`,
      definite: true,
    };
  }

  // Known agent UA pattern
  for (const pattern of KNOWN_AGENT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return {
        isAgent: true,
        confidence: 0.95,
        reason: `User-Agent matches known agent pattern: ${pattern}`,
        definite: true,
      };
    }
  }

  // Known browser UA → definite human
  for (const pattern of KNOWN_BROWSER_PATTERNS) {
    if (pattern.test(userAgent)) {
      return {
        isAgent: false,
        confidence: 0.9,
        reason: "User-Agent matches known browser pattern",
        definite: false, // still allow LLM override
      };
    }
  }

  // Empty or missing UA → likely agent
  if (!userAgent || userAgent.length < 5) {
    return {
      isAgent: true,
      confidence: 0.8,
      reason: "Missing or very short User-Agent",
      definite: false,
    };
  }

  // Body contains agent-like keys
  const agentKeys = ["model", "prompt", "agent_id", "callback_url", "webhook"];
  const matchedKeys = agentKeys.filter((k) => k in body);
  if (matchedKeys.length >= 2) {
    return {
      isAgent: true,
      confidence: 0.85,
      reason: `Request body contains agent-like keys: ${matchedKeys.join(", ")}`,
      definite: false,
    };
  }

  // Ambiguous
  return {
    isAgent: false,
    confidence: 0.5,
    reason: "No strong signals detected, ambiguous",
    definite: false,
  };
}
