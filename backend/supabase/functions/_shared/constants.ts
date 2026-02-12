/**
 * Shared constants for PayStack Edge Functions
 */

// Deployed contract address on Stacks testnet
export const REVENUE_SPLIT_CONTRACT = "STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-split";

// Supported assets
export const SUPPORTED_ASSETS = ["STX", "sBTC", "USDCx"] as const;
export type SupportedAsset = (typeof SUPPORTED_ASSETS)[number];

// x402 challenge expiry (15 minutes)
export const X402_CHALLENGE_TTL_MS = 15 * 60 * 1000;
