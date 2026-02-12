import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { detectAgent } from "./agent-bridge.ts";

/**
 * x402 Payment Gateway
 *
 * Implements the HTTP 402 Payment Required protocol:
 *
 * 1. GET  /x402-gateway?contentId=X  → checks access, returns 402 if unpaid
 * 2. POST /x402-gateway              → submits payment receipt, verifies, grants access
 *
 * 402 Response Headers:
 *   X-Payment-Address   — creator wallet to pay
 *   X-Payment-Amount    — price in smallest unit
 *   X-Payment-Asset     — STX | sBTC | USDCx
 *   X-Payment-Contract  — Clarity contract address
 *   X-Payment-Token     — challenge token to include in receipt
 *   X-Payment-Expires   — ISO timestamp when challenge expires
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agent-id, x-agent-signature, x-payment-receipt",
  "Access-Control-Expose-Headers":
    "X-Payment-Address, X-Payment-Amount, X-Payment-Asset, X-Payment-Contract, X-Payment-Token, X-Payment-Expires",
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

  // Return 402 Payment Required with payment instructions in headers
  return new Response(
    JSON.stringify({
      status: 402,
      message: "Payment required to access this content",
      contentId,
      title: content.title,
      payment: {
        address: creatorAddress,
        amount: content.price,
        asset: content.asset ?? "STX",
        contract: content.contract_address ?? null,
        token: challengeToken,
        expires: expiresAt,
      },
      instructions: {
        human: "Sign a pay-for-content transaction using your Stacks wallet and POST the txId back.",
        agent: "POST to this endpoint with { token, txId } to submit payment receipt.",
      },
    }),
    {
      status: 402,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Payment-Address": creatorAddress,
        "X-Payment-Amount": String(content.price),
        "X-Payment-Asset": content.asset ?? "STX",
        "X-Payment-Contract": content.contract_address ?? "",
        "X-Payment-Token": challengeToken,
        "X-Payment-Expires": expiresAt,
      },
    }
  );
}

// ── POST: Submit payment receipt ────────────────────────────────────

async function handlePaymentReceipt(req: Request, supabase: any) {
  const body = await req.json();
  const { token, txId } = body;

  if (!token || !txId) {
    return jsonResponse({ error: "token and txId are required" }, 400);
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

  return jsonResponse({
    success: true,
    access: true,
    contentId: challenge.content_id,
    paymentId: payment?.id,
    txId,
  });
}

// ── Helpers ──────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
