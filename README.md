<p align="center">
  <img src="frontend/public/x402pay-logo.svg" alt="x402Pay Logo" width="120" height="120" />
</p>

# ⚡ x402Pay — Bitcoin-Native Creator Monetization SDK

> **One line of code. Bitcoin-native payments. Creator-first monetization.**

x402Pay is the first Bitcoin-native SDK for content monetization, built on [Stacks](https://www.stacks.co/) and powered by the [Coinbase x402 payment protocol](https://github.com/coinbase/x402). It lets creators, publishers, and AI agents stream micropayments through programmable Clarity smart contracts — with zero intermediaries.

**Live**: [x402pay.vercel.app](https://x402pay.vercel.app)
**Contract**: [`STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-split`](https://explorer.hiro.so/txid/STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-split?chain=testnet) (Stacks testnet)

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      x402Pay Mono-repo                      │
├──────────────┬───────────────────┬───────────────────────────┤
│  frontend/   │  backend/         │  contracts/               │
│  Next.js 16  │  Supabase Edge    │  Clarity v2 Smart         │
│  React 19    │  Functions (Deno) │  Contracts (epoch 2.4)    │
│  TailwindCSS │  x402 Gateway     │  Revenue Splits           │
│  Recharts    │  Agent Detection  │  Payment Processing       │
│  shadcn/ui   │  Realtime Subs    │  Testnet Deployed         │
└──────────────┴───────────────────┴───────────────────────────┘
```

| Layer | Stack | Purpose |
|-------|-------|---------|
| **Frontend** | Next.js 16, React 19, TailwindCSS, shadcn/ui, Recharts | Dashboard, landing page, SDK docs, wallet connect, x402 hook |
| **Backend** | Supabase (Edge Functions, Auth, Realtime, Postgres) | x402 gateway, AI agent detection, payment verification, analytics, notifications |
| **Contracts** | Clarity v2 (Stacks L2, epoch 2.4) | Revenue splitting, content registration, payment processing |

---

## 🔑 Key Features

### x402 Payment Protocol (Coinbase v2 Compatible)
- **Standard headers**: `PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE`, `PAYMENT-RESPONSE` (base64-encoded)
- **CAIP-2 network IDs**: `stacks:1` (mainnet), `stacks:2147483648` (testnet)
- **Scheme**: `exact` with `accepts[]` array for multi-asset support
- **Backward compatible**: Legacy `X-Payment-*` headers still supported

### AI Agent Detection
- **Heuristic detection**: User-Agent pattern matching (GPT, Claude, curl, python-requests, etc.)
- **Groq-powered classification**: LLM-based agent identification via Groq API
- **Agent-aware analytics**: Separate tracking for human vs. AI agent payments

### Revenue Splitting
- **On-chain splits**: Creator, platform, and collaborator shares via Clarity contract
- **Configurable**: Per-content split percentages (must sum to 100%)
- **Atomic**: Payment + split + access grant in a single transaction

---

## 🎨 Design System — Bitcoin Brutalist

- **Zero border-radius** — every element is angular
- **Heavy 2px+ borders** — structural, not decorative
- **Mono typography** — JetBrains Mono throughout
- **Color palette** — Bitcoin Orange `#F7931A`, Stacks Purple `#5546FF`, Success Green `#00FF41`, Charcoal `#1A1A1A`
- **Micro-interactions** — translate-on-hover, glitch animations, blinking cursors
- **Grid overlays** — subtle engineering-blueprint aesthetic

---

## 📂 Project Structure

```
x402Pay/
├── frontend/                # Next.js app (landing + dashboard + SDK docs)
│   ├── app/                 # App Router pages
│   ├── components/          # Landing, dashboard, UI components (shadcn/ui)
│   ├── hooks/               # use-x402, use-realtime-payments, use-realtime-analytics
│   ├── contexts/            # Auth + Wallet providers
│   ├── lib/                 # Supabase client, utilities
│   ├── __tests__/           # Vitest + RTL test suites (15 files, 80 tests)
│   └── vitest.config.ts     # Test + coverage configuration
├── backend/
│   └── supabase/
│       ├── functions/       # Edge Functions (Deno)
│       │   ├── auth-wallet/
│       │   ├── verify-payment/          # + inline AI agent detection
│       │   ├── analytics-processor/
│       │   ├── agent-detect/            # Groq-powered agent classification
│       │   ├── x402-gateway/            # x402 v2 payment gateway
│       │   ├── task-completion-notification/
│       │   └── _shared/                 # Constants, client helpers, analytics utils
│       └── migrations/      # SQL schema (analytics, agent, x402 tables)
├── contracts/
│   └── paystack-contracts/
│       ├── contracts/       # Clarity v2 .clar files
│       ├── tests/           # Clarinet + Vitest contract tests
│       └── deployments/     # Testnet deployment plans
├── docs/                    # PRDs, architecture docs, wireframes
└── .gitignore               # Covers .env, secrets, build artifacts
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **Supabase CLI** (for backend Edge Functions)
- **Clarinet** (for Clarity contract development)

### 1. Clone & Install

```bash
git clone https://github.com/austinLorenzMccoy/paystack.git
cd paystack
```

### 2. Frontend

```bash
cd frontend
pnpm install
cp .env.local.example .env.local   # Add your Supabase + contract credentials
pnpm dev                           # → http://localhost:3000
```

### 3. Backend (Supabase Edge Functions)

```bash
cd backend/supabase
cp .env.example .env               # Add Supabase, Groq, Stacks API keys
supabase start                     # Local Supabase instance
supabase functions serve           # Serve Edge Functions locally
```

### 4. Contracts

```bash
cd contracts/paystack-contracts
clarinet check                     # Validate Clarity v2 syntax
npm install && npm test            # Run contract test suite
```

---

## 🧪 Testing

| Area | Runner | Command |
|------|--------|---------|
| **Frontend** | Vitest + React Testing Library | `cd frontend && pnpm test` |
| **Frontend Coverage** | Vitest + v8 | `cd frontend && pnpm test:coverage` |
| **Contracts** | Clarinet + Vitest | `cd contracts/paystack-contracts && npm test` |
| **Backend** | Deno test | `deno test backend/supabase/functions/` |

### Current Status

```
Frontend:  15 test files, 80 tests passing
Backend:    7 Deno tests passing (agent detection)
Contracts:  6 tests passing (revenue-split)
```

---

## 🔑 Environment Variables

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_CONTRACT_ADDRESS=STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-split
NEXT_PUBLIC_STACKS_NETWORK=testnet
```

### Backend (Supabase Functions)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # Never expose to frontend
STACKS_API_URL=https://api.testnet.hiro.so
GROQ_API_KEY=gsk_...                      # For AI agent classification
FRONTEND_URL=http://localhost:3000
```

---

## 🔄 x402 Protocol Flow

```
┌──────────┐  1. GET /resource    ┌──────────────┐
│  Client   │────────────────────▶│  x402        │
│  (Human   │                     │  Gateway     │
│  or Agent)│◀────────────────────│              │
│           │  2. 402 + PAYMENT-  │  Detects     │
│           │     REQUIRED header │  AI agents   │
│           │                     └──────┬───────┘
│           │  3. POST + PAYMENT-        │
│           │     SIGNATURE header       │ 4. Verify tx
│           │────────────────────▶       │    on Stacks
│           │                            ▼
│           │  5. 200 + PAYMENT-  ┌──────────────┐
│           │◀── RESPONSE header  │  Stacks      │
└──────────┘                      │  Blockchain  │
                                  └──────────────┘
```

---

## 💰 Supported Assets

| Asset | Type | Use Case |
|-------|------|----------|
| **STX** | Stacks native | Low-fee paywalls, stacking yield |
| **sBTC** | Wrapped Bitcoin | Premium content, high-security drops |
| **USDCx** | Stablecoin | Subscriptions, stable payouts |

---

## 📖 Documentation

- [`docs/bitcoin-creator-sdk-prd.md`](docs/bitcoin-creator-sdk-prd.md) — Product Requirements
- [`docs/paystack-architecture-v2-supabase.md`](docs/paystack-architecture-v2-supabase.md) — System Architecture
- [`docs/paystack-frontend-prd.md`](docs/paystack-frontend-prd.md) — Frontend Design Spec
- [`docs/paystack-complete-system-architecture.md`](docs/paystack-complete-system-architecture.md) — Complete Architecture
- [`docs/paystack-video-demo-script.md`](docs/paystack-video-demo-script.md) — Video Demo Script

---

## 🌐 Ecosystem Compatibility

| Feature | Coinbase x402 | x402-stacks | StacksPay | MoltMarket | **x402Pay** |
|---------|---------------|-------------|-----------|------------|--------------|
| x402 v2 | ✅ | ✅ | ✅ | ✅ | ✅ |
| CAIP-2 network | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PAYMENT-REQUIRED` | ✅ | ✅ | — | — | ✅ |
| `PAYMENT-SIGNATURE` | ✅ | ✅ | — | — | ✅ |
| `PAYMENT-RESPONSE` | ✅ | ✅ | — | — | ✅ |
| AI agent detection | — | — | — | — | ✅ |
| Revenue splitting | — | — | — | ✅ | ✅ |
| Multi-asset | ✅ | ✅ | USDCx | STX+sBTC | STX+sBTC |

---

## 📜 License

MIT — Built on Stacks. Hardened for Agents. Stacked for Creators.
