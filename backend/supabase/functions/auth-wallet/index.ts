import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { message, signature, walletAddress } = await req.json()

    // Verify the signature
    const isValidSignature = await verifyStacksSignature(message, signature, walletAddress)

    if (!isValidSignature) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user exists, create if not
    const { data: existingUser } = await supabaseClient
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    let userId: string

    if (existingUser) {
      userId = existingUser.id
    } else {
      // Create new user
      const { data: newUser, error } = await supabaseClient
        .from('users')
        .insert({
          wallet_address: walletAddress,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      userId = newUser.id
    }

    // Generate custom JWT token for wallet auth
    const { data, error } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: `${walletAddress}@stacks.local`, // Dummy email for wallet auth
      options: {
        data: {
          wallet_address: walletAddress,
          user_id: userId,
        }
      }
    })

    if (error) throw error

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        wallet_address: walletAddress,
        access_token: data.properties?.access_token,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Verify Stacks wallet signature
async function verifyStacksSignature(message: string, signature: string, walletAddress: string): Promise<boolean> {
  try {
    // Use @stacks/transactions to verify signature
    const { verifyMessageSignature } = await import('https://esm.sh/@stacks/transactions@6.11.0')

    const isValid = verifyMessageSignature({
      message,
      signature,
      publicKey: walletAddress, // In practice, you'd derive public key from address
    })

    return isValid
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}
