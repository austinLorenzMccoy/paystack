import { appConfig } from "./config";
import { logger } from "./logger";
import {
  fetchPendingChargeJobs,
  getSubscription,
  markJobFailed,
  markJobRunning,
  markJobSucceeded,
  rescheduleJob,
  updateSubscriptionLastTx,
} from "./supabase-client";
import type { RelayerJob } from "./types";
import { chargeSubscription } from "./stacks-client";

async function processJob(job: RelayerJob) {
  try {
    await markJobRunning(job);
    const subscription = await getSubscription(job.subscription_id);

    if (!subscription) {
      await markJobFailed(job, "Subscription not found");
      return;
    }

    if (subscription.status !== "active") {
      await markJobFailed(job, `Subscription status ${subscription.status}`);
      return;
    }

    const txId = await chargeSubscription(subscription.subscriber_principal);
    await updateSubscriptionLastTx(subscription.id, txId);
    await markJobSucceeded(job, txId);
    logger.info("Charge succeeded", { jobId: job.id, txId, subscriptionId: subscription.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (job.attempts + 1 >= appConfig.RELAYER_MAX_ATTEMPTS) {
      await markJobFailed(job, message);
      logger.error("Job failed permanently", { jobId: job.id, error: message });
    } else {
      const backoff = Math.pow(2, job.attempts) * 60_000;
      await rescheduleJob(job, backoff, message);
      logger.warn("Job rescheduled", { jobId: job.id, error: message, delayMs: backoff });
    }
  }
}

async function pollOnce() {
  try {
    const jobs = await fetchPendingChargeJobs(appConfig.RELAYER_BATCH_SIZE);
    if (jobs.length === 0) {
      logger.debug("No pending jobs");
      return;
    }

    logger.info("Processing jobs", { count: jobs.length });
    for (const job of jobs) {
      await processJob(job);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Polling failed", { error: message });
  }
}

async function start() {
  logger.info("Starting subscription relayer", {
    pollIntervalMs: appConfig.RELAYER_POLL_INTERVAL_MS,
    batchSize: appConfig.RELAYER_BATCH_SIZE,
  });
  await pollOnce();
  setInterval(() => {
    pollOnce().catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("Scheduled poll failed", { error: message });
    });
  }, appConfig.RELAYER_POLL_INTERVAL_MS);
}

start().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error("Relayer crashed during startup", { error: message });
  process.exit(1);
});
