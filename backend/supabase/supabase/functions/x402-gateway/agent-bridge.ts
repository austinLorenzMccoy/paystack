/**
 * Lightweight agent detection bridge for the x402 gateway.
 * Uses the same heuristic logic as agent-detect but inline,
 * so the gateway doesn't need to call another Edge Function.
 */

const AGENT_UA_PATTERNS = [
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

export function detectAgent(req: Request): boolean {
  const agentId = req.headers.get("x-agent-id");
  if (agentId) return true;

  const ua = req.headers.get("user-agent") ?? "";
  for (const pattern of AGENT_UA_PATTERNS) {
    if (pattern.test(ua)) return true;
  }

  if (!ua || ua.length < 5) return true;

  return false;
}
