"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function NotificationsPage() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [webhooks, setWebhooks] = useState([
    { id: "1", url: "https://myapp.com/webhooks/x402pay", active: true },
  ]);

  return (
    <div>
      <h1 className="mb-8 font-mono text-3xl font-extrabold uppercase text-foreground">
        Notifications
      </h1>

      <div className="flex max-w-2xl flex-col gap-6">
        {/* Email Notifications */}
        <div className="border-2 border-border bg-charcoal p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-mono text-lg font-bold text-foreground">Email Alerts</h3>
              <p className="mt-1 text-sm text-fog">Receive email notifications for new payments</p>
            </div>
            <button
              type="button"
              onClick={() => setEmailEnabled(!emailEnabled)}
              className={`relative h-8 w-14 transition-colors ${
                emailEnabled ? "bg-bitcoin-orange" : "bg-concrete"
              }`}
              role="switch"
              aria-checked={emailEnabled}
              aria-label="Toggle email alerts"
            >
              <span
                className={`absolute top-1 h-6 w-6 bg-foreground transition-all ${
                  emailEnabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Telegram */}
        <div className="border-2 border-border bg-charcoal p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-mono text-lg font-bold text-foreground">Telegram</h3>
              <p className="mt-1 text-sm text-fog">Get instant alerts via Telegram bot</p>
            </div>
            <button
              type="button"
              onClick={() => setTelegramEnabled(!telegramEnabled)}
              className={`relative h-8 w-14 transition-colors ${
                telegramEnabled ? "bg-bitcoin-orange" : "bg-concrete"
              }`}
              role="switch"
              aria-checked={telegramEnabled}
              aria-label="Toggle Telegram alerts"
            >
              <span
                className={`absolute top-1 h-6 w-6 bg-foreground transition-all ${
                  telegramEnabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Webhooks */}
        <div className="border-2 border-border bg-charcoal p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-mono text-lg font-bold text-foreground">Webhook URLs</h3>
              <p className="mt-1 text-sm text-fog">Send payment events to your endpoints</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 border-2 border-border bg-concrete px-4 py-2 font-mono text-xs uppercase text-foreground transition-all hover:border-bitcoin-orange"
            >
              <Plus size={14} />
              Add Webhook
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="flex items-center gap-3 border-2 border-border bg-concrete px-4 py-3">
                <span className="inline-block h-2 w-2 bg-success-green" aria-hidden="true" />
                <code className="flex-1 font-mono text-sm text-foreground">{webhook.url}</code>
                <button
                  type="button"
                  className="p-1.5 text-error-red transition-colors hover:text-error-red/80"
                  aria-label="Remove webhook"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="self-start border-3 border-background bg-bitcoin-orange px-8 py-3 font-mono text-sm font-bold uppercase tracking-wider text-background transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_#000]"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
