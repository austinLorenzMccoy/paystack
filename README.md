# ⚡ PayStack — Bitcoin-Native Creator Monetization SDK

> **One line of code. Bitcoin-native payments. Creator-first monetization.**

PayStack is the first Bitcoin-native SDK for content monetization, built on [Stacks](https://www.stacks.co/) and powered by the x402 payment protocol. It lets creators, publishers, and AI agents stream micropayments through programmable Clarity smart contracts — with zero intermediaries.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     PayStack Mono-repo                  │
├──────────────┬──────────────────┬───────────────────────┤
│  frontend/   │  backend/        │  contracts/           │
│  Next.js 14  │  Supabase Edge   │  Clarity Smart        │
│  React 18    │  Functions (Deno)│  Contracts            │
│  TailwindCSS │  Postgres + RLS  │  Revenue Splits       │
│  Recharts    │  Realtime Subs   │  Payment Processing   │
└──────────────┴──────────────────┴───────────────────────┘
```

| Layer | Stack | Purpose |
|-------|-------|---------|
| **Frontend** | Next.js 14, React 18, TailwindCSS, Recharts | Dashboard, landing page, SDK docs, wallet connect |
| **Backend** | Supabase (Edge Functions, Auth, Realtime, Storage) | Wallet auth, payment verification, analytics, notifications |
| **Contracts** | Clarity (Stacks L2) | Revenue splitting, content registration, payment processing |

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
PayStack/
├── frontend/               # Next.js app (landing + dashboard + SDK docs)
│   ├── app/                # App Router pages
│   ├── components/         # Landing, dashboard, UI components
│   ├── hooks/              # Realtime subscriptions (payments, analytics)
│   ├── contexts/           # Auth + Wallet providers
│   ├── lib/                # Supabase client, utilities
│   ├── __tests__/          # Vitest + RTL test suites
│   └── vitest.config.ts    # Test + coverage configuration
├── backend/
│   └── supabase/
│       ├── functions/      # Edge Functions (Deno)
│       │   ├── auth-wallet/
│       │   ├── verify-payment/
│       │   ├── analytics-processor/
│       │   ├── task-completion-notification/
│       │   └── _shared/    # Supabase client helpers, analytics utils
│       └── migrations/     # SQL schema (analytics tables, RPC functions)
├── contracts/
│   └── paystack-contracts/
│       ├── contracts/      # Clarity .clar files
│       └── tests/          # Clarinet + Vitest contract tests
├── docs/                   # PRDs, architecture docs, wireframes
└── .github/workflows/      # CI pipeline (lint, test, coverage)
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
git clone https://github.com/your-org/PayStack.git
cd PayStack
```

### 2. Frontend

```bash
cd frontend
pnpm install
cp .env.local.example .env.local   # Add your Supabase credentials
pnpm dev                           # → http://localhost:3000
```

### 3. Backend (Supabase Edge Functions)

```bash
cd backend/supabase
supabase start                     # Local Supabase instance
supabase functions serve           # Serve Edge Functions locally
```

### 4. Contracts

```bash
cd contracts/paystack-contracts
clarinet check                     # Validate Clarity syntax
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

### Current Coverage (Frontend)

```
 Test Files  14 passed (14)
      Tests  72 passed (72)

Statements : 31.56%
Branches   : 29.87%
Functions  : 33.75%
Lines      : 32.89%
```

> Coverage is growing as we add tests for remaining dashboard sub-pages and utility hooks.

---

## 🔑 Environment Variables

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Backend (Supabase Functions)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # Never expose to frontend
STACKS_API_URL=https://api.hiro.so
```

---

## 🔄 CI / CD

GitHub Actions workflow at `.github/workflows/ci.yml` runs on every push/PR to `main`:

1. **Frontend** — `pnpm lint` → `pnpm test:coverage`
2. **Contracts** — `clarinet check` → `npm test`

---

## 💰 Supported Assets

| Asset | Type | Use Case |
|-------|------|----------|
| **sBTC** | Wrapped Bitcoin | Premium content, high-security drops |
| **STX** | Stacks native | Stacking yield, low-fee paywalls |
| **USDCx** | Stablecoin | Subscriptions, stable payouts |

---

## 📖 Documentation

- [`docs/bitcoin-creator-sdk-prd.md`](docs/bitcoin-creator-sdk-prd.md) — Product Requirements
- [`docs/paystack-architecture-v2-supabase.md`](docs/paystack-architecture-v2-supabase.md) — System Architecture
- [`docs/paystack-frontend-prd.md`](docs/paystack-frontend-prd.md) — Frontend Design Spec
- [`docs/paystack-complete-system-architecture.md`](docs/paystack-complete-system-architecture.md) — Complete Architecture

---

## 📜 License

MIT — Built on Stacks. Hardened for Agents. Stacked for Creators.
