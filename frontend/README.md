# ⚡ x402Pay Frontend

> Next.js 16 · React 19 · TailwindCSS · shadcn/ui · Bitcoin Brutalist Design System

The x402Pay frontend delivers the creator dashboard, landing page, SDK documentation, and wallet integration — all styled with the **Bitcoin Brutalist** design language: zero radii, heavy borders, mono typography, and angular micro-interactions.

**Live**: [x402pay-app.vercel.app](https://x402pay-app.vercel.app)

---

## 📂 Structure

```
frontend/
├── app/
│   ├── page.tsx                 # Landing page (Hero, Features, HowItWorks, RealtimePanel, Stats, CTA)
│   ├── not-found.tsx            # Custom 404 page
│   ├── subscribe/page.tsx       # Subscription page with magic link auth and wallet connect
│   ├── agents/page.tsx          # AI Agent Marketplace
│   ├── contracts/page.tsx       # Smart contracts showcase
│   ├── dashboard/
│   │   ├── page.tsx             # Creator Overview (stats, charts, SDK callout, x402 flow)
│   │   ├── layout.tsx           # Dashboard shell (sidebar + header)
│   │   ├── analytics/           # Analytics deep-dive
│   │   ├── content/             # Content management
│   │   ├── payments/            # Payment history
│   │   ├── agents/              # Agent management
│   │   └── settings/            # Profile, API Keys, Notifications
│   └── docs/
│       └── page.tsx             # SDK documentation (quickstart, asset selector, code snippets)
├── components/
│   ├── landing/                 # Hero, Header, Features, HowItWorks, RealtimePanel, Stats, CTA, Footer
│   ├── dashboard/               # Sidebar, DashboardHeader
│   ├── magic-link-modal.tsx      # Email authentication modal
│   ├── subscription-enrollment-dialog.tsx # Subscription enrollment flow
│   ├── ui/                      # shadcn/ui primitives (50+ components)
│   └── wallet-connect-button.tsx
├── hooks/
│   ├── use-x402.ts             # x402 v2 payment hook (PAYMENT-REQUIRED/SIGNATURE/RESPONSE headers)
│   ├── use-realtime-payments.ts # Supabase realtime subscription for payments
│   └── use-realtime-analytics.ts # Supabase realtime subscription for analytics events
├── contexts/
│   ├── auth-context.tsx         # Supabase auth state provider
│   └── wallet-context.tsx       # Stacks wallet connection provider (Xverse/Leather)
├── lib/
│   ├── supabase.ts              # Browser Supabase client (null-safe for SSG)
│   └── utils.ts                 # cn() utility
├── __tests__/                   # All test suites (15 files, 80 tests)
├── .env.local.example           # Environment variable template
├── vitest.config.ts             # Vitest + v8 coverage config
└── vitest.setup.ts              # Global mocks, polyfills, test setup
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9

### Install & Run

```bash
cd frontend
pnpm install
```

Create `.env.local` from the example template:

```bash
cp .env.local.example .env.local
```

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_KEY=eyJhbGciOi...

# Deployed Contracts (Stacks testnet)
NEXT_PUBLIC_CONTRACT_ADDRESS=STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-split
NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ADDRESS=STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.subscription-autopay
NEXT_PUBLIC_REVENUE_OPTIMIZER_CONTRACT=STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-optimizer
NEXT_PUBLIC_STACKING_DAO_ADAPTER_CONTRACT=STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.stacking-dao-adapter

# App Configuration (for magic link redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=x402pay
NEXT_PUBLIC_APP_DESCRIPTION=Bitcoin-native creator monetization platform

# Magic Link Authentication (Resend)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# WalletConnect (optional - for mobile wallet support)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Stacks Network
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so
NEXT_PUBLIC_MERCHANT_PRINCIPAL=STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF
```

> The Supabase client is null-safe — the app builds and renders even when env vars are missing (e.g. during Vercel SSG). Features requiring Supabase simply degrade gracefully.

Start the dev server:

```bash
pnpm dev          # → http://localhost:3000
```

### Build for Production

```bash
pnpm build
pnpm start        # → http://localhost:3000
```

---

## 🎨 Design System — Bitcoin Brutalist

| Token | Value | Usage |
|-------|-------|-------|
| `--bitcoin-orange` | `#F7931A` | Primary CTAs, headings, accents |
| `--stacks-purple` | `#5546FF` | Secondary actions, code highlights |
| `--success-green` | `#00FF41` | AI agent indicators, positive trends |
| `--charcoal` | `#1A1A1A` | Card backgrounds |
| `--concrete` | `#2D2D2D` | Hover states, code blocks |
| `--fog` | `#E0E0E0` | Body text, labels |
| `--radius` | `0rem` | Zero border-radius everywhere |

### Utility Classes (defined in `globals.css`)

- **`.card-brutalist`** — 2px border, orange top-bar, hover translate + shadow
- **`.btn-brutalist`** — Uppercase mono, 4px box-shadow, translate on hover
- **`.ticker-strip`** — Horizontal status bar with blinking dot
- **`.grid-overlay`** — Subtle engineering-grid background
- **`.outline-glow`** — Dashed orange outline for callout cards

---

## 🔌 Hooks

### `useX402()` — x402 v2 Payment Protocol

Full implementation of the [Coinbase x402 protocol](https://github.com/coinbase/x402) for Stacks:

- **`checkAccess(contentId, address?)`** — GET request, reads `Payment-Required` header (base64 `PaymentRequirements`), falls back to legacy `X-Payment-*` headers
- **`submitReceipt(token, txId)`** — POST with `Payment-Signature` header (base64 `PaymentPayload`), reads `Payment-Response` header on success
- **`reset()`** — Clear state

Returns `{ loading, challenge, hasAccess, error, settlement, checkAccess, submitReceipt, reset }`.

### `useRealtimePayments(creatorId)`

Subscribes to `INSERT` events on the `payments` table filtered by `creator_id`. Returns `{ payments, connected }`. Null-safe — skips subscription if Supabase client is unavailable.

### `useRealtimeAnalytics(creatorId)`

Subscribes to `INSERT` events on the `analytics_events` table filtered by `creator_id`. Returns `{ events, connected }`. Null-safe — skips subscription if Supabase client is unavailable.

All hooks auto-cleanup on unmount via `supabase?.removeChannel()`.

---

## 🧪 Testing

### Stack

- **Vitest** — Test runner with `globals: true`
- **React Testing Library** — Component rendering + queries
- **@testing-library/jest-dom** — DOM matchers
- **jsdom** — Browser environment
- **@vitest/coverage-v8** — Coverage reporting

### Commands

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Run with coverage report
```

### Test Suites (15 files, 80 tests)

| Suite | Tests | Coverage |
|-------|-------|----------|
| Landing Hero | 6 | ✅ Headlines, CTAs, code block, clipboard, AI indicator |
| Landing Header | 5 | ✅ Logo, nav, status strip, wallet, mobile menu |
| Landing Features | 4 | ✅ Heading, cards, descriptions, links |
| Landing HowItWorks | 4 | ✅ Heading, steps, numbers, code snippets |
| Landing RealtimePanel | 6 | ✅ Ticker, stream, entries, telemetry, button |
| Landing Stats | 2 | ✅ Values, labels |
| Landing CTA | 4 | ✅ Heading, subtext, button, docs link |
| Landing Footer | 5 | ✅ Brand, tagline, product links, community links, copyright |
| Dashboard Overview | 8 | ✅ Placeholder data, ticker, heading, SDK callout, x402 flow |
| Dashboard Header | 5 | ✅ Menu, breadcrumbs, testnet badge, wallet |
| Dashboard Sidebar | 7 | ✅ Logo, nav items, settings, collapse, mobile close |
| SDK Docs Page | 8 | ✅ Heading, steps, checklist, asset selector, flow, clipboard |
| x402 Hook | 8 | ✅ Default state, v2 PAYMENT-REQUIRED parsing, legacy fallback, PAYMENT-SIGNATURE send, PAYMENT-RESPONSE read, settlement state, error handling |
| Realtime Payments Hook | 4 | ✅ Empty state, subscribe, cleanup, null guard |
| Realtime Analytics Hook | 4 | ✅ Empty state, subscribe, cleanup, null guard |

> Core landing components and hooks are at 80–100%. Dashboard sub-pages (analytics, content, payments, settings) and auto-generated UI primitives account for the remaining uncovered lines.

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | Run Next.js ESLint |
| `pnpm test` | Run all Vitest tests |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:coverage` | Tests + v8 coverage report |

---

## 📖 Key Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — Hero, Features, HowItWorks, RealtimePanel, Stats, CTA |
| `/subscribe` | Subscription page — Magic link authentication, wallet connect, plan selection |
| `/agents` | AI Agent Marketplace — Browse and hire AI agents for content creation |
| `/contracts` | Smart contracts showcase — 9 deployed contracts with live stats |
| `/dashboard` | Creator Overview — Stats, revenue chart, top content, recent payments, SDK callout |
| `/dashboard/analytics` | Analytics deep-dive |
| `/dashboard/content` | Content management |
| `/dashboard/payments` | Payment history |
| `/dashboard/agents` | Agent management dashboard |
| `/dashboard/settings/*` | Profile, API Keys, Notifications |
| `/docs` | SDK documentation — Quickstart, asset selector, code snippets, security checklist |

---

## 🔐 Authentication & Wallet Flow

### Magic Link Authentication
1. **Email Signup**: Users enter email → receive magic link via Resend
2. **Auto-Redirect**: Magic link redirects to `NEXT_PUBLIC_APP_URL/subscribe`
3. **Session Creation**: Supabase creates authenticated session
4. **Status**: User can now access subscription features

### Wallet Connection (Required for Payments)
1. **Install Wallet**: Xverse or Leather (MetaMask not supported)
2. **Connect Button**: Click "Connect Wallet" → sats-connect opens wallet
3. **Address Selection**: User selects Stacks address
4. **Session Storage**: Wallet info stored in sessionStorage
5. **Ready**: User can now subscribe and make payments

**Flow Order**: Connect wallet → Magic link auth → Subscribe

---

## 🛠️ Build Configuration

### Webpack vs Turbopack
- **Default**: Uses Webpack for better ESM/CJS compatibility
- **Turbopack**: Available via `pnpm dev:turbo` (experimental)
- **Issue**: Turbopack has ESM compatibility issues with Stacks packages

### ESM Package Transpilation
The following packages are transpiled for browser compatibility:
```js
transpilePackages: [
  '@reown/appkit',
  '@reown/appkit-adapter-wagmi', 
  '@stacks/connect',
  '@stacks/network',
  '@stacks/transactions',
  'sats-connect',
  '@sats-connect/core',
  '@sats-connect/ui',
  '@sats-connect/make-default-provider-config'
]
```

### Build Troubleshooting
- **Module factory errors**: Use webpack (`pnpm dev` instead of `pnpm dev:turbo`)
- **ESM/CJS conflicts**: Ensure all blockchain packages are in `transpilePackages`
- **Magic link localhost**: Set `NEXT_PUBLIC_APP_URL` correctly for production

---

MIT — Built on Stacks. Hardened for Agents. Stacked for Creators.
