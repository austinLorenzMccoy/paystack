# ⚡ x402Pay Backend

> Supabase Edge Functions · Deno Runtime · x402 v2 Gateway · AI Agent Detection · Postgres + RLS · Realtime Subscriptions

The x402Pay backend runs entirely on [Supabase](https://supabase.com/) — Edge Functions handle the x402 payment gateway, AI agent detection, wallet authentication, payment verification, analytics processing, and notifications. The database layer uses Postgres with Row-Level Security and realtime change feeds.

---

## 📂 Structure

```
backend/
└── supabase/
    ├── functions/
    │   ├── auth-wallet/                    # Wallet signature verification + JWT issuance
    │   │   └── index.ts
    │   ├── verify-payment/                 # Stacks tx verification + inline agent detection
    │   │   └── index.ts
    │   ├── x402-gateway/                   # x402 v2 payment gateway (Coinbase compatible)
    │   │   ├── index.ts                    # GET → 402, POST → verify receipt
    │   │   ├── agent-bridge.ts             # Agent detection bridge
    │   │   └── x402.test.ts               # Deno unit tests
    │   ├── agent-detect/                   # Groq-powered AI agent classification
    │   │   └── index.ts
    │   ├── analytics-processor/            # Analytics event ingestion + daily metrics
    │   │   ├── index.ts                    # Edge Function entry (POST/GET)
    │   │   ├── analytics.ts                # Helper functions
    │   │   └── analytics.test.ts           # Deno unit tests
    │   ├── task-completion-notification/    # Webhook-triggered notifications
    │   │   └── index.ts
    │   └── _shared/
    │       ├── constants.ts                # Deployed contract address, supported assets, TTL
    │       ├── supabase-client.ts          # Service-role + anon client helpers
    │       └── analytics.ts                # Shared analytics utilities
    ├── migrations/
    │   ├── 0001_create_analytics_tables.sql  # analytics_events, creator_daily_metrics, RPC
    │   └── 0002_create_agent_and_x402_tables.sql  # agent_detections, x402_challenges, agent_usage
    └── .env.example                        # Environment variable template
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

Set these in your Supabase project dashboard under **Settings → Edge Functions → Secrets**, or in a local `.env` file (see `.env.example`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...       # Server-only, never expose to frontend
SUPABASE_ANON_KEY=eyJhbGciOi...               # Public key for anon access
STACKS_API_URL=https://api.testnet.hiro.so    # Stacks blockchain API
STACKS_NETWORK=testnet                        # testnet or mainnet
GROQ_API_KEY=gsk_...                          # Groq API key for AI agent classification
FRONTEND_URL=http://localhost:3000            # Frontend URL for notification links
```

> ⚠️ **Security**: `SUPABASE_SERVICE_ROLE_KEY` bypasses Row-Level Security. It must only be used in Edge Functions, never in frontend code.

---

## 🔧 Edge Functions

### `x402-gateway` (Coinbase x402 v2 Compatible)

**Purpose**: HTTP 402 payment gateway implementing the [Coinbase x402 protocol](https://github.com/coinbase/x402).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/x402-gateway?contentId=X` | Check access or return 402 with payment instructions |
| `POST` | `/x402-gateway` | Submit payment receipt to unlock content |

**x402 v2 Standard Headers**:

| Header | Direction | Description |
|--------|-----------|-------------|
| `Payment-Required` | Response (402) | Base64-encoded `PaymentRequirements` with `x402Version`, `scheme`, CAIP-2 `network`, `accepts[]` |
| `Payment-Signature` | Request (POST) | Base64-encoded `PaymentPayload` with `{ scheme, network, payload: { txId, token } }` |
| `Payment-Response` | Response (200) | Base64-encoded `SettlementResponse` with tx confirmation details |

**402 Response Body** (also includes legacy `X-Payment-*` headers for backward compatibility):
```json
{
  "x402Version": 2,
  "scheme": "exact",
  "network": "stacks:2147483648",
  "accepts": [{ "scheme": "exact", "network": "stacks:2147483648", "amount": "1000", "asset": "STX", "payTo": "SP1..." }],
  "extra": { "challengeToken": "uuid", "expires": "ISO-8601" }
}
```

---

### `agent-detect`

**Purpose**: AI agent classification using Groq LLM and heuristic User-Agent pattern matching.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/agent-detect` | Classify a request as human or AI agent |

**Detection Methods**:
1. **Header check**: `x-agent-id` header presence
2. **UA pattern matching**: Regex patterns for GPT, Claude, curl, python-requests, langchain, etc.
3. **Groq LLM classification**: Falls back to Groq API for ambiguous cases

---

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

**Purpose**: Verify Stacks blockchain transactions, detect AI agents inline, and grant content access.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/verify-payment` | Accepts `{ txId, contentId, creatorId }`, verifies on-chain, detects agents, records payment, grants access |

**Flow**:
1. Client submits a transaction ID after paying
2. Edge Function fetches tx details from Stacks API
3. Validates amount, recipient, and contract call
4. **Inline AI agent detection** (User-Agent heuristics + `x-agent-id` header)
5. Records payment in `payments` table with `is_ai_agent` flag
6. Creates entry in `access_grants` table
7. Triggers notification via `task-completion-notification` Edge Function

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

### Migration 0001: Analytics Tables

#### `analytics_events`

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

#### `creator_daily_metrics`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `creator_id` | `text` | Creator identifier |
| `day` | `date` | Aggregation date |
| `total_revenue` | `numeric` | Sum of payments for the day |
| `payment_count` | `integer` | Number of payments |
| `ai_payment_count` | `integer` | Number of AI agent payments |

#### RPC: `increment_creator_daily_metrics`

PL/pgSQL function that upserts daily metrics — inserts a new row or increments existing counters. Called by `analytics-processor` after each event.

### Migration 0002: Agent Detection & x402 Tables

#### `agent_detections`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `request_id` | `text` | Unique request identifier |
| `user_agent` | `text` | Raw User-Agent string |
| `is_agent` | `boolean` | Detection result |
| `detection_method` | `text` | `heuristic`, `groq`, or `header` |
| `confidence` | `numeric` | Detection confidence (0–1) |
| `detected_at` | `timestamptz` | Timestamp |

#### `x402_challenges`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `content_id` | `text` | Content being accessed |
| `requester` | `text` | Requester address or agent ID |
| `is_agent` | `boolean` | Whether requester is an AI agent |
| `amount` | `numeric` | Payment amount required |
| `asset` | `text` | Asset type |
| `recipient` | `text` | Creator wallet address |
| `challenge_token` | `text` | Unique challenge token |
| `status` | `text` | `pending`, `paid`, `expired` |
| `paid_tx_id` | `text` | Stacks transaction ID (after payment) |
| `expires_at` | `timestamptz` | Challenge expiration |

#### `agent_usage`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `agent_id` | `text` | Agent identifier |
| `content_id` | `text` | Content accessed |
| `payment_id` | `text` | Associated payment |
| `tokens_used` | `integer` | API tokens consumed |
| `recorded_at` | `timestamptz` | Timestamp |

---

## 🧪 Testing

### Deno Tests

```bash
# Agent detection tests (7 tests)
deno test backend/supabase/functions/x402-gateway/x402.test.ts

# Analytics tests
deno test backend/supabase/functions/analytics-processor/analytics.test.ts
```

**Agent detection tests** cover:
- `x-agent-id` header detection
- User-Agent patterns: python-requests, curl, openai SDK, langchain
- Browser UA (Chrome) → human classification
- Empty UA → agent classification

**Analytics tests** cover:
- Payload parsing — required fields, amount validation, asset normalization
- Day key generation — ISO date extraction, invalid date handling
- Event recording — insert + RPC call with mock Supabase client
- Metrics fetching — query construction, date range, summary aggregation

### Shared Utilities

The `_shared/analytics.ts` module exports:
- `parseAnalyticsPayload(body)` — Validate and normalize incoming event data
- `getDayKey(date)` — Extract `YYYY-MM-DD` from a timestamp
- `recordAnalyticsEvent(client, payload)` — Insert event + update daily metrics
- `fetchCreatorMetrics(client, creatorId, days)` — Query aggregated metrics

The `_shared/constants.ts` module exports:
- `DEPLOYED_CONTRACT_ADDRESS` — `STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-split`
- `SUPPORTED_ASSETS` — `["STX", "sBTC", "USDCx"]`
- `X402_CHALLENGE_TTL_MS` — Challenge token TTL (15 minutes)

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
supabase functions deploy agent-detect
supabase functions deploy x402-gateway

# Apply migrations to production
supabase db push --linked
```

> **Secrets**: Set `GROQ_API_KEY`, `STACKS_API_URL`, `STACKS_NETWORK`, and `FRONTEND_URL` in Supabase dashboard → Settings → Edge Functions → Secrets before deploying.

---

MIT — Built on Stacks. Hardened for Agents. Stacked for Creators.
