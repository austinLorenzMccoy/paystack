import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method === "GET") {
      return await handleGetSubscription(supabaseClient, user);
    }

    if (req.method === "POST") {
      const body = await req.json();

      switch (action) {
        case "create":
          return await handleCreateSubscription(supabaseClient, user, body);
        case "topup":
          return await handleTopUp(supabaseClient, user, body);
        case "cancel":
          return await handleCancel(supabaseClient, user, body);
        case "toggle-autostack":
          return await handleToggleAutoStack(supabaseClient, user, body);
        default:
          return jsonResponse({ error: "Invalid action" }, 400);
      }
    }

    return jsonResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("Subscription management error:", error);
    return jsonResponse(
      { error: "Internal server error", details: String(error) },
      500
    );
  }
});

// GET: Fetch user's subscription
async function handleGetSubscription(supabase: any, user: any) {
  // Get user's wallet address from metadata or user table
  const walletAddress =
    user.user_metadata?.wallet_address ?? user.email?.split("@")[0];

  if (!walletAddress) {
    return jsonResponse({ error: "No wallet address found" }, 400);
  }

  const { data: subscription, error } = await supabase
    .from("autopay_subscriptions")
    .select("*")
    .eq("subscriber_principal", walletAddress)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch subscription:", error);
    return jsonResponse({ error: "Failed to fetch subscription" }, 500);
  }

  if (!subscription) {
    return jsonResponse({
      subscription: {
        status: "inactive",
        escrowBalance: 0,
        intervalBlocks: 4320,
        strikes: 0,
        autoStack: true,
        nextChargeBlock: null,
        lastChargeBlock: null,
      },
    });
  }

  return jsonResponse({
    subscription: {
      id: subscription.id,
      status: subscription.status,
      escrowBalance: subscription.balance_cached ?? 0,
      intervalBlocks: subscription.interval_blocks,
      strikes: subscription.strikes,
      autoStack: subscription.auto_stack,
      nextChargeBlock: subscription.next_charge_block,
      lastChargeBlock: subscription.last_charge_block,
      planId: subscription.plan_id,
      createdAt: subscription.created_at,
      updatedAt: subscription.updated_at,
    },
  });
}

