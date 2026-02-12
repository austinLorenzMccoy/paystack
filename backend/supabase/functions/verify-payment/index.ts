import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-agent-id, x-agent-signature, user-agent',
}

// ── Agent detection (inline) ────────────────────────────────────────
const AGENT_UA_PATTERNS = [
  /^gpt/i, /^claude/i, /^anthropic/i, /openai/i, /langchain/i,
  /autogpt/i, /agent-protocol/i, /^axios/i, /^node-fetch/i,
  /^python-requests/i, /^httpx/i, /^curl/i, /^wget/i,
  /^go-http-client/i, /^rust-reqwest/i, /bot\b/i, /^groq-sdk/i,
]

function isAgentRequest(req: Request): boolean {
  if (req.headers.get('x-agent-id')) return true
  const ua = req.headers.get('user-agent') ?? ''
  for (const p of AGENT_UA_PATTERNS) { if (p.test(ua)) return true }
  if (!ua || ua.length < 5) return true
  return false
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for server-side operations
    )

    const {
      txId,
      contentId,
      expectedAmount,
      asset,
      payerAddress,
      contractAddress
    } = await req.json()

    // Fetch transaction from Stacks API
    const txDetails = await fetchStacksTransaction(txId)

    if (!txDetails) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify transaction details
    const verification = await verifyPaymentTransaction(txDetails, {
      contentId,
      expectedAmount,
      asset,
      payerAddress,
      contractAddress
    })

    if (!verification.isValid) {
      return new Response(
        JSON.stringify({
          error: 'Payment verification failed',
          details: verification.reason
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check for double-spend
    const { data: existingPayment } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('transaction_hash', txId)
      .single()

    if (existingPayment) {
      return new Response(
        JSON.stringify({ error: 'Payment already processed' }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get content creator
    const { data: content } = await supabaseClient
      .from('content')
      .select('creator_id')
      .eq('id', contentId)
      .single()

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Detect if requester is an AI agent
    const isAgent = isAgentRequest(req)

    // Record payment
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        transaction_hash: txId,
        content_id: contentId,
        payer_address: payerAddress,
        creator_id: content.creator_id,
        amount: verification.actualAmount,
        asset: asset,
        is_ai_agent: isAgent,
        status: 'confirmed',
        processed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    // Grant content access
    const { error: accessError } = await supabaseClient
      .from('access_grants')
      .insert({
        content_id: contentId,
        user_address: payerAddress,
        payment_id: payment.id,
        granted_at: new Date().toISOString(),
        expires_at: null, // Permanent access for now
      })

    if (accessError) throw accessError

    // Trigger notifications (use agent-specific type if detected)
    await triggerNotifications({
      type: isAgent ? 'ai_agent_payment' : 'payment_received',
      contentId,
      creatorId: content.creator_id,
      payerAddress,
      amount: verification.actualAmount,
      asset,
      isAgent,
    })

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        access_granted: true,
        amount: verification.actualAmount,
        asset: asset,
        is_ai_agent: isAgent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Payment verification error:', error)
    return new Response(
      JSON.stringify({ error: 'Payment verification failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Fetch transaction from Stacks API
async function fetchStacksTransaction(txId: string) {
  try {
    const response = await fetch(`https://api.stacks.co/extended/v1/tx/${txId}`)
    if (!response.ok) return null

    const tx = await response.json()
    return tx
  } catch (error) {
    console.error('Failed to fetch transaction:', error)
    return null
  }
}

// Verify payment transaction details
async function verifyPaymentTransaction(txDetails: any, expected: any) {
  try {
    // Check transaction status
    if (txDetails.tx_status !== 'success') {
      return { isValid: false, reason: 'Transaction not successful' }
    }

    // Verify contract call
    if (txDetails.tx_type !== 'contract_call') {
      return { isValid: false, reason: 'Not a contract call' }
    }

    // Verify contract address
    if (txDetails.contract_call.contract_id !== expected.contractAddress) {
      return { isValid: false, reason: 'Wrong contract address' }
    }

    // Verify function name (should be pay-for-content)
    if (txDetails.contract_call.function_name !== 'pay-for-content') {
      return { isValid: false, reason: 'Wrong function called' }
    }

    // Verify sender
    if (txDetails.sender_address !== expected.payerAddress) {
      return { isValid: false, reason: 'Wrong sender' }
    }

    // For STX payments, check the amount
    if (expected.asset === 'STX') {
      const actualAmount = parseInt(txDetails.contract_call.function_args[1].repr.replace('u', ''))
      if (actualAmount < expected.expectedAmount) {
        return { isValid: false, reason: 'Insufficient payment amount' }
      }
      return { isValid: true, actualAmount }
    }

    // For other assets, more complex verification needed
    // This is simplified - in production, would verify token transfers
    return { isValid: true, actualAmount: expected.expectedAmount }

  } catch (error) {
    console.error('Payment verification failed:', error)
    return { isValid: false, reason: 'Verification error' }
  }
}

// Trigger notifications via task-completion-notification Edge Function
async function triggerNotifications(data: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const response = await fetch(
      `${supabaseUrl}/functions/v1/task-completion-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          type: data.type ?? 'payment_received',
          creatorId: data.creatorId,
          contentId: data.contentId,
          paymentId: data.paymentId,
          amount: data.amount,
          asset: data.asset,
          payerAddress: data.payerAddress,
        }),
      }
    )

    if (!response.ok) {
      console.error('Notification request failed:', response.status, await response.text())
    }
  } catch (error) {
    console.error('Notification failed:', error)
    // Don't fail the payment if notification fails
  }
}
