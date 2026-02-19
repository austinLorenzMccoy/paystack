import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  boolCV,
  someCV,
  noneCV,
} from "@stacks/transactions";
import { StacksTestnet as TestnetNetwork, StacksMainnet as MainnetNetwork } from "@stacks/network";
import { openContractCall } from "@stacks/connect";

const network =
  process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet"
    ? new MainnetNetwork()
    : new TestnetNetwork();

const contractAddress =
  process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ADDRESS?.split(".")[0] ??
  "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

const contractName =
  process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ADDRESS?.split(".")[1] ??
  "subscription-autopay";

export interface SubscriptionParams {
  merchantPrincipal: string;
  depositAmount: number; // in micro-STX
  intervalBlocks: number;
  autoStack: boolean;
  poxAddress?: {
    version: number;
    hashbytes: Uint8Array;
  };
}

export async function createSubscription(
  params: SubscriptionParams,
  userAddress: string
): Promise<{ txId: string }> {
  const functionArgs = [
    standardPrincipalCV(params.merchantPrincipal),
    uintCV(params.depositAmount),
    uintCV(params.intervalBlocks),
    boolCV(params.autoStack),
    noneCV(), // PoX address optional - simplified for now
  ];

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: "create-subscription",
      functionArgs,
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        resolve({ txId: data.txId });
      },
      onCancel: () => {
        reject(new Error("Transaction cancelled by user"));
      },
    });
  });
}

export async function topUpSubscription(
  amount: number,
  userAddress: string
): Promise<{ txId: string }> {
  const functionArgs = [uintCV(amount)];

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: "top-up",
      functionArgs,
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        resolve({ txId: data.txId });
      },
      onCancel: () => {
        reject(new Error("Transaction cancelled by user"));
      },
    });
  });
}

export async function cancelSubscription(
  userAddress: string
): Promise<{ txId: string }> {
  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: "cancel-subscription",
      functionArgs: [],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        resolve({ txId: data.txId });
      },
      onCancel: () => {
        reject(new Error("Transaction cancelled by user"));
      },
    });
  });
}

export async function toggleAutoStack(
  enabled: boolean,
  userAddress: string
): Promise<{ txId: string }> {
  const functionArgs = [boolCV(enabled)];

  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName: "toggle-auto-stack",
      functionArgs,
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        resolve({ txId: data.txId });
      },
      onCancel: () => {
        reject(new Error("Transaction cancelled by user"));
      },
    });
  });
}

export async function waitForTransaction(
  txId: string,
  maxAttempts = 30
): Promise<boolean> {
  const stacksApiUrl =
    process.env.NEXT_PUBLIC_STACKS_API_URL ?? "https://api.hiro.so";

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(
        `${stacksApiUrl}/extended/v1/tx/${txId}`
      );
      if (response.ok) {
        const tx = await response.json();
        if (tx.tx_status === "success") {
          return true;
        }
        if (tx.tx_status === "abort_by_response" || tx.tx_status === "abort_by_post_condition") {
          throw new Error(`Transaction failed: ${tx.tx_status}`);
        }
      }
    } catch (error) {
      console.error("Error checking transaction:", error);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error("Transaction confirmation timeout");
}
