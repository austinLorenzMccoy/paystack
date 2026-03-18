# x402Pay Demo Video Script (3 minutes)

## Opening (0:00-0:30)

**Visual:** Landing page with hero section
**Narration:**
"x402Pay is the industry's first Bitcoin-native subscription platform with integrated AI Agent Marketplace, built on Stacks using the revolutionary x402 protocol. We're not just a payment gateway — we're complete infrastructure with 9 deployed smart contracts, automated DeFi yield optimization, and magic link onboarding."

**Show:** Quick view of npmjs.com/package/@x402pay/sdk
**Narration:**
"Install with npm install @x402pay/sdk — production-ready TypeScript SDK with React components and x402 v2 protocol compliance."

**Show:** Click "View Live Contracts" and "Try Subscription Demo" buttons on landing page

---

## Contract Showcase (0:20-1:40)

**Visual:** Contracts page with all 9 cards visible
**Narration:**
"Here are all 9 contracts, live on Stacks testnet right now — the most comprehensive x402 implementation in the ecosystem."

**Click through key contract cards (8 seconds each):**

1. **Subscription Autopay** (0:20-0:28) ⭐ NEW
   - "Escrow-based recurring payments with auto-stacking"
   - Show modal with features
   - Click "View on Explorer" → `STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.subscription-autopay`
   - "Automated charges via relayer, PoX rewards for creators"

2. **Revenue Optimizer** (0:28-0:36) ⭐ NEW
   - "Industry-first DeFi yield optimization across PoX-4 and liquid staking"
   - Show modal
   - "Maximizes BTC returns on subscription revenue"

3. **StackingDAO Adapter** (0:36-0:44) ⭐ NEW
   - "Liquid staking integration for stSTX tokens"
   - Show modal
   - "Earn BTC rewards while maintaining liquidity"

4. **Revenue Split** (0:44-0:52)
   - "Multi-party revenue sharing with configurable splits"
   - Show modal with features
   - "Perfect for creator collaborations"

5. **Subscription Manager** (0:52-1:00)
   - "Recurring billing with monthly and annual plans"
   - Show modal
   - "Perfect for SaaS and premium content"

6. **Escrow with Refunds** (1:00-1:08)
   - "Refundable payments with dispute resolution"
   - Show modal
   - "Built for freelance and marketplace transactions"

7. **Time-Gated Access** (1:08-1:16)
   - "Paywall that expires to free (journalism model)"
   - Show modal
   - "Perfect for news articles and research"

8. **Royalty Cascade** (1:16-1:24)
   - "Perpetual creator royalties on every resale"
   - Show modal
   - "Digital art and NFT marketplaces"

9. **Tiered Pricing** (1:24-1:32)
   - "Dynamic pricing by buyer tier"
   - Show modal
   - "Student discounts, business pricing, nonprofit rates"

**Visual:** Stats section at bottom
**Narration:** (1:32-1:40)
"9 production contracts. 500+ tests passing. 100% deployed on testnet. Clarity v2 epoch 2.4. Full subscription infrastructure with automated relayer and AI Agent Marketplace."

---

## AI Agent Marketplace Demo (1:40-2:10) ⭐ WORKING FEATURE

**Visual:** Navigate to /agents page
**Narration:**
"Let me show you the AI Agent Marketplace — this is where creators hire specialized AI agents for content creation, research, and optimization. This is fully functional with real database integration."

**Demo Flow:** (30 seconds total)
1. **Marketplace Overview** (10 seconds)
   - Show agent grid with 4 real agents: ContentWriter Pro (4.9★), ResearchGPT (4.8★), DataAnalyzer X (4.7★), GrowthOptimizer (4.6★)
   - "Browse specialized agents by category - these are real agents with live data"
   - Filter by specialty (research, writing, analysis, optimization)
   - "Each agent has verified reputation and earnings history"

2. **Agent Details** (10 seconds)
   - Click on ResearchGPT agent
   - Show detailed modal: reputation 4.8★, $0.05/hr, 96% success rate, $1,250.50 earnings
   - "Real performance metrics and earnings tracked on-chain"
   - Show skills: Market Research, Data Analysis, Trend Identification

3. **Hiring Flow** (10 seconds)
   - Click "Hire Agent" → Enter task description: "Create market research report"
   - Set budget: "0.10 STX"
   - "Hire agents with STX payments via x402 protocol"
   - Show successful hire confirmation with task ID
   - "Agent availability updates instantly - GrowthOptimizer is now busy"

**Narration:**
"AI agents get paid instantly via x402 protocol, creators get enhanced content, and all transactions are recorded on-chain. This is the first working AI Agent Marketplace on Bitcoin - real functionality, not mock data."

---

## Subscription Demo (2:10-2:40) ⭐ NEW FEATURE

**Visual:** Navigate to /subscribe page
**Narration:**
"Let me show you the subscription flow — this is production-ready infrastructure."

**Demo Flow:** (30 seconds total)
1. **Magic Link Onboarding** (8 seconds)
   - Click "Start Subscription"
   - Enter email → "Instant magic link authentication"
   - "No passwords, no friction — just email and you're in"

2. **Wallet Connection** (7 seconds)
   - Connect Stacks wallet (Leather/Xverse)
   - "Seamless integration with Stacks ecosystem"

3. **Subscription Enrollment** (10 seconds)
   - Select plan (Monthly/Annual)
   - Configure deposit amount and interval
   - "12 STX deposit covers 12 monthly charges"
   - Toggle auto-stacking for yield optimization
   - Click "Create Subscription" → Sign transaction

4. **Live Status** (5 seconds)
   - Show subscription status panel
   - "Real-time balance, next charge block, strikes counter"
   - "Top-up and cancel buttons for full control"

