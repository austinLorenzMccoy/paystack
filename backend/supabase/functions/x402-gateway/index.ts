import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { detectAgent } from "./agent-bridge.ts";

/**
 * x402 Payment Gateway — Coinbase x402 Protocol Compatible
 *
 * Implements the HTTP 402 Payment Required protocol (x402 v2):
 *
 * 1. GET  /x402-gateway?contentId=X  → checks access, returns 402 if unpaid
 * 2. POST /x402-gateway              → submits payment receipt, verifies, grants access
 *
 * Standard x402 Headers (v2):
 *   PAYMENT-REQUIRED  — base64-encoded PaymentRequirements (402 response)
 *   PAYMENT-SIGNATURE — base64-encoded PaymentPayload (client request)
 *   PAYMENT-RESPONSE  — base64-encoded SettlementResponse (200 response)
 *
 * Legacy Headers (backward-compatible):
 *   X-Payment-Address, X-Payment-Amount, X-Payment-Asset,
 *   X-Payment-Contract, X-Payment-Token, X-Payment-Expires
 *
 * CAIP-2 Network IDs:
 *   stacks:1          — Stacks mainnet
 *   stacks:2147483648  — Stacks testnet
 */

// CAIP-2 network identifiers for Stacks
const STACKS_MAINNET = "stacks:1";
const STACKS_TESTNET = "stacks:2147483648";

function getNetworkId(): string {
  const network = Deno.env.get("STACKS_NETWORK") ?? "testnet";
  return network === "mainnet" ? STACKS_MAINNET : STACKS_TESTNET;
}

function toBase64(obj: unknown): string {
  return btoa(JSON.stringify(obj));
}

