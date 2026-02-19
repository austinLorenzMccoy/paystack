export type AutopaySubscriptionStatus = "active" | "paused" | "cancelled" | "completed";

export interface AutopaySubscription {
  id: string;
  subscriber_principal: string;
  merchant_principal: string;
  plan_id: string | null;
  contract_address: string;
  amount_per_interval: number;
  interval_blocks: number;
  auto_stack: boolean;
  pox_address: Record<string, unknown> | null;
  deposit_amount: number | null;
  balance_cached: number | null;
  next_charge_block: number | null;
  last_charge_block: number | null;
  strikes: number;
  status: AutopaySubscriptionStatus;
  last_status_change: string;
  last_error: string | null;
  last_tx_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface RelayerJob {
  id: string;
  subscription_id: string;
  job_type: string;
  status: string;
  run_at: string;
  attempts: number;
  last_error: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriberContact {
  id: string;
  subscriber_principal: string;
  email: string;
  verified: boolean;
  verification_token: string | null;
}

export type NotificationStatus = "pending" | "sending" | "sent" | "failed";

export interface NotificationQueueEntry {
  id: string;
  subscription_id: string;
  contact_id: string;
  notification_type: string;
  subject: string;
  payload: Record<string, unknown>;
  status: NotificationStatus;
  attempts: number;
  last_error: string | null;
  created_at: string;
  sent_at: string | null;
  subscriber_contacts?: {
    email: string;
    verified: boolean;
  } | null;
}