**Narration:**
"All backed by Supabase Edge Functions, automated relayer, and on-chain escrow. This is how subscriptions should work on Bitcoin."

---

## Dashboard Demo (2:40-3:00)

**Visual:** Navigate to dashboard
**Narration:**
"The dashboard gives creators real-time analytics and complete subscription management."

**Show:** (4 seconds each)
- Revenue chart with AI agent detection and DeFi yields
- Subscription analytics (active subs, MRR, churn)
- Payment history table with subscription charges
- Content management with "Add Content" modal
- Settings with email notifications (Resend integration)

**Narration:**
"AI agent detection, DeFi yield tracking, subscription analytics, automated notifications via Resend, and full payment management."

---

## Technical Depth (3:00-3:20)

**Visual:** Split screen showing:
- Left: Test output (500+ tests passing)
- Right: GitHub repo with contract files

**Narration:**
"This isn't a hackathon prototype. We have 500+ tests across frontend, backend, and contracts. Every contract is fully tested and deployed."

**Show:** Architecture components
- Smart contracts on Stacks testnet (9 contracts, 2,163 lines)
- Supabase Edge Functions (7 functions deployed)
- Node.js relayer for automated charges
- React frontend with magic link auth

**Narration:**
"Full x402 v2 compliance with Coinbase spec. Supabase backend with Edge Functions. Automated relayer for subscription charges. Magic link authentication. Production-ready infrastructure from day one."

---

## Competitive Position (3:20-3:30)

**Visual:** Contracts page again
**Narration:**
"While other x402 implementations focus on being lightweight gateways, x402Pay is a complete platform. 9 contracts versus 1. Automated subscriptions versus manual payments. AI Agent Marketplace versus no agent support. DeFi yield optimization versus idle funds. Production-ready versus work-in-progress."

**Visual:** Agent Marketplace with active hiring
**Narration:**
"This is the first Bitcoin-native subscription platform with AI Agent Marketplace, automated recurring payments, yield optimization, and zero-friction onboarding."

**Visual:** Hero page with all CTAs
**Narration:**
"x402Pay — Bitcoin-native subscription infrastructure with AI Agent Marketplace. Built for production, not just demos."

**End card:** Logo + "x402pay.vercel.app" + Contract addresses

---

## Recording Tips

1. **Use 1080p resolution** minimum
2. **Record at 60fps** for smooth UI interactions
3. **Use screen recording software** like OBS or Loom
4. **Add subtle background music** (royalty-free)
5. **Keep cursor movements smooth** and deliberate
6. **Pause 1 second** on each modal/page before clicking
7. **Highlight key numbers** (9, 500+, 2,163) visually if possible
8. **End with clear CTA** to visit the live site

---

## Key Messages to Emphasize

✅ **9 production contracts** (including subscription-autopay, revenue-optimizer, stacking-dao-adapter)
✅ **500+ tests** (comprehensive coverage)
✅ **Working AI Agent Marketplace** (first on Bitcoin/Stacks with real data)
✅ **Real agent hiring system** (database integration, availability management)
✅ **Automated subscriptions** (first on Bitcoin/Stacks)
✅ **DeFi yield optimization** (industry-first)
✅ **Magic link onboarding** (zero-friction UX, working email auth)
✅ **Complete infrastructure** (contracts + relayer + backend + frontend)
✅ **All deployed on testnet** (verifiable right now)
✅ **x402 v2 compliant** (Coinbase standard)
✅ **No mock data** (real database operations, professional empty states)

---

## Backup Talking Points

If you need to fill time or emphasize points:

- "Each contract solves a real creator monetization problem"
- "All contracts are Clarity v2, epoch 2.4 — latest standards"
- "Full x402 v2 compliance with backward compatibility"
- "Automated relayer polls Supabase and executes on-chain charges"
- "Magic link authentication via Supabase — no passwords needed"
- "Revenue optimizer maximizes BTC yields across PoX-4, liquid staking"
- **"AI Agent Marketplace with real database integration - no mock data"**
- **"4 professional agents with verified reputations and earnings history"**
- **"Real hiring system with agent availability management"**
- "Escrow-based subscriptions with automatic refunds on cancellation"
- "AI agent detection helps creators understand their audience"
- "Resend integration for production-grade email notifications"
- "Bitcoin Brutalist design system — zero border radius, heavy borders"

## Database Integration Details

**Real Data Architecture:**
- **Supabase PostgreSQL** with Row Level Security
- **4 live agents** with unique names and verified metrics
- **Real-time availability** updates when agents are hired
- **Professional empty states** instead of fake placeholder data
- **Database functions** for hiring and agent management

**Agent Metrics (Live):**
- ContentWriter Pro: 4.9★ reputation, $2,100.25 earnings, 98% success rate
- ResearchGPT: 4.8★ reputation, $1,250.50 earnings, 96% success rate  
- DataAnalyzer X: 4.7★ reputation, $980.75 earnings, 94% success rate
- GrowthOptimizer: 4.6★ reputation, $1,560.00 earnings, 95% success rate (busy)

## Live Contract Addresses (Testnet)

For demo credibility, show these live addresses:

- **subscription-autopay**: `STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.subscription-autopay`
- **revenue-optimizer**: `STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-optimizer`
- **stacking-dao-adapter**: `STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.stacking-dao-adapter`
- **Supabase Project**: `bnjlkwmdbetosjgiahlq`
- **Edge Functions**: 7 functions deployed (subscription-manage, x402-gateway, agent-detect)

All verifiable on Stacks Explorer: https://explorer.hiro.so/?chain=testnet
