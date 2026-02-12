# PayStack Video Demo Script

Use this script to record a natural, high-energy walkthrough (~4–5 minutes). The tone is confident, slightly edgy, and aligned with the Bitcoin Brutalist aesthetic.

---

## 0:00 – Cold Open (10s)
- Shot: Close-up of the dashboard hero section with live ticker.
- Voiceover: “This is PayStack—the Bitcoin-native SDK that lets creators and AI agents stream payments in one line of code.”
- Quick zoom on the ticker strip glowing “Realtime x402 Feed: Online.”

## 0:10 – Context (30s)
- On-camera or voiceover over B-roll of the landing page hero.
- Script:
  > “If you publish premium essays, run a members-only Discord, or operate an AI agent that consumes content, PayStack gives you instant Bitcoin-enabled paywalls. No chasing invoices, no centralized intermediaries. Just brutalist UI, programmable contracts, and live analytics.”

## 0:40 – Product Tour Intro (10s)
- Transition into the Next.js dashboard.
- Point out the Command Deck card and AI agent tile.
- Voiceover: “Let’s look at the Creator Overview where everything comes together.”

## 0:50 – Dashboard Stats + Realtime (60s)
1. Highlight the **Ticker Strip**:
   - “Live AI agent traffic sits at 22%, pulling directly from Supabase Realtime.”
2. Hover the **Stats Grid**; mention brutalist cards and animations.
3. Scroll to the **Revenue Chart** (Recharts). Note how AI payments overlay total revenue.
4. Mention placeholder fallback if no data: “Even on day one, we seed the UI with sample data so creators aren’t staring at an empty state.”

## 1:50 – SDK Callout + x402 Flow (40s)
- Focus on the SDK callout card.
- Read the bullet: sBTC / STX / USDCx rails.
- Then highlight the “Signal → Contract → Access” grid and narrate the flow:
  > “Signal via Hiro wallet, contract splits revenue on-chain, Supabase grants access instantly.”

## 2:30 – Realtime Panel (45s)
- Jump to the landing page RealtimePanel section.
- Show ticker, stream cards, and agent telemetry.
- Voiceover: “This UI isn’t fake. Under the hood we’re using two hooks—`useRealtimePayments` and `useRealtimeAnalytics`—to subscribe to Supabase change feeds. Every time the contract emits an event, the dashboard updates without a refresh.”

## 3:15 – SDK Docs (60s)
- Navigate to `/docs`.
- Scroll through the Quickstart steps; click the asset selector (sBTC → STX → USDCx).
- Use the copy button to demonstrate the code snippet.
- Mention the security checklist and flow cards for signal/contract/access.
- Script snippet:
  > “You install the SDK, register content IDs, and drop in `<PaywallButton />`. This entire page is built from the same design system, so documentation lives inside the product.”

## 4:15 – Architecture Call-Out (30s)
- Cut to a simple diagram (from README) or overlay text.
- Narration: “Frontend is Next.js 14 with a zero-radius brutalist design, backend runs Supabase Edge Functions for wallet auth, payment verification, and analytics, and Clarity contracts enforce revenue splits on Stacks.”

## 4:45 – Closing CTA (15s)
- Back to dashboard hero.
- Voiceover:
  > “PayStack is open-source and production-ready. Clone it, plug in your Supabase project, deploy the Clarity contract, and start stacking sats for your content. Bitcoin-native monetization is brutalist, fast, and live today.”

---

## Tips for Recording
- **Music**: Minimal techno/ambient track to match the brutalist vibe.
- **Color grading**: Lean into high contrast + orange/purple accents.
- **Screen capture**: 4K if possible, with smooth zooms on callouts.
- **Energy**: Confident, slightly rebellious (“no third-party toll booths”).
- **Length**: Aim for 4–5 minutes; keep transitions snappy.
