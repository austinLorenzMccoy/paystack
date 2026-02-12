# ⚡ PayStack Backend

> Supabase Edge Functions · Deno Runtime · Postgres + RLS · Realtime Subscriptions

The PayStack backend runs entirely on [Supabase](https://supabase.com/) — Edge Functions handle wallet authentication, payment verification, analytics processing, and notifications. The database layer uses Postgres with Row-Level Security and realtime change feeds.

---

## 📂 Structure

```
backend/
└── supabase/
    ├── functions/
    │   ├── auth-wallet/                    # Wallet signature verification + JWT issuance
    │   │   └── index.ts
    │   ├── verify-payment/                 # Stacks transaction verification + access grants
    │   │   └── index.ts
    │   ├── analytics-processor/            # Analytics event ingestion + daily metrics
    │   │   ├── index.ts                    # Edge Function entry (POST/GET)
    │   │   ├── analytics.ts                # Helper functions
    │   │   └── analytics.test.ts           # Deno unit tests
    │   ├── task-completion-notification/    # Webhook-triggered notifications
    │   │   └── index.ts
    │   └── _shared/
    │       ├── supabase-client.ts          # Service-role + anon client helpers
    │       └── analytics.ts                # Shared analytics utilities
    └── migrations/
        └── 0001_create_analytics_tables.sql  # analytics_events, creator_daily_metrics, RPC
```

---

## 🚀 Getting Started

### Prerequisites

- **Supabase CLI** — `npm install -g supabase`
- **Deno** ≥ 1.38 (bundled with Supabase CLI)
- A Supabase project with API credentials

### Local Development

```bash
cd backend/supabase

# Start local Supabase (Postgres, Auth, Storage, Realtime)
supabase start

# Apply migrations
supabase db push

# Serve Edge Functions locally
supabase functions serve
```

### Environment Variables

Set these in your Supabase project dashboard under **Settings → Edge Functions → Secrets**, or in a local `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...       # Server-only, never expose to frontend
SUPABASE_ANON_KEY=eyJhbGciOi...               # Public key for anon access
STACKS_API_URL=https://api.hiro.so            # Stacks blockchain API
```

> ⚠️ **Security**: `SUPABASE_SERVICE_ROLE_KEY` bypasses Row-Level Security. It must only be used in Edge Functions, never in frontend code.

---

## 🔧 Edge Functions

### `auth-wallet`

**Purpose**: Verify Stacks wallet signatures and issue Supabase JWT tokens.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth-wallet` | Accepts `{ address, signature, message }`, verifies the signature, creates/finds the user, returns a JWT |

**Flow**:
1. Client signs a challenge message with Hiro Wallet
2. Edge Function verifies the Stacks signature
3. Creates or retrieves the Supabase user
4. Returns a custom JWT for authenticated sessions

---

### `verify-payment`

**Purpose**: Verify Stacks blockchain transactions and grant content access.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/verify-payment` | Accepts `{ txId, contentId, creatorId }`, verifies on-chain, records payment, grants access |

**Flow**:
1. Client submits a transaction ID after paying
2. Edge Function fetches tx details from Stacks API
3. Validates amount, recipient, and contract call
4. Records payment in `payments` table
5. Creates entry in `access_grants` table
6. Triggers notification via `task-completion-notification`

---

### `analytics-processor`

**Purpose**: Ingest analytics events and serve aggregated creator metrics.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analytics-processor` | Record an analytics event (payment, view, agent interaction) |
| `GET` | `/analytics-processor?creatorId=X&days=30` | Fetch daily aggregated metrics for a creator |

**Payload (POST)**:
```json
{
  "paymentId": "pay-123",
  "creatorId": "creator-456",
  "contentId": "content-789",
  "payerAddress": "SP2...",
  "amount": 1.5,
  "asset": "STX",
  "isAIAgent": true,
  "metadata": { "source": "gpt-4o" }
}
```

**Response (GET)**:
```json
{
  "summary": {
    "totalRevenue": 32400,
    "paymentCount": 1240,
    "aiPaymentCount": 273
  },
  "daily": [
    { "day": "2026-02-01", "total_revenue": 1200, "payment_count": 45, "ai_payment_count": 10 }
  ]
}
```

---

### `task-completion-notification`

**Purpose**: Send webhook/push notifications when payments are verified or milestones are reached.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/task-completion-notification` | Trigger notification for a completed payment or event |

---

## 🗄️ Database Schema

### `analytics_events`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `payment_id` | `text` | Reference to payment |
| `creator_id` | `text` | Creator identifier |
| `content_id` | `text` | Content identifier |
| `payer_address` | `text` | Stacks wallet address |
| `amount` | `numeric` | Payment amount |
| `asset` | `text` | Asset type (STX, sBTC, USDCx) |
| `is_ai_agent` | `boolean` | Whether payer is an AI agent |
| `metadata` | `jsonb` | Additional event data |
| `recorded_at` | `timestamptz` | Event timestamp |

### `creator_daily_metrics`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `creator_id` | `text` | Creator identifier |
| `day` | `date` | Aggregation date |
| `total_revenue` | `numeric` | Sum of payments for the day |
| `payment_count` | `integer` | Number of payments |
| `ai_payment_count` | `integer` | Number of AI agent payments |

### RPC: `increment_creator_daily_metrics`

PL/pgSQL function that upserts daily metrics — inserts a new row or increments existing counters. Called by `analytics-processor` after each event.

---

## 🧪 Testing

### Deno Tests (Analytics)

```bash
deno test backend/supabase/functions/analytics-processor/analytics.test.ts
```

Tests cover:
- **Payload parsing** — required fields, amount validation, asset normalization
- **Day key generation** — ISO date extraction, invalid date handling
- **Event recording** — insert + RPC call with mock Supabase client
- **Metrics fetching** — query construction, date range, summary aggregation

### Shared Utilities

The `_shared/analytics.ts` module exports:
- `parseAnalyticsPayload(body)` — Validate and normalize incoming event data
- `getDayKey(date)` — Extract `YYYY-MM-DD` from a timestamp
- `recordAnalyticsEvent(client, payload)` — Insert event + update daily metrics
- `fetchCreatorMetrics(client, creatorId, days)` — Query aggregated metrics

---

## 🔒 Security

- **Row-Level Security (RLS)** — All tables have RLS policies; Edge Functions use the service-role key to bypass when needed
- **JWT verification** — `auth-wallet` issues short-lived tokens tied to wallet addresses
- **Input validation** — All Edge Functions validate payloads before database writes
- **CORS** — Configured per-function with appropriate origin restrictions

---

## 🚢 Deployment

```bash
# Deploy all Edge Functions
supabase functions deploy auth-wallet
supabase functions deploy verify-payment
supabase functions deploy analytics-processor
supabase functions deploy task-completion-notification

# Apply migrations to production
supabase db push --linked
```

---

MIT — Built on Stacks. Hardened for Agents. Stacked for Creators.