function fromBase64(str: string): unknown {
  return JSON.parse(atob(str));
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agent-id, x-agent-signature, x-payment-receipt, payment-signature",
  "Access-Control-Expose-Headers":
    "Payment-Required, Payment-Response, X-Payment-Address, X-Payment-Amount, X-Payment-Asset, X-Payment-Contract, X-Payment-Token, X-Payment-Expires",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    if (req.method === "GET") {
      return await handleAccessCheck(req, supabase);
    }
    if (req.method === "POST") {
      return await handlePaymentReceipt(req, supabase);
    }
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  } catch (error) {
    console.error("x402 gateway error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});

// ── GET: Check access or return 402 ─────────────────────────────────

async function handleAccessCheck(req: Request, supabase: any) {
  const url = new URL(req.url);
  const contentId = url.searchParams.get("contentId");
  const requester = url.searchParams.get("address") ?? req.headers.get("x-agent-id") ?? "anonymous";

  if (!contentId) {
    return jsonResponse({ error: "contentId query parameter required" }, 400);
  }

  // Check if requester already has access
  const { data: grant } = await supabase
    .from("access_grants")
    .select("id")
    .eq("content_id", contentId)
    .eq("user_address", requester)
    .maybeSingle();

  if (grant) {
    return jsonResponse({ access: true, contentId });
  }

  // Look up content pricing
  const { data: content } = await supabase
    .from("content")
    .select("id, title, price, asset, creator_id, contract_address")
    .eq("id", contentId)
    .single();

  if (!content) {
    return jsonResponse({ error: "Content not found" }, 404);
  }

  // Get creator wallet
  const { data: creator } = await supabase
    .from("users")
    .select("wallet_address")
    .eq("id", content.creator_id)
    .single();

  const creatorAddress = creator?.wallet_address ?? content.creator_id;

  // Detect if requester is an agent
  const isAgent = await detectAgent(req);

  // Create challenge token
  const challengeToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

  await supabase.from("x402_challenges").insert({
    content_id: contentId,
    requester,
    is_agent: isAgent,
    amount: content.price,
    asset: content.asset ?? "STX",
    recipient: creatorAddress,
    contract_addr: content.contract_address ?? null,
    challenge_token: challengeToken,
    status: "pending",
    expires_at: expiresAt,
  });

  // Build x402 v2 standard PaymentRequirements
  const asset = content.asset ?? "STX";
  const paymentRequirements = {
    x402Version: 2,
    scheme: "exact",
    network: getNetworkId(),
    resource: {
      url: `/x402-gateway?contentId=${contentId}`,
      description: content.title,
    },
    accepts: [
      {
        scheme: "exact",
        network: getNetworkId(),
        amount: String(content.price),
        asset,
        payTo: creatorAddress,
        ...(content.contract_address
          ? { extra: { contractAddress: content.contract_address } }
          : {}),
      },
    ],
    extra: {
      challengeToken,
      expires: expiresAt,
    },
  };

  const paymentRequiredB64 = toBase64(paymentRequirements);

  // Return 402 Payment Required with both standard and legacy headers
  return new Response(
    JSON.stringify({
      ...paymentRequirements,
      // Legacy fields for backward compatibility
      contentId,
      title: content.title,
      payment: {
        address: creatorAddress,
        amount: content.price,
        asset,
        contract: content.contract_address ?? null,
        token: challengeToken,
        expires: expiresAt,
      },
      instructions: {
        human: "Sign a pay-for-content transaction using your Stacks wallet and POST the txId back.",
        agent: "Submit PAYMENT-SIGNATURE header with base64-encoded { scheme, network, payload: { txId, token } }.",
      },
    }),
    {
      status: 402,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        // x402 v2 standard header
        "Payment-Required": paymentRequiredB64,
        // Legacy headers (backward-compatible)
        "X-Payment-Address": creatorAddress,
        "X-Payment-Amount": String(content.price),
        "X-Payment-Asset": asset,
        "X-Payment-Contract": content.contract_address ?? "",
        "X-Payment-Token": challengeToken,
        "X-Payment-Expires": expiresAt,
      },
    }
  );
}

// ── POST: Submit payment receipt ────────────────────────────────────

async function handlePaymentReceipt(req: Request, supabase: any) {
  let token: string | undefined;
  let txId: string | undefined;

  // x402 v2: Accept PAYMENT-SIGNATURE header (base64-encoded PaymentPayload)
  const paymentSigHeader = req.headers.get("payment-signature");
  if (paymentSigHeader) {
    try {
      const payload = fromBase64(paymentSigHeader) as {
        scheme?: string;
        network?: string;
        payload?: { txId?: string; token?: string };
      };
      token = payload.payload?.token;
      txId = payload.payload?.txId;
    } catch {
      return jsonResponse({ error: "Invalid PAYMENT-SIGNATURE header" }, 400);
    }
  }

  // Legacy: Accept JSON body { token, txId }
  if (!token || !txId) {
    try {
      const body = await req.json();
      token = token ?? body.token;
      txId = txId ?? body.txId;
    } catch {
      // body may already be consumed or empty
    }
  }

  if (!token || !txId) {
    return jsonResponse({ error: "token and txId are required. Use PAYMENT-SIGNATURE header or JSON body." }, 400);
  }

  // Look up challenge
  const { data: challenge } = await supabase
    .from("x402_challenges")
    .select("*")
    .eq("challenge_token", token)
    .eq("status", "pending")
    .single();

  if (!challenge) {
    return jsonResponse({ error: "Invalid or expired challenge token" }, 404);
  }

  // Check expiry
  if (new Date(challenge.expires_at) < new Date()) {
    await supabase
      .from("x402_challenges")
      .update({ status: "expired" })
      .eq("id", challenge.id);
    return jsonResponse({ error: "Challenge expired" }, 410);
  }

  // Verify the transaction on Stacks
  const stacksApiUrl = Deno.env.get("STACKS_API_URL") ?? "https://api.hiro.so";
  const txResponse = await fetch(`${stacksApiUrl}/extended/v1/tx/${txId}`);

  if (!txResponse.ok) {
    return jsonResponse({ error: "Transaction not found on Stacks" }, 404);
  }

  const txDetails = await txResponse.json();

  // Validate transaction
  if (txDetails.tx_status !== "success") {
    return jsonResponse({ error: "Transaction not successful", tx_status: txDetails.tx_status }, 400);
  }

  if (txDetails.tx_type === "contract_call") {
    if (txDetails.contract_call.function_name !== "pay-for-content") {
      return jsonResponse({ error: "Wrong contract function called" }, 400);
    }
  }

  // Mark challenge as paid
  await supabase
    .from("x402_challenges")
    .update({
      status: "paid",
      paid_tx_id: txId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", challenge.id);

  // Record payment
  const { data: payment } = await supabase
    .from("payments")
    .insert({
      transaction_hash: txId,
      content_id: challenge.content_id,
      payer_address: challenge.requester,
      creator_id: challenge.recipient,
      amount: challenge.amount,
      asset: challenge.asset,
      is_ai_agent: challenge.is_agent,
      status: "confirmed",
      processed_at: new Date().toISOString(),
    })
    .select()
    .single();

  // Grant access
  await supabase.from("access_grants").insert({
    content_id: challenge.content_id,
    user_address: challenge.requester,
    payment_id: payment?.id,
    granted_at: new Date().toISOString(),
    expires_at: null,
  });

  // Record analytics if agent
  if (challenge.is_agent) {
    await supabase.from("analytics_events").insert({
      payment_id: payment?.id,
      creator_id: challenge.recipient,
      content_id: challenge.content_id,
      payer_address: challenge.requester,
      amount: challenge.amount,
      asset: challenge.asset,
      is_ai_agent: true,
      metadata: { source: "x402", challenge_token: token },
      recorded_at: new Date().toISOString(),
    });
  }

  // Build x402 v2 SettlementResponse
  const settlementResponse = {
    x402Version: 2,
    scheme: "exact",
    network: getNetworkId(),
    settlement: {
      txId,
      status: "confirmed",
      amount: String(challenge.amount),
      asset: challenge.asset,
      payTo: challenge.recipient,
      settledAt: new Date().toISOString(),
    },
  };

  const paymentResponseB64 = toBase64(settlementResponse);

  const responseBody = {
    success: true,
    access: true,
    contentId: challenge.content_id,
    paymentId: payment?.id,
    txId,
    // x402 v2 settlement info
    settlement: settlementResponse.settlement,
  };

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      // x402 v2 standard header
      "Payment-Response": paymentResponseB64,
    },
  });
}

// ── Helpers ──────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
