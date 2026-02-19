import { config as loadEnv } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV !== "production") {
  loadEnv();
}

const schema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STACKS_RPC_URL: z.string().url(),
  STACKS_NETWORK: z.enum(["mainnet", "testnet"]).default("testnet"),
  RELAYER_PRIVATE_KEY: z.string().min(1),
  SUBSCRIPTION_CONTRACT: z
    .string()
    .regex(/^[A-Z0-9]{41}\.[a-zA-Z0-9-]+$/i, { message: "Expected <address>.<contract-name>" }),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  FRONTEND_URL: z.string().url(),
  RELAYER_POLL_INTERVAL_MS: z.coerce.number().default(60_000),
  RELAYER_BATCH_SIZE: z.coerce.number().default(25),
  RELAYER_MAX_ATTEMPTS: z.coerce.number().default(5),
  TX_FEE_MICROSTX: z.coerce.bigint().default(1_000n),
  NOTIFICATION_POLL_INTERVAL_MS: z.coerce.number().default(60_000),
  NOTIFICATION_BATCH_SIZE: z.coerce.number().default(25),
});

const parsed = schema.parse(process.env);
const [subscriptionContractAddress, subscriptionContractName] = parsed.SUBSCRIPTION_CONTRACT.split(".");

export const appConfig = {
  ...parsed,
  subscriptionContractAddress,
  subscriptionContractName,
};

export type AppConfig = typeof appConfig;
