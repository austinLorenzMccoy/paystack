import {
  AnchorMode,
  ClarityValue,
  FungibleConditionCode,
  PostConditionMode,
  makeContractCall,
  standardPrincipalCV,
  broadcastTransaction,
} from "@stacks/transactions";
import { StacksMainnet, StacksTestnet } from "@stacks/network";
import { appConfig } from "./config";

const network = appConfig.STACKS_NETWORK === "mainnet"
  ? new StacksMainnet({ url: appConfig.STACKS_RPC_URL })
  : new StacksTestnet({ url: appConfig.STACKS_RPC_URL });

export async function chargeSubscription(subscriberPrincipal: string) {
  const tx = await makeContractCall({
    contractAddress: appConfig.subscriptionContractAddress,
    contractName: appConfig.subscriptionContractName,
    functionName: "charge-subscription",
    functionArgs: [standardPrincipalCV(subscriberPrincipal)],
    senderKey: appConfig.RELAYER_PRIVATE_KEY,
    network,
    anchorMode: AnchorMode.Any,
    fee: appConfig.TX_FEE_MICROSTX,
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
    nonce: undefined,
  });

  const result = await broadcastTransaction(tx, network);
  if ((result as { error: string }).error) {
    const err = result as { error: string; reason: string };
    throw new Error(`Stacks tx failed: ${err.error} ${err.reason ?? ""}`.trim());
  }

  return (result as { txid: string }).txid;
}
