import { Resend } from "resend";
import { appConfig } from "./config";
import { logger } from "./logger";
import type { NotificationQueueEntry } from "./types";
import {
  fetchPendingNotifications,
  markNotificationFailed,
  markNotificationSending,
  markNotificationSent,
} from "./supabase-client";

const resend = new Resend(appConfig.RESEND_API_KEY);

function buildEmailBody(entry: Pick<NotificationQueueEntry, "notification_type" | "payload">): string {
  switch (entry.notification_type) {
    case "low_balance": {
      const remaining = entry.payload.remaining as number | undefined;
      return `⚠️ Low Balance\n\nYou have ${remaining ?? "low"} STX remaining in your subscription escrow. Top up to avoid cancellation.`;
    }
    case "strike_warning": {
      const strikes = entry.payload.strikes as number | undefined;
      return `Strike ${strikes ?? 1}/3: We could not process your subscription charge. Please top up your escrow.`;
    }
    case "cancelled":
      return "Your subscription was cancelled after multiple failed charges. Deposit funds and resubscribe to reactivate.";
    default:
      return "Subscription update";
  }
}

export async function processNotificationBatch(limit: number) {
  const entries = await fetchPendingNotifications(limit);
  if (entries.length === 0) {
    logger.debug("No pending notifications");
    return;
  }

  for (const entry of entries) {
    const contact = entry.subscriber_contacts;
    if (!contact?.email || !contact.verified) {
      await markNotificationFailed(entry, "No verified contact email");
      continue;
    }

    try {
      await markNotificationSending(entry);
      await resend.emails.send({
        from: appConfig.RESEND_FROM_EMAIL,
        to: contact.email,
        subject: entry.subject,
        text: buildEmailBody(entry),
      });
      await markNotificationSent(entry);
      logger.info("Notification sent", { notificationId: entry.id, email: contact.email });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await markNotificationFailed(entry, message);
      logger.error("Notification failed", { notificationId: entry.id, error: message });
    }
  }
}
