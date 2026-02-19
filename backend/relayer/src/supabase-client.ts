import { createClient } from "@supabase/supabase-js";
import { appConfig } from "./config";
import type {
  AutopaySubscription,
  NotificationQueueEntry,
  RelayerJob,
} from "./types";

export const supabase = createClient(appConfig.SUPABASE_URL, appConfig.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

export async function fetchPendingChargeJobs(limit: number): Promise<RelayerJob[]> {
  const { data, error } = await supabase
    .from("relayer_jobs")
    .select("*")
    .eq("job_type", "charge")
    .eq("status", "pending")
    .lte("run_at", new Date().toISOString())
    .order("run_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }

  return (data ?? []) as RelayerJob[];
}

export async function getSubscription(subscriptionId: string): Promise<AutopaySubscription | null> {
  const { data, error } = await supabase
    .from("autopay_subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch subscription ${subscriptionId}: ${error.message}`);
  }

  return data as AutopaySubscription;
}

async function insertJobEvent(params: {
  jobId: string;
  subscriptionId?: string | null;
  result: string;
  txId?: string;
  error?: string;
}) {
  const { error } = await supabase.from("relayer_job_events").insert({
    job_id: params.jobId,
    subscription_id: params.subscriptionId ?? null,
    result: params.result,
    tx_id: params.txId ?? null,
    error: params.error ?? null,
  });

  if (error) {
    throw new Error(`Failed to insert job event: ${error.message}`);
  }
}

export async function markJobRunning(job: RelayerJob) {
  const { error } = await supabase
    .from("relayer_jobs")
    .update({
      status: "running",
      attempts: job.attempts + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id);

  if (error) {
    throw new Error(`Failed to mark job running: ${error.message}`);
  }
}

export async function markJobSucceeded(job: RelayerJob, txId: string) {
  const { error } = await supabase
    .from("relayer_jobs")
    .update({
      status: "succeeded",
      updated_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("id", job.id);

  if (error) {
    throw new Error(`Failed to mark job success: ${error.message}`);
  }

  await insertJobEvent({
    jobId: job.id,
    subscriptionId: job.subscription_id,
    result: "succeeded",
    txId,
  });
}

export async function markJobFailed(job: RelayerJob, errorMessage: string) {
  const { error } = await supabase
    .from("relayer_jobs")
    .update({
      status: "failed",
      last_error: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id);

  if (error) {
    throw new Error(`Failed to mark job failure: ${error.message}`);
  }

  await insertJobEvent({
    jobId: job.id,
    subscriptionId: job.subscription_id,
    result: "failed",
    error: errorMessage,
  });
}

export async function rescheduleJob(job: RelayerJob, delayMs: number, errorMessage: string) {
  const nextRun = new Date(Date.now() + delayMs).toISOString();
  const { error } = await supabase
    .from("relayer_jobs")
    .update({
      status: "pending",
      run_at: nextRun,
      last_error: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id);

  if (error) {
    throw new Error(`Failed to reschedule job: ${error.message}`);
  }

  await insertJobEvent({
    jobId: job.id,
    subscriptionId: job.subscription_id,
    result: "retry",
    error: errorMessage,
  });
}

export async function updateSubscriptionLastTx(subscriptionId: string, txId: string) {
  const { error } = await supabase
    .from("autopay_subscriptions")
    .update({
      last_tx_id: txId,
      updated_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("id", subscriptionId);

  if (error) {
    throw new Error(`Failed to update subscription last tx: ${error.message}`);
  }
}

export async function fetchPendingNotifications(limit: number): Promise<NotificationQueueEntry[]> {
  const { data, error } = await supabase
    .from("notification_queue")
    .select("*, subscriber_contacts (email, verified)")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return (data ?? []) as NotificationQueueEntry[];
}

export async function markNotificationSending(entry: NotificationQueueEntry) {
  const { error } = await supabase
    .from("notification_queue")
    .update({
      status: "sending",
      attempts: entry.attempts + 1,
      last_error: null,
    })
    .eq("id", entry.id);

  if (error) {
    throw new Error(`Failed to mark notification sending: ${error.message}`);
  }
}

export async function markNotificationSent(entry: NotificationQueueEntry) {
  const { error } = await supabase
    .from("notification_queue")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("id", entry.id);

  if (error) {
    throw new Error(`Failed to mark notification sent: ${error.message}`);
  }
}

export async function markNotificationFailed(entry: NotificationQueueEntry, message: string) {
  const { error } = await supabase
    .from("notification_queue")
    .update({
      status: "failed",
      last_error: message,
    })
    .eq("id", entry.id);

  if (error) {
    throw new Error(`Failed to mark notification failed: ${error.message}`);
  }
}
