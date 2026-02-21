#!/bin/bash

# Set faucet wallet private key for custodial wallet airdrops
# This uses the relayer wallet we generated earlier

echo "Setting faucet wallet secret for custodial wallet airdrops..."

# Relayer wallet private key (also used as faucet)
# Address: ST1SBQFZCF1SJQNX6QKEBKMFXHDBM174AQJDRXQR1
supabase secrets set FAUCET_PRIVATE_KEY=c6eaa960fb68110acdbc712202326ca7b8f9954106819de098c58a31f3d2f29801

echo "✅ Faucet secret configured!"
echo ""
echo "Faucet wallet address: ST1SBQFZCF1SJQNX6QKEBKMFXHDBM174AQJDRXQR1"
echo ""
echo "⚠️  IMPORTANT: Fund this wallet with testnet STX for airdrops"
echo "Go to: https://explorer.hiro.so/sandbox/faucet?chain=testnet"
echo "Request at least 50 STX to support multiple airdrops"
