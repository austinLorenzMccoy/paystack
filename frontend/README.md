# ⚡ PayStack Frontend

> Next.js 14 · React 18 · TailwindCSS · Bitcoin Brutalist Design System

The PayStack frontend delivers the creator dashboard, landing page, SDK documentation, and wallet integration — all styled with the **Bitcoin Brutalist** design language: zero radii, heavy borders, mono typography, and angular micro-interactions.

---

## 📂 Structure

```
frontend/
├── app/
│   ├── page.tsx                 # Landing page (Hero, Features, HowItWorks, RealtimePanel, Stats, CTA)
│   ├── dashboard/
│   │   ├── page.tsx             # Creator Overview (stats, charts, SDK callout, x402 flow)
│   │   ├── layout.tsx           # Dashboard shell (sidebar + header)
│   │   ├── analytics/           # Analytics deep-dive
│   │   ├── content/             # Content management
│   │   ├── payments/            # Payment history
│   │   └── settings/            # Profile, API Keys, Notifications
│   └── docs/
│       └── page.tsx             # SDK documentation (quickstart, asset selector, code snippets)
├── components/
│   ├── landing/                 # Hero, Header, Features, HowItWorks, RealtimePanel, Stats, CTA, Footer
│   ├── dashboard/               # Sidebar, DashboardHeader
│   ├── ui/                      # shadcn/ui primitives (50+ components)
│   └── wallet-connect-button.tsx
├── hooks/
│   ├── use-realtime-payments.ts # Supabase realtime subscription for payments
│   └── use-realtime-analytics.ts # Supabase realtime subscription for analytics events
├── contexts/
│   ├── auth-context.tsx         # Supabase auth state provider
│   └── wallet-context.tsx       # Stacks wallet connection provider
├── lib/
│   ├── supabase.ts              # Browser Supabase client
│   └── utils.ts                 # cn() utility
├── __tests__/                   # All test suites
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

Create `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

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

## 🔌 Realtime Subscriptions

Two custom hooks connect the dashboard to Supabase Realtime:

### `useRealtimePayments(creatorId)`

Subscribes to `INSERT` events on the `payments` table filtered by `creator_id`. Returns `{ payments, connected }`.

### `useRealtimeAnalytics(creatorId)`

Subscribes to `INSERT` events on the `analytics_events` table filtered by `creator_id`. Returns `{ events, connected }`.

Both hooks auto-cleanup on unmount via `supabase.removeChannel()`.

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

### Test Suites (14 files, 72 tests)

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
| Realtime Payments Hook | 4 | ✅ Empty state, subscribe, cleanup, null guard |
| Realtime Analytics Hook | 4 | ✅ Empty state, subscribe, cleanup, null guard |

### Coverage Summary

```
Statements : 31.56%
Branches   : 29.87%
Functions  : 33.75%
Lines      : 32.89%
```

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
| `/dashboard` | Creator Overview — Stats, revenue chart, top content, recent payments, SDK callout |
| `/dashboard/analytics` | Analytics deep-dive |
| `/dashboard/content` | Content management |
| `/dashboard/payments` | Payment history |
| `/dashboard/settings/*` | Profile, API Keys, Notifications |
| `/docs` | SDK documentation — Quickstart, asset selector, code snippets, security checklist |

---

MIT — Built on Stacks. Hardened for Agents. Stacked for Creators.
