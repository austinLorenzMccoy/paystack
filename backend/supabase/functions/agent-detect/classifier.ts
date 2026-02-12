/**
 * Groq-powered AI agent classifier.
 * Sends request signals to Groq's fast LLM and gets a structured
 * is-agent / confidence / reasoning response.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export interface ClassifyInput {
  userAgent: string;
  agentId: string | null;
  bodyKeys: string[];
  hasSignature: boolean;
}

export interface ClassifyResult {
  isAgent: boolean;
  confidence: number;
  reasoning: string;
}

export async function classifyAgent(
  apiKey: string,
  input: ClassifyInput
): Promise<ClassifyResult> {
  const systemPrompt = `You are a request classifier for a Bitcoin payment API.
Given HTTP request metadata, determine whether the caller is an AI agent or a human browser.
Respond ONLY with valid JSON: { "isAgent": boolean, "confidence": number (0-1), "reasoning": "short explanation" }
Do NOT include any text outside the JSON object.`;

  const userPrompt = `Classify this HTTP request:
- User-Agent: "${input.userAgent}"
- X-Agent-Id header present: ${input.agentId ? `yes ("${input.agentId}")` : "no"}
- X-Agent-Signature header present: ${input.hasSignature ? "yes" : "no"}
- Request body keys: [${input.bodyKeys.join(", ")}]

Is this an AI agent or a human browser?`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", response.status, errText);
      return fallback("Groq API returned " + response.status);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    const parsed = JSON.parse(content);

    return {
      isAgent: Boolean(parsed.isAgent),
      confidence: clamp(Number(parsed.confidence) || 0.5, 0, 1),
      reasoning: String(parsed.reasoning || "No reasoning provided"),
    };
  } catch (error) {
    console.error("Groq classification failed:", error);
    return fallback("Groq classification threw: " + String(error));
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function fallback(reason: string): ClassifyResult {
  return {
    isAgent: false,
    confidence: 0.5,
    reasoning: `Fallback — ${reason}`,
  };
}
