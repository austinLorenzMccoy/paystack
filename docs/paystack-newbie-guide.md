# x402Pay for New Builders

Welcome! This guide explains x402Pay in plain language so you can understand what it does, why it matters, and how to try it yourself—no prior blockchain experience required.

---

### Explain Like I'm 10 (Naija Edition)

Picture you’re selling a secret comic on your blog from Lagos. Instead of asking people to send bank transfers or airtime pins, you give them a digital jar. When someone drops a satoshi (tiny Bitcoin) into the jar:
- the jar instantly shares the money between you, your cousin who helped draw it, and the platform,
- the lock on the comic opens immediately for that person—no waiting for alerts,
- and a notebook writes their name so your dashboard shows “Chidera just paid 0.001 STX.”

It’s like running a cashless recharge stand, but on the internet: **coin goes in → access unlocks → everybody gets paid**.

---

## 1. What is x402Pay?

x402Pay is a toolkit that lets online creators earn Bitcoin-native payments for their content. Imagine adding a “paywall” button to an article, video, or AI agent. With x402Pay, that button can accept Bitcoin (sBTC), Stacks (STX), or stablecoins (USDCx) and split revenue automatically between collaborators.

Think of it as:
- **Stripe for Bitcoin creators**, but without card processors or banks.
- **One SDK** that connects the frontend (website/app), backend (Supabase), and on-chain contract (Stacks).

---

## 2. Why would someone use it?

| Pain point | x402Pay’s answer |
|------------|------------------|
| “I want to monetize digital content without Web2 fees.” | Bitcoin-native payments with no traditional banking middlemen. |
| “I work with collaborators and need instant split payouts.” | Revenue split contract guarantees everyone gets paid atomically. |
| “AI agents consume paid APIs—how do I meter them?” | Analytics Edge Function records agent payments separately and streams realtime data. |

---

## 3. How the pieces fit together

```
User Wallet ──▶ x402Pay SDK (frontend) ──▶ Supabase backend ──▶ Clarity contract
             (pay button)               (Edge Functions)         (revenue split)
```

1. **Frontend**: A Next.js dashboard + landing site designed with the Bitcoin Brutalist aesthetic.
2. **Backend**: Supabase Edge Functions handle wallet auth, payment verification, analytics, and notifications.
3. **Smart Contract**: A Clarity contract on the Stacks blockchain enforces payment logic and revenue splits.

When someone pays, the contract splits the funds, Supabase records the event, and the creator dashboard updates instantly via realtime subscriptions.

---

## 4. Quick start (high level)

1. **Clone the repo** `git clone ... && cd x402Pay`
2. **Frontend**
   ```bash
   cd frontend
   pnpm install
   cp .env.local.example .env.local  # add Supabase keys
   pnpm dev
   ```
3. **Backend**
   ```bash
   cd backend/supabase
   supabase start
   supabase functions serve
   ```
4. **Contracts**
   ```bash
   cd contracts/paystack-contracts
   clarinet check && npm test
   ```
5. **Dashboard login**: Connect your Stacks wallet, view real payments, and watch AI agent stats update live.

---

## 5. Key terminology (plain English)

- **Stacks / STX**: The blockchain and native token x402Pay uses to run smart contracts.
- **sBTC**: Bitcoin that moves on Stacks so it can be programmable.
- **Supabase**: Backend service (database + auth + realtime) with serverless functions.
- **Edge Function**: A Deno function that runs close to users; x402Pay uses them for wallet auth, analytics, etc.
- **Clarity**: Smart-contract language for Stacks—readable and predictable.
- **Revenue Split**: Rules that say “creator gets 80%, platform 15%, collaborator 5%,” enforced by the contract.
- **AI Agent**: A bot or script that can pay for content; x402Pay tracks these separately from humans.

---

## 6. What’s special about the UI?

- Zero border radius, heavy borders, mono fonts: a “Bitcoin Brutalist” identity borrowed from hacker culture.
- Live tickers that show AI agent traffic.
- SDK docs embedded directly in the app with copy-to-clipboard snippets.
- Realtime charts powered by Supabase subscriptions.

---

## 7. Where to explore next

| Resource | Description |
|----------|-------------|
| `README.md` (root) | Monorepo architecture overview |
| `frontend/README.md` | Frontend structure, tests, commands |
| `backend/README.md` | Edge Functions, migrations, API reference |
| `contracts/README.md` | Clarity contract details + deployment |
| `docs/paystack-frontend-prd.md` | Design spec (Bitcoin Brutalist) |
| `docs/paystack-architecture-v2-supabase.md` | Full system architecture |

---

## 8. TL;DR elevator pitch

> **x402Pay** is a Bitcoin-native monetization SDK. Drop a button, call an Edge Function, and a Clarity contract enforces instant revenue splits while Supabase streams analytics in realtime.

Welcome aboard! Play with the dashboard, tweak the contract splits, or connect your own AI agent—and feel free to iterate on the brutalist design language to make it yours.