// POST: Create new subscription
async function handleCreateSubscription(
  supabase: any,
  user: any,
  body: any
) {
  const {
    subscriberPrincipal,
    merchantPrincipal,
    planId,
    depositAmount,
    intervalBlocks,
    autoStack,
    txId,
  } = body;

  if (!subscriberPrincipal || !depositAmount || !intervalBlocks || !txId) {
    return jsonResponse(
      {
        error:
          "Missing required fields: subscriberPrincipal, depositAmount, intervalBlocks, txId",
      },
      400
    );
  }

  // Verify the transaction on Stacks
  const txVerified = await verifyStacksTransaction(txId, {
    expectedSender: subscriberPrincipal,
    expectedAmount: depositAmount,
  });

  if (!txVerified.success) {
    return jsonResponse(
      { error: "Transaction verification failed", details: txVerified.error },
      400
    );
  }

  // Check if subscription already exists
  const { data: existing } = await supabase
    .from("autopay_subscriptions")
    .select("id")
    .eq("subscriber_principal", subscriberPrincipal)
    .eq("status", "active")
    .maybeSingle();

  if (existing) {
    return jsonResponse(
      { error: "Active subscription already exists" },
      409
    );
  }

  // Create subscription record
  const { data: subscription, error: insertError } = await supabase
    .from("autopay_subscriptions")
    .insert({
      subscriber_principal: subscriberPrincipal,
      merchant_principal:
        merchantPrincipal ??
        Deno.env.get("DEFAULT_MERCHANT_PRINCIPAL") ??
        "SP000000000000000000002Q6VF78",
      plan_id: planId ?? "monthly",
      contract_address:
        Deno.env.get("SUBSCRIPTION_CONTRACT_ADDRESS") ??
        "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.subscription-autopay",
      amount_per_interval: 1000000, // 1 STX in micro-STX
      interval_blocks: intervalBlocks,
      auto_stack: autoStack ?? true,
      deposit_amount: depositAmount,
      balance_cached: depositAmount,
      status: "active",
      last_tx_id: txId,
      metadata: {
        created_by: user.id,
        initial_tx: txId,
      },
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to create subscription:", insertError);
    return jsonResponse(
      { error: "Failed to create subscription", details: insertError.message },
      500
    );
  }

  // Create initial relayer job for first charge
  const firstChargeBlock =
    (await getCurrentStacksBlock()) + intervalBlocks;

  await supabase.from("relayer_jobs").insert({
    subscription_id: subscription.id,
    job_type: "charge",
    run_at: new Date(Date.now() + intervalBlocks * 10 * 60 * 1000).toISOString(), // ~10 min per block
    status: "pending",
    payload: {
      subscriber_principal: subscriberPrincipal,
      expected_block: firstChargeBlock,
    },
  });

  // Update subscription with next charge block
  await supabase
    .from("autopay_subscriptions")
    .update({ next_charge_block: firstChargeBlock })
    .eq("id", subscription.id);

  // Create subscriber contact if email provided
  if (user.email) {
    await supabase
      .from("subscriber_contacts")
      .upsert({
        subscriber_principal: subscriberPrincipal,
        email: user.email,
        verified: true,
      })
      .onConflict("subscriber_principal");
  }

  return jsonResponse({
    success: true,
    subscription: {
      id: subscription.id,
      status: subscription.status,
      escrowBalance: subscription.balance_cached,
      intervalBlocks: subscription.interval_blocks,
      strikes: subscription.strikes,
      autoStack: subscription.auto_stack,
      nextChargeBlock: firstChargeBlock,
      lastChargeBlock: null,
    },
  });
}

// POST: Top up subscription balance
async function handleTopUp(supabase: any, user: any, body: any) {
  const { subscriptionId, amount, txId } = body;

  if (!subscriptionId || !amount || !txId) {
    return jsonResponse(
      { error: "Missing required fields: subscriptionId, amount, txId" },
      400
    );
  }

  const { data: subscription } = await supabase
    .from("autopay_subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .single();

  if (!subscription) {
    return jsonResponse({ error: "Subscription not found" }, 404);
  }

  // Verify transaction
  const txVerified = await verifyStacksTransaction(txId, {
    expectedSender: subscription.subscriber_principal,
    expectedAmount: amount,
  });

  if (!txVerified.success) {
    return jsonResponse(
      { error: "Transaction verification failed" },
      400
    );
  }

  // Update balance
  const newBalance = (subscription.balance_cached ?? 0) + amount;

  const { error: updateError } = await supabase
    .from("autopay_subscriptions")
    .update({
      balance_cached: newBalance,
      deposit_amount: (subscription.deposit_amount ?? 0) + amount,
      last_tx_id: txId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);

  if (updateError) {
    return jsonResponse({ error: "Failed to update balance" }, 500);
  }

  return jsonResponse({
    success: true,
    newBalance,
  });
}

// POST: Cancel subscription
async function handleCancel(supabase: any, user: any, body: any) {
  const { subscriptionId, txId } = body;

  if (!subscriptionId || !txId) {
    return jsonResponse(
      { error: "Missing required fields: subscriptionId, txId" },
      400
    );
  }

  const { data: subscription } = await supabase
    .from("autopay_subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .single();

  if (!subscription) {
    return jsonResponse({ error: "Subscription not found" }, 404);
  }

  // Verify cancellation transaction
  const txVerified = await verifyStacksTransaction(txId, {
    expectedSender: subscription.subscriber_principal,
  });

  if (!txVerified.success) {
    return jsonResponse(
      { error: "Transaction verification failed" },
      400
    );
  }

  // Update subscription status
  const { error: updateError } = await supabase
    .from("autopay_subscriptions")
    .update({
      status: "cancelled",
      last_status_change: new Date().toISOString(),
      last_tx_id: txId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);

  if (updateError) {
    return jsonResponse({ error: "Failed to cancel subscription" }, 500);
  }

  // Cancel pending relayer jobs
  await supabase
    .from("relayer_jobs")
    .update({ status: "cancelled" })
    .eq("subscription_id", subscriptionId)
    .eq("status", "pending");

  return jsonResponse({
    success: true,
    message: "Subscription cancelled",
  });
}

// POST: Toggle auto-stack
async function handleToggleAutoStack(supabase: any, user: any, body: any) {
  const { subscriptionId, autoStack, txId } = body;

  if (!subscriptionId || autoStack === undefined || !txId) {
    return jsonResponse(
      { error: "Missing required fields: subscriptionId, autoStack, txId" },
      400
    );
  }

  const { data: subscription } = await supabase
    .from("autopay_subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .single();

  if (!subscription) {
    return jsonResponse({ error: "Subscription not found" }, 404);
  }

  // Verify transaction
  const txVerified = await verifyStacksTransaction(txId, {
    expectedSender: subscription.subscriber_principal,
  });

  if (!txVerified.success) {
    return jsonResponse(
      { error: "Transaction verification failed" },
      400
    );
  }

  // Update auto-stack setting
  const { error: updateError } = await supabase
    .from("autopay_subscriptions")
    .update({
      auto_stack: autoStack,
      last_tx_id: txId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);

  if (updateError) {
    return jsonResponse({ error: "Failed to update auto-stack" }, 500);
  }

  return jsonResponse({
    success: true,
    autoStack,
  });
}

// Helper: Verify Stacks transaction
async function verifyStacksTransaction(
  txId: string,
  options: { expectedSender?: string; expectedAmount?: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const stacksApiUrl =
      Deno.env.get("STACKS_API_URL") ?? "https://api.hiro.so";
    const response = await fetch(`${stacksApiUrl}/extended/v1/tx/${txId}`);

    if (!response.ok) {
      return { success: false, error: "Transaction not found" };
    }

    const tx = await response.json();

    if (tx.tx_status !== "success") {
      return { success: false, error: "Transaction not successful" };
    }

    if (options.expectedSender && tx.sender_address !== options.expectedSender) {
      return { success: false, error: "Sender mismatch" };
    }

    // Additional validation can be added here

    return { success: true };
  } catch (error) {
    console.error("Transaction verification error:", error);
    return { success: false, error: String(error) };
  }
}

// Helper: Get current Stacks block height
async function getCurrentStacksBlock(): Promise<number> {
  try {
    const stacksApiUrl =
      Deno.env.get("STACKS_API_URL") ?? "https://api.hiro.so";
    const response = await fetch(`${stacksApiUrl}/extended/v1/block`);
    const data = await response.json();
    return data.results?.[0]?.height ?? 0;
  } catch (error) {
    console.error("Failed to get current block:", error);
    return 0;
  }
}

// Helper: JSON response
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
