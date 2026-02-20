#!/bin/bash

# Supabase Edge Function Environment Variables
# Run this script to configure all required secrets for the subscription-manage function

echo "Setting Supabase Edge Function secrets..."

# Stacks API URL
supabase secrets set STACKS_API_URL=https://api.testnet.hiro.so

# Default merchant principal (platform address)
supabase secrets set DEFAULT_MERCHANT_PRINCIPAL=STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF

# Subscription contract address
supabase secrets set SUBSCRIPTION_CONTRACT_ADDRESS=STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.subscription-autopay

echo "✅ Supabase secrets configured successfully!"
echo ""
echo "Deployed contracts:"
echo "  - subscription-autopay: STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.subscription-autopay"
echo "  - revenue-optimizer: STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-optimizer"
