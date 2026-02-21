import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateWallet, getStxAddress } from "https://esm.sh/@stacks/wallet-sdk@6.3.0";
import { makeSTXTokenTransfer, broadcastTransaction } from "https://esm.sh/@stacks/transactions@6.3.0";
import { StacksTestnet } from "https://esm.sh/@stacks/network@6.3.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FAUCET_PRIVATE_KEY = Deno.env.get("FAUCET_PRIVATE_KEY")!; // Funded wallet for airdrops
const AIRDROP_AMOUNT = 5_000_000; // 5 STX in microSTX

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user already has a custodial wallet
    const { data: existingWallet } = await supabase
      .from("custodial_wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (existingWallet) {
      return new Response(
        JSON.stringify({
          wallet: {
            address: existingWallet.stx_address,
            created_at: existingWallet.created_at,
            balance: existingWallet.balance_cached,
          },
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate new wallet
    const wallet = await generateWallet({
      secretKey: crypto.randomUUID(), // Random seed
      password: crypto.randomUUID(), // Random password
    });

    const account = wallet.accounts[0];
    const stxAddress = getStxAddress({ account, transactionVersion: 0x80 }); // Testnet

    // Encrypt and store wallet data
    const encryptedMnemonic = btoa(wallet.rootKey); // Simple base64 - use proper encryption in production

    // Store in database
    const { error: insertError } = await supabase.from("custodial_wallets").insert({
      user_id: user.id,
      stx_address: stxAddress,
      encrypted_mnemonic: encryptedMnemonic,
      balance_cached: 0,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      throw new Error(`Failed to store wallet: ${insertError.message}`);
    }

    // Airdrop 5 testnet STX
    try {
      const network = new StacksTestnet();
      
      const txOptions = {
        recipient: stxAddress,
        amount: AIRDROP_AMOUNT,
        senderKey: FAUCET_PRIVATE_KEY,
        network,
        anchorMode: 1, // Any
      };

      const transaction = await makeSTXTokenTransfer(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, network);

      // Update wallet with airdrop info
      await supabase
        .from("custodial_wallets")
        .update({
          balance_cached: AIRDROP_AMOUNT,
          airdrop_tx_id: broadcastResponse.txid,
        })
        .eq("user_id", user.id);

      console.log(`Airdropped ${AIRDROP_AMOUNT / 1_000_000} STX to ${stxAddress}, txid: ${broadcastResponse.txid}`);
    } catch (airdropError) {
      console.error("Airdrop failed:", airdropError);
      // Continue even if airdrop fails - user can fund manually
    }

    return new Response(
      JSON.stringify({
        wallet: {
          address: stxAddress,
          created_at: new Date().toISOString(),
          balance: AIRDROP_AMOUNT,
          airdrop_pending: true,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating custodial wallet:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
