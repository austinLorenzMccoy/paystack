# Product Requirements Document (PRD)
## Bitcoin Creator Monetization SDK
### "x402Pay" - The x402-Stacks Content Monetization API

---

## 1. EXECUTIVE SUMMARY

**Product Name:** x402Pay SDK  
**Tagline:** *"One Line of Code. Bitcoin-Native Payments. Creator-First Monetization."*

**Vision Statement:**  
x402Pay is the first Bitcoin-native content monetization SDK that enables creators to monetize ANY digital content with x402-stacks micropayments in under 5 minutes. Unlike generic payment APIs, x402Pay uniquely combines Stacks' Clarity smart contracts with x402 protocol to provide creator-owned revenue streams, AI agent compatibility, and Bitcoin-secured settlements.

**The 10/10 Unique Angle:**
1. **Bitcoin-Native First**: Only SDK optimized for sBTC, STX, and USDCx on Stacks - bringing Bitcoin's security to creator economy
2. **Creator Revenue Contracts**: Clarity smart contracts that give creators programmable, immutable revenue splits
3. **AI Agent Economy Ready**: Built-in support for autonomous AI agents paying for content access
4. **Zero Platform Lock-in**: Creators own their revenue stream via Clarity contracts - no platform can deplatform them
5. **Hybrid Settlement**: Choose between sBTC (security), STX (stacking rewards), or USDCx (stability) per content type

**Target Users:**
- Independent content creators (writers, educators, developers)
- API developers wanting to monetize endpoints
- Media publishers seeking micropayment alternatives
- AI agent developers building autonomous systems

---

## 2. PROBLEM STATEMENT

### Current Pain Points:

**For Creators:**
- Platform fees eat 10-30% of revenue (Substack, Patreon, Medium)
- Risk of deplatforming (centralized control)
- Can't accept Bitcoin payments natively
- No support for AI agents as customers
- Forced into subscription models (can't do pay-per-use)

**For Developers:**
- Existing x402 SDKs on Base/Solana don't leverage Bitcoin
- No smart contract-backed revenue management
- Complex integration for content monetization
- No ecosystem for creator-specific features

**For the Stacks Ecosystem:**
- Limited real-world x402-stacks adoption
- No showcase of Clarity + x402 synergy
- Missing creator economy use cases
- Need to differentiate from Base/Solana x402 implementations

---

## 3. SOLUTION OVERVIEW

### What We're Building:

**x402Pay SDK** - A developer toolkit that makes it trivially easy to:
1. Add x402-stacks micropayments to ANY content (articles, APIs, videos, courses, datasets)
2. Deploy Clarity smart contracts for revenue management (splits, royalties, subscriptions)
3. Accept payments from both humans AND AI agents
4. Settle in Bitcoin (sBTC), STX, or USDCx based on creator preference

### Core Value Propositions:

**For Creators:**
- **5-Minute Setup**: Add `<x402Pay />` component or 3 lines of backend code
- **Bitcoin Payments**: Accept sBTC with Bitcoin's security guarantees
- **Programmable Revenue**: Set splits, royalties, tipping via Clarity contracts
- **AI Agent Revenue**: Tap into agentic economy - agents pay automatically for your content
- **True Ownership**: Smart contract = your revenue stream can't be seized

**For Developers:**
- **Complete SDK**: React components, REST middleware, Clarity contract templates
- **Multi-Asset Support**: sBTC, STX, USDCx in single integration
- **Analytics Dashboard**: See who paid, what they accessed, agent vs. human traffic
- **Production Ready**: Testnet & mainnet support, monitoring, error handling

**For Stacks Ecosystem:**
- **Killer Use Case**: Demonstrates x402 + Clarity working together
- **Creator Adoption**: Brings content creators into Bitcoin L2 ecosystem
- **Agent Economy**: Positions Stacks as THE chain for AI agent payments
- **sBTC Utility**: Real-world use case for sBTC beyond DeFi

---

## 4. UNIQUE FEATURES (10/10 Rating Justification)

### Feature 1: Bitcoin-Native Revenue Contracts (Clarity Smart Contracts)

**What Makes It Unique:**
- Deploy Clarity smart contracts that manage revenue distribution ON-CHAIN
- Creators can set:
  - **Revenue splits**: 80% to creator, 10% to collaborator, 10% to platform
  - **Royalty cascades**: Original author gets 5% whenever content is re-licensed
  - **Time-based pricing**: Free after 30 days, $0.10 before
  - **Stacking integration**: Auto-stake STX payments for passive yield

**Why It Wins:**
- NO other x402 implementation offers smart contract revenue management
- Leverages Clarity's decidability for predictable payment logic
- Shows off Stacks' unique capabilities vs. Base/Solana

**MVP Implementation:**
```clarity
;; Example Creator Revenue Contract
(define-public (distribute-payment (amount uint) (content-id (string-ascii 50)))
  (let (
    (creator-share (/ (* amount u80) u100))
    (platform-share (/ (* amount u10) u100))
    (collaborator-share (/ (* amount u10) u100))
  )
    (try! (stx-transfer? creator-share tx-sender creator-address))
    (try! (stx-transfer? platform-share tx-sender platform-address))
    (try! (stx-transfer? collaborator-share tx-sender collab-address))
    (ok true)
  )
)
```

---

### Feature 2: AI Agent Discovery Protocol

**What Makes It Unique:**
- Creators tag content with machine-readable metadata
- AI agents can discover monetizable content via standardized API
- Automatic payment negotiation based on agent budget constraints
- Agent reputation tracking (via NFT badges for high-paying agents)

**Why It Wins:**
- Positions Stacks as THE platform for agentic economy
- No competitor has agent discovery built-in
- Creates network effects (more agents → more creator revenue → more creators join)

**MVP Implementation:**
```json
// Content Discovery API Response
{
  "contentId": "article-2024-btc-future",
  "title": "The Future of Bitcoin in 2026",
  "pricing": {
    "sbtc": "0.00001",
    "stx": "0.50",
    "usdcx": "0.25"
  },
  "agentCompatible": true,
  "contractAddress": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.creator-revenue-v1",
  "accessControl": "pay-per-view",
  "contentType": "article/markdown",
  "tokenGate": false
}
```

---

### Feature 3: Hybrid Settlement Options (sBTC/STX/USDCx)

**What Makes It Unique:**
- Creators choose settlement asset PER content piece
- High-value content → sBTC (security)
- Community content → STX (stacking rewards)
- Fiat-pegged content → USDCx (price stability)
- SDK handles conversions automatically

**Why It Wins:**
- Showcases x402-stacks' multi-asset capability
- Other x402 implementations are single-asset (USDC only on Base)
- Gives creators financial flexibility

**MVP Implementation:**
```typescript
// Creator specifies preferred asset per content
const paymentConfig = {
  "premium-course": { asset: "sBTC", price: "0.0001" },
  "blog-posts": { asset: "STX", price: "0.5" },
  "api-calls": { asset: "USDCx", price: "0.01" }
};
```

---

### Feature 4: Zero-Knowledge Access Control (Privacy Add-on)

**What Makes It Unique:**
- Prove payment without revealing buyer identity
- Use Stacks' privacy features for anonymous content access
- Useful for sensitive content (medical, legal, whistleblower docs)

**Why It Wins:**
- Privacy + payments = massive differentiator
- Bitcoin ethos aligned (financial privacy)
- No other x402 SDK offers this

**MVP Scope:**
- NOT included in week 1 MVP
- Documented as roadmap feature
- Show architecture diagram to demonstrate vision

---

### Feature 5: Creator Analytics Dashboard

**What Makes It Unique:**
- On-chain analytics: track every payment via Stacks API
- Agent vs. Human metrics
- Revenue forecasting based on historical patterns
- Geographic distribution (via IP mapping of payments)

**Why It Wins:**
- Most x402 implementations lack creator-facing analytics
- Shows data-driven creator economy
- Build on Stacks' transparent blockchain

**MVP Implementation:**
- Simple Next.js dashboard
- Shows: Total revenue, payment count, top content, agent %, settlement breakdown

---

## 5. TECHNICAL ARCHITECTURE

### System Components:

```
┌─────────────────────────────────────────────────────────────┐
│                    CREATOR'S APPLICATION                    │
│  (Blog, API, Video Platform, etc.)                         │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    PAYSTACK SDK                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ React Comps  │  │   REST API   │  │  CLI Tool    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          x402-stacks Middleware                       │  │
│  │  - HTTP 402 handler                                   │  │
│  │  - Payment verification                               │  │
│  │  - Multi-asset support (sBTC/STX/USDCx)              │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              STACKS BLOCKCHAIN LAYER                        │
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │  Clarity Contracts   │  │   x402 Facilitator   │       │
│  │  - Revenue splits    │  │   - Payment routing  │       │
│  │  - Access control    │  │   - Verification     │       │
│  │  - Royalties         │  │   - Settlement       │       │
│  └──────────────────────┘  └──────────────────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         sBTC / STX / USDCx Token Contracts           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  BITCOIN MAINCHAIN                          │
│  - Final settlement security                                │
│  - sBTC peg                                                 │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack:

**Frontend SDK:**
- React components (Next.js 14+)
- TypeScript
- TailwindCSS for styling
- Stacks.js for wallet integration

**Backend SDK:**
- Node.js / Express middleware
- Python / FastAPI option (optional)
- x402-stacks protocol implementation
- Stacks API client

**Smart Contracts:**
- Clarity language
- Clarinet for testing
- Templates: revenue-split, royalty-cascade, access-control

**Infrastructure:**
- Stacks testnet/mainnet
- Hiro API for blockchain queries
- Optional: Self-hosted Stacks node

---

## 6. MVP SCOPE (Week 1 Hackathon)

### MUST HAVE (Core MVP):

1. **SDK Core**
   - ✅ Express.js middleware for x402-stacks
   - ✅ React `<PaywallButton />` component
   - ✅ Support for STX and USDCx (sBTC optional)
   - ✅ HTTP 402 response generation
   - ✅ Payment verification logic

2. **Clarity Smart Contract**
   - ✅ Single revenue-split contract template
   - ✅ Supports 2-way splits (creator + platform)
   - ✅ Deployed on Stacks testnet

3. **Demo Application**
   - ✅ Simple blog with 3 articles
   - ✅ 1 article free, 2 articles paywalled ($0.10 STX each)
   - ✅ Shows payment flow end-to-end
   - ✅ Basic analytics (payment count, revenue)

4. **Documentation**
   - ✅ README with 5-minute quickstart
   - ✅ API reference
   - ✅ Clarity contract docs
   - ✅ Deployment guide (testnet)

5. **Video Demo (5 min)**
   - ✅ Problem statement
   - ✅ Live demo of payment flow
   - ✅ Code walkthrough
   - ✅ Unique differentiators explanation
   - ✅ Roadmap tease

### NICE TO HAVE (If Time Permits):

- sBTC support (in addition to STX/USDCx)
- AI agent example (mock agent paying for content)
- Analytics dashboard UI
- Python SDK variant

### OUT OF SCOPE (Post-MVP):

- Zero-knowledge access control
- Mainnet deployment
- Advanced royalty mechanisms
- Browser extension
- Mobile SDKs

---

## 7. USER FLOWS

### Flow 1: Creator Setup (5 Minutes)

```bash
# Step 1: Install SDK
npm install @x402pay/sdk

# Step 2: Initialize in code
import { x402payMiddleware } from '@x402pay/sdk';

app.use(x402payMiddleware({
  contentMap: {
    '/api/premium-data': {
      price: '0.10',
      asset: 'USDCx',
      description: 'Premium market data'
    }
  },
  revenueContract: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.revenue-split'
}));

# Step 3: Deploy revenue contract (optional)
npx x402pay deploy-contract --splits creator:80,platform:20

# Done! Endpoints are now monetized
```

### Flow 2: Human User Payment

1. User visits paywalled article
2. Sees price: "$0.25 in STX"
3. Clicks "Pay to Read"
4. Hiro Wallet pops up
5. Confirms payment
6. Article unlocks instantly
7. Creator's Clarity contract splits revenue automatically

### Flow 3: AI Agent Payment

1. Agent discovers content via discovery API
2. Checks budget constraints
3. Sends HTTP request to `/api/premium-data`
4. Receives 402 Payment Required
5. Parses payment instructions
6. Signs transaction programmatically
7. Re-sends request with payment proof
8. Receives data
9. NFT badge issued to agent (reputation++)

---

## 8. SUCCESS METRICS

### Hackathon Win Criteria (Short-term):

- ✅ **Functional MVP**: End-to-end payment works on testnet
- ✅ **Clear Demo**: 5-min video shows problem → solution → value
- ✅ **Code Quality**: Clean, documented, production-ready structure
- ✅ **Unique Value**: Judges understand Bitcoin-native + Clarity differentiation
- ✅ **Ecosystem Fit**: Clearly advances x402-stacks adoption

### Post-Hackathon Success (6 Months):

- **Adoption**: 50+ creators integrate SDK
- **Volume**: $10K+ in creator revenue via x402Pay
- **Agent Payments**: 20%+ of transactions from AI agents
- **Open Source**: 100+ GitHub stars, 10+ contributors
- **Stacks Ecosystem**: Featured in Stacks newsletter, conference talks

---

## 9. COMPETITIVE ANALYSIS

| Feature | x402Pay (Us) | Coinbase x402 | Unlock Protocol | Substack |
|---------|---------------|---------------|-----------------|----------|
| **Bitcoin Settlement** | ✅ sBTC | ❌ | ❌ | ❌ |
| **Smart Contract Revenue** | ✅ Clarity | ❌ | ⚠️ Ethereum | ❌ |
| **AI Agent Support** | ✅ Native | ⚠️ Possible | ❌ | ❌ |
| **Multi-Asset** | ✅ sBTC/STX/USDCx | ⚠️ USDC only | ⚠️ ETH only | ❌ Fiat only |
| **Creator Ownership** | ✅ Via contracts | ❌ | ⚠️ Partial | ❌ |
| **Micropayments** | ✅ < $0.01 | ✅ | ⚠️ Expensive | ❌ |
| **Setup Time** | 5 minutes | 10 minutes | 30 minutes | Hours |
| **Platform Risk** | None | Low | Low | High |

**Key Differentiators:**
1. **Only Bitcoin-native** content monetization solution
2. **Only x402 SDK with smart contract revenue** management
3. **Built for AI agents** from day 1
4. **Stacks-specific features** (stacking integration, Clarity decidability)

---

## 10. TECHNICAL IMPLEMENTATION DETAILS

### x402-Stacks Integration:

```typescript
// Core payment handler
export async function handlePayment(req: Request, res: Response) {
  const { contentId } = req.params;
  const paymentProof = req.headers['x-payment-proof'];
  
  if (!paymentProof) {
    // Return 402 with payment instructions
    return res.status(402).json({
      error: 'Payment Required',
      payment: {
        recipient: CONTRACT_ADDRESS,
        amount: CONTENT_PRICES[contentId],
        asset: 'STX',
        chain: 'stacks',
        contract: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.revenue-split',
        nonce: generateNonce(),
        signature_required: true
      },
      access_after: 'instant'
    });
  }
  
  // Verify payment on Stacks
  const isValid = await verifyStacksPayment(paymentProof);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid payment' });
  }
  
  // Grant access
  return res.json({ content: getContent(contentId) });
}
```

### Clarity Revenue Contract:

```clarity
;; Revenue Split Contract
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-PAYMENT (err u101))

(define-data-var creator-address principal tx-sender)
(define-data-var platform-address principal 'SP000000000000000000002Q6VF78)
(define-data-var creator-share uint u80) ;; 80%
(define-data-var platform-share uint u20) ;; 20%

(define-map content-prices (string-ascii 50) uint)

;; Public function to process payment and split revenue
(define-public (pay-for-content 
    (content-id (string-ascii 50)) 
    (payment-amount uint))
  (let (
    (expected-price (default-to u0 (map-get? content-prices content-id)))
    (creator-amount (/ (* payment-amount (var-get creator-share)) u100))
    (platform-amount (/ (* payment-amount (var-get platform-share)) u100))
  )
    ;; Verify payment amount
    (asserts! (>= payment-amount expected-price) ERR-INSUFFICIENT-PAYMENT)
    
    ;; Transfer to creator
    (try! (stx-transfer? creator-amount tx-sender (var-get creator-address)))
    
    ;; Transfer to platform
    (try! (stx-transfer? platform-amount tx-sender (var-get platform-address)))
    
    ;; Log payment event
    (print {
      event: "payment-processed",
      content-id: content-id,
      amount: payment-amount,
      payer: tx-sender
    })
    
    (ok true)
  )
)

;; Set content price (creator only)
(define-public (set-content-price 
    (content-id (string-ascii 50)) 
    (price uint))
  (begin
    (asserts! (is-eq tx-sender (var-get creator-address)) ERR-NOT-AUTHORIZED)
    (ok (map-set content-prices content-id price))
  )
)

;; Read-only: Get content price
(define-read-only (get-content-price (content-id (string-ascii 50)))
  (ok (default-to u0 (map-get? content-prices content-id)))
)
```

### React Component:

```tsx
import { useState } from 'react';
import { useConnect } from '@stacks/connect-react';
import { StacksTestnet } from '@stacks/network';
import { 
  makeContractCall, 
  bufferCVFromString, 
  uintCV 
} from '@stacks/transactions';

export function PaywallButton({ contentId, price, asset = 'STX' }) {
  const { doContractCall } = useConnect();
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      await doContractCall({
        network: new StacksTestnet(),
        contractAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
        contractName: 'revenue-split',
        functionName: 'pay-for-content',
        functionArgs: [
          bufferCVFromString(contentId),
          uintCV(price * 1000000) // Convert to micro-STX
        ],
        onFinish: (data) => {
          console.log('Payment successful:', data);
          setUnlocked(true);
        },
        onCancel: () => {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Payment failed:', error);
      setLoading(false);
    }
  };

  if (unlocked) {
    return <div className="text-green-600">✓ Content Unlocked</div>;
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
    >
      {loading ? 'Processing...' : `Pay ${price} ${asset} to Read`}
    </button>
  );
}
```

---

## 11. DEMO APPLICATION SPEC

### "BitBlog" - Demo Blog Platform

**Purpose:** Showcase x402Pay SDK in action with real content monetization

**Features:**
1. **Homepage**
   - Shows 5 articles
   - 2 free articles (preview + full access)
   - 3 paywalled articles (preview only)
   - Pricing displayed: "$0.10 STX per article"

2. **Article Page**
   - Free: Full content visible
   - Paywalled: 
     - First 2 paragraphs visible
     - Blur effect on rest of content
     - `<PaywallButton />` component
     - "Unlock with STX" CTA

3. **Creator Dashboard**
   - Total revenue earned
   - Number of payments
   - Top performing articles
   - Agent vs. human payments (simulated)
   - Revenue by asset (STX vs USDCx)

4. **Tech Stack:**
   - Next.js 14 (App Router)
   - TailwindCSS
   - Stacks.js for wallet
   - x402Pay SDK integrated
   - Deployed on Vercel

---

## 12. GO-TO-MARKET (POST-HACKATHON)

### Phase 1: Launch (Week 1-4)
- Publish SDK to npm
- Deploy docs site
- Write launch blog post
- Share on:
  - Stacks Forum
  - Bitcoin Twitter
  - Hacker News
  - r/bitcoin, r/stacks

### Phase 2: Creator Outreach (Month 2-3)
- Reach out to Substack writers
- Contact Bitcoin educators
- Pitch to API developers
- Host workshops on Stacks Discord

### Phase 3: Agent Economy (Month 4-6)
- Partner with AI agent frameworks
- Build MCP (Model Context Protocol) integration
- Demo at AI conferences
- Position as "payments layer for agents"

---

## 13. RISKS & MITIGATIONS

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| x402-stacks adoption too slow | High | Medium | Focus on Bitcoin narrative, creator pain points |
| Complexity scares creators | Medium | Medium | Extreme simplification, templates, video tutorials |
| Stacks testnet issues | High | Low | Have local Clarinet fallback, thorough testing |
| Competition from Base/Solana | Medium | High | Double down on Bitcoin-native, Clarity features |
| Wallet friction (Hiro setup) | Medium | Medium | Embedded wallet option in roadmap |
| Smart contract bugs | High | Low | Extensive Clarinet testing, security audit plan |

---

## 14. OPEN SOURCE STRATEGY

**License:** MIT  
**Repository Structure:**
```
x402pay-sdk/
├── packages/
│   ├── core/           # x402 logic
│   ├── react/          # React components
│   ├── express/        # Express middleware
│   ├── contracts/      # Clarity templates
├── examples/
│   ├── blog/           # BitBlog demo
│   ├── api/            # API monetization example
│   ├── ai-agent/       # Agent payment example
├── docs/               # Documentation site
└── scripts/            # CLI tools
```

**Contributing:**
- Welcome community PRs
- Clear contribution guidelines
- Good first issues labeled
- Monthly community calls

---

## 15. SUCCESS STORY (VISION)

**6 Months After Launch:**

*"Sarah, a Bitcoin educator, used to earn $2,000/month on Substack after their 10% fee. She switched to x402Pay and now:*

- *Earns $2,400/month (no platform fee)*
- *Accepts sBTC directly from her global audience*
- *20% of her revenue comes from AI agents that autonomously pay to analyze her Bitcoin research*
- *Her revenue split contract automatically sends 5% to her research assistant*
- *She stakes her STX earnings and earns an additional $200/month in stacking rewards*
- *Total monthly income: $2,600 - a 30% increase*

*Most importantly, Sarah owns her revenue stream. No platform can deplatform her. Her Clarity contract is immutable and secured by Bitcoin."*

---

## 16. DELIVERABLES CHECKLIST

### Code:
- [ ] `@x402pay/core` package
- [ ] `@x402pay/react` package
- [ ] `@x402pay/express` package
- [ ] Clarity revenue-split contract
- [ ] BitBlog demo application
- [ ] Unit tests (80%+ coverage)

### Documentation:
- [ ] README.md (5-min quickstart)
- [ ] API reference
- [ ] Clarity contract docs
- [ ] Architecture diagrams
- [ ] Video tutorial (5 min)

### Demo:
- [ ] Deployed demo at `bitblog.vercel.app`
- [ ] Working payment flow
- [ ] Creator dashboard
- [ ] Screen recording for submission

### Submission:
- [ ] GitHub repo (public, MIT license)
- [ ] Video (<5 min, uploaded to YouTube)
- [ ] README with:
  - [ ] Problem statement
  - [ ] Solution overview
  - [ ] x402-stacks integration
  - [ ] Demo link
  - [ ] Setup instructions

---

## 17. WHY THIS WINS (10/10 JUSTIFICATION)

### Innovation:
1. **First** Bitcoin-native content monetization SDK
2. **First** x402 implementation with smart contract revenue management
3. **First** to combine Clarity + x402 for creator economy

### Impact:
1. Solves real creator pain (platform fees, deplatforming)
2. Brings content creators to Stacks ecosystem
3. Showcases sBTC utility beyond DeFi
4. Enables AI agent economy

### Technical Excellence:
1. Production-ready code quality
2. Leverages Clarity's unique features (decidability, safety)
3. Clean architecture, extensible
4. Comprehensive documentation

### Ecosystem Alignment:
1. Directly advances x402-stacks adoption
2. Demonstrates Stacks advantages vs. other L2s
3. Creates template for future builders
4. Aligns with Stacks' Bitcoin vision

### Execution:
1. Realistic for 1-week hackathon
2. Clear MVP scope
3. Working demo
4. Professional presentation

---

## 18. TEAM & TIMELINE

### Recommended Team (Solo or 2-3 people):

**Role 1: Full-Stack Developer**
- SDK implementation (core, React, Express)
- Demo application (BitBlog)
- Testing, deployment

**Role 2: Clarity Developer (optional)**
- Smart contract development
- Clarinet testing
- Contract deployment

**Role 3: Designer/Video (optional)**
- UI/UX for demo
- Documentation
- Video production

### Timeline (7 Days):

**Day 1-2: Foundation**
- Set up repo structure
- Implement x402 core logic
- Deploy basic Clarity contract
- Build Express middleware

**Day 3-4: SDK Components**
- React components
- Payment verification
- Wallet integration
- Basic testing

**Day 5-6: Demo Application**
- Build BitBlog
- Add 5 sample articles
- Implement paywall
- Creator dashboard
- Deploy to Vercel

**Day 7: Polish & Submission**
- Documentation
- Video recording
- Final testing
- Submit to hackathon

---

## 19. APPENDIX

### Helpful Resources:

**x402-stacks:**
- Docs: https://docs.x402stacks.xyz/
- Examples: https://github.com/xpaysh/awesome-x402

**Stacks:**
- Clarity docs: https://docs.stacks.co/clarity
- Clarinet: https://github.com/hirosystems/clarinet
- Hiro Wallet: https://www.hiro.so/wallet

**Similar Projects (Learn From):**
- Unlock Protocol (Ethereum paywall)
- Coinbase x402 SDK (Base implementation)
- Lightning paywalls (L402 protocol)

### Sample Pitch (30 seconds):

*"Creators lose 30% to platforms and risk deplatforming. x402Pay is the first Bitcoin-native SDK that lets creators monetize ANY content with 5 lines of code. Accept sBTC, set revenue splits via Clarity smart contracts, and tap into the AI agent economy. We're bringing content creators to Bitcoin—and proving x402-stacks can power the future of micropayments."*

---

**Document Version:** 1.0  
**Last Updated:** February 9, 2026  
**Status:** Ready for Implementation  
**Confidence Level:** 10/10 - This wins. 🚀🏆
# x402Pay System Design & Architecture (Part 2)
## Continued from Part 1

---

## 8. SDK ARCHITECTURE (CONTINUED)

### 8.2 Express Middleware (Continued)

```typescript
// ═══════════════════════════════════════════════════════════
//  @x402pay/express - Express Middleware (CONTINUED)
// ═══════════════════════════════════════════════════════════

export function x402payMiddleware(config: x402PayMiddlewareConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Determine content ID
    const contentId = config.getContentId 
      ? config.getContentId(req)
      : req.params.contentId || req.path;
    
    // 2. Check if route requires payment
    const contentConfig = config.contentMap[contentId];
    if (!contentConfig) {
      return next(); // No payment required
    }
    
    // 3. Check for payment proof
    const paymentProof = 
      req.headers['x-payment-proof'] ||
      req.query.payment ||
      req.cookies.payment;
    
    if (!paymentProof) {
      // No payment - return 402
      const response402 = await config.client.generate402Response(
        contentId,
        contentConfig
      );
      
      return res
        .status(response402.statusCode)
        .set(response402.headers)
        .json(response402.body);
    }
    
    // 4. Verify payment proof
    try {
      let verification;
      
      // Check if it's a transaction ID or JWT token
      if (paymentProof.startsWith('0x')) {
        // Transaction ID - verify on-chain
        verification = await config.client.verifyPayment(
          paymentProof,
          contentId,
          req.headers['x-payment-nonce'] as string
        );
      } else {
        // JWT token - verify signature
        verification = await config.client.verifyAccessToken(paymentProof);
      }
      
      if (!verification.valid) {
        return res.status(401).json({
          error: 'Invalid payment proof',
          details: verification.error
        });
      }
      
      // 5. Store payment info in request
      req.x402pay = {
        verified: true,
        payment: verification.transaction,
        userId: verification.transaction.sender
      };
      
      // 6. Call user callback
      if (config.onPaymentVerified) {
        await config.onPaymentVerified(verification);
      }
      
      // 7. Continue to route handler
      next();
      
    } catch (error) {
      console.error('Payment verification error:', error);
      return res.status(500).json({
        error: 'Payment verification failed',
        details: error.message
      });
    }
  };
}

// ───────────────────────────────────────────────────────────
// Usage Example
// ───────────────────────────────────────────────────────────

import express from 'express';
import { x402PayClient } from '@x402pay/core';
import { x402payMiddleware } from '@x402pay/express';

const app = express();

// Initialize x402Pay client
const x402pay = new x402PayClient({
  network: 'testnet',
  apiKey: process.env.PAYSTACK_API_KEY,
  contractAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.revenue-split',
  jwtSecret: process.env.JWT_SECRET,
  redis: redisClient
});

// Apply middleware
app.use(x402payMiddleware({
  client: x402pay,
  contentMap: {
    '/api/premium-data': {
      price: '0.10',
      asset: 'STX',
      description: 'Premium market data'
    },
    '/articles/:id': {
      price: '0.05',
      asset: 'USDCx',
      description: 'Premium article access'
    }
  },
  getContentId: (req) => {
    // Custom content ID extraction
    if (req.path.startsWith('/articles/')) {
      return `article-${req.params.id}`;
    }
    return req.path;
  },
  onPaymentVerified: async (payment) => {
    // Custom analytics or logging
    console.log('Payment verified:', payment);
    await analytics.track('payment.verified', payment);
  }
}));

// Protected route
app.get('/api/premium-data', (req, res) => {
  // Only reachable after payment verification
  res.json({
    data: getPremiumData(),
    user: req.x402pay.userId
  });
});
```

### 8.3 React Component Library

```typescript
// ═══════════════════════════════════════════════════════════
//  @x402pay/react - React Components
// ═══════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { useConnect } from '@stacks/connect-react';
import { StacksNetwork } from '@stacks/network';
import { makeContractCall } from '@stacks/transactions';

// ───────────────────────────────────────────────────────────
// PaywallButton Component
// ───────────────────────────────────────────────────────────

export interface PaywallButtonProps {
  contentId: string;
  price: number;
  asset?: 'STX' | 'sBTC' | 'USDCx';
  contractAddress: string;
  onSuccess?: (txId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  network?: 'mainnet' | 'testnet';
}

export const PaywallButton: React.FC<PaywallButtonProps> = ({
  contentId,
  price,
  asset = 'STX',
  contractAddress,
  onSuccess,
  onError,
  className,
  network = 'testnet'
}) => {
  const { doContractCall } = useConnect();
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  
  // Check if already unlocked (from localStorage)
  React.useEffect(() => {
    const accessToken = localStorage.getItem(`x402pay_access_${contentId}`);
    if (accessToken) {
      // Verify token is still valid
      verifyAccessToken(accessToken).then(valid => {
        if (valid) setUnlocked(true);
      });
    }
  }, [contentId]);
  
  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const [contractAddr, contractName] = contractAddress.split('.');
      
      await doContractCall({
        network: network === 'mainnet' 
          ? new StacksMainnet() 
          : new StacksTestnet(),
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'pay-for-content',
        functionArgs: [
          stringAsciiCV(contentId),
          uintCV(convertToMicroUnits(price, asset)),
          stringAsciiCV(asset)
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: async (data) => {
          console.log('Transaction submitted:', data.txId);
          
          // Wait for confirmation
          const verified = await waitForConfirmation(data.txId);
          
          if (verified) {
            // Store access token
            const accessToken = await fetchAccessToken(data.txId, contentId);
            localStorage.setItem(`x402pay_access_${contentId}`, accessToken);
            
            setUnlocked(true);
            setLoading(false);
            
            if (onSuccess) {
              onSuccess(data.txId);
            }
          } else {
            throw new Error('Transaction failed');
          }
        },
        onCancel: () => {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
      
      if (onError) {
        onError(error as Error);
      }
    }
  };
  
  if (unlocked) {
    return (
      <div className={`x402pay-unlocked ${className || ''}`}>
        ✓ Content Unlocked
      </div>
    );
  }
  
  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`x402pay-button ${className || ''}`}
    >
      {loading ? 'Processing...' : `Pay ${price} ${asset} to Unlock`}
    </button>
  );
};

// ───────────────────────────────────────────────────────────
// x402PayProvider Component
// ───────────────────────────────────────────────────────────

export interface x402PayConfig {
  network: 'mainnet' | 'testnet';
  apiUrl?: string;
  contractAddress: string;
}

const x402PayContext = React.createContext<x402PayConfig | null>(null);

export const x402PayProvider: React.FC<{
  config: x402PayConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  return (
    <x402PayContext.Provider value={config}>
      {children}
    </x402PayContext.Provider>
  );
};

export const usex402Pay = () => {
  const context = React.useContext(x402PayContext);
  if (!context) {
    throw new Error('usex402Pay must be used within x402PayProvider');
  }
  return context;
};

// ───────────────────────────────────────────────────────────
// usePayment Hook
// ───────────────────────────────────────────────────────────

export const usePayment = (contentId: string) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const config = usex402Pay();
  
  React.useEffect(() => {
    checkAccess();
  }, [contentId]);
  
  const checkAccess = async () => {
    setLoading(true);
    
    // Check localStorage
    const accessToken = localStorage.getItem(`x402pay_access_${contentId}`);
    
    if (accessToken) {
      // Verify token
      const valid = await verifyAccessToken(accessToken);
      setHasAccess(valid);
    } else {
      setHasAccess(false);
    }
    
    setLoading(false);
  };
  
  const initiatePayment = async (price: number, asset: string) => {
    // Implementation
  };
  
  return {
    hasAccess,
    loading,
    initiatePayment,
    checkAccess
  };
};
```

---

## 9. INFRASTRUCTURE & DEVOPS

### 9.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   PRODUCTION DEPLOYMENT                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CLOUDFLARE (CDN + DDoS)                 │  │
│  │  - Global CDN                                         │  │
│  │  - DDoS protection                                    │  │
│  │  - SSL/TLS termination                               │  │
│  │  - Web Application Firewall (WAF)                    │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│       ┌─────────────┴─────────────┐                         │
│       │                           │                         │
│  ┌────▼─────────┐        ┌────────▼──────┐                 │
│  │   VERCEL     │        │   RAILWAY     │                 │
│  │  (Frontend)  │        │   (Backend)   │                 │
│  │              │        │               │                 │
│  │ - Next.js    │        │ - Node.js API │                 │
│  │ - Static Gen │        │ - Python API  │                 │
│  │ - Edge Fns   │        │ - Workers     │                 │
│  └──────────────┘        └────────┬──────┘                 │
│                                   │                         │
│                          ┌────────▼────────┐                │
│                          │  DATABASES      │                │
│                          │  (Railway)      │                │
│                          │                 │                │
│                          │ - PostgreSQL    │                │
│                          │ - Redis         │                │
│                          │ - TimescaleDB   │                │
│                          └─────────────────┘                │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           EXTERNAL SERVICES                           │  │
│  │                                                       │  │
│  │  - Hiro API (Stacks blockchain)                      │  │
│  │  - IPFS/Pinata (metadata storage)                    │  │
│  │  - Sentry (error tracking)                           │  │
│  │  - PostHog (analytics)                               │  │
│  │  - SendGrid (emails)                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Docker Configuration

```dockerfile
# ═══════════════════════════════════════════════════════════
#  DOCKERFILE - Payment Service
# ═══════════════════════════════════════════════════════════

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# ───────────────────────────────────────────────────────────
# Production stage
# ───────────────────────────────────────────────────────────

FROM node:18-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 3000

CMD ["node", "dist/app.js"]
```

```yaml
# ═══════════════════════════════════════════════════════════
#  DOCKER-COMPOSE - Local Development
# ═══════════════════════════════════════════════════════════

version: '3.8'

services:
  # ─────────────────────────────────────────────────────────
  # Frontend (Next.js)
  # ─────────────────────────────────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:4000
      - NEXT_PUBLIC_STACKS_NETWORK=testnet
    depends_on:
      - payment-service
      - analytics-service

  # ─────────────────────────────────────────────────────────
  # Payment Service (Node.js)
  # ─────────────────────────────────────────────────────────
  payment-service:
    build:
      context: ./services/payment
      dockerfile: Dockerfile
    ports:
      - "4000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/x402pay
      - REDIS_URL=redis://redis:6379
      - STACKS_API_URL=https://api.testnet.hiro.so
      - JWT_SECRET=dev-secret-change-in-production
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - rabbitmq
    volumes:
      - ./services/payment:/app
      - /app/node_modules

  # ─────────────────────────────────────────────────────────
  # Analytics Service (Python)
  # ─────────────────────────────────────────────────────────
  analytics-service:
    build:
      context: ./services/analytics
      dockerfile: Dockerfile
    ports:
      - "4001:8000"
    environment:
      - PYTHONUNBUFFERED=1
      - DATABASE_URL=postgresql://postgres:password@timescaledb:5432/analytics
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - timescaledb
      - redis
      - rabbitmq
    volumes:
      - ./services/analytics:/app

  # ─────────────────────────────────────────────────────────
  # PostgreSQL (Primary Database)
  # ─────────────────────────────────────────────────────────
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=x402pay
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql

  # ─────────────────────────────────────────────────────────
  # TimescaleDB (Time-series Analytics)
  # ─────────────────────────────────────────────────────────
  timescaledb:
    image: timescale/timescaledb:latest-pg15
    ports:
      - "5433:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=analytics
    volumes:
      - timescale_data:/var/lib/postgresql/data

  # ─────────────────────────────────────────────────────────
  # Redis (Cache & Session Store)
  # ─────────────────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # ─────────────────────────────────────────────────────────
  # RabbitMQ (Message Queue)
  # ─────────────────────────────────────────────────────────
  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"    # AMQP
      - "15672:15672"  # Management UI
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=password
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

volumes:
  postgres_data:
  timescale_data:
  redis_data:
  rabbitmq_data:
```

### 9.3 Kubernetes Deployment (Production)

```yaml
# ═══════════════════════════════════════════════════════════
#  KUBERNETES - Payment Service Deployment
# ═══════════════════════════════════════════════════════════

apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
  namespace: x402pay-prod
  labels:
    app: payment-service
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payment-service
  template:
    metadata:
      labels:
        app: payment-service
        version: v1
    spec:
      containers:
      - name: payment-service
        image: registry.x402pay.xyz/payment-service:latest
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: x402pay-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: x402pay-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: x402pay-secrets
              key: jwt-secret
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: payment-service
  namespace: x402pay-prod
spec:
  selector:
    app: payment-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: payment-service-hpa
  namespace: x402pay-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: payment-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 9.4 CI/CD Pipeline

```yaml
# ═══════════════════════════════════════════════════════════
#  GITHUB ACTIONS - CI/CD Pipeline
# ═══════════════════════════════════════════════════════════

name: x402Pay CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ─────────────────────────────────────────────────────────
  # Test & Build
  # ─────────────────────────────────────────────────────────
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  # ─────────────────────────────────────────────────────────
  # Build & Push Docker Images
  # ─────────────────────────────────────────────────────────
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Container Registry
        uses: docker/login-action@v2
        with:
          registry: registry.x402pay.xyz
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}
      
      - name: Build and push Payment Service
        uses: docker/build-push-action@v4
        with:
          context: ./services/payment
          push: true
          tags: |
            registry.x402pay.xyz/payment-service:latest
            registry.x402pay.xyz/payment-service:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ─────────────────────────────────────────────────────────
  # Deploy to Staging
  # ─────────────────────────────────────────────────────────
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.x402pay.xyz
    steps:
      - name: Deploy to Railway (Staging)
        run: |
          curl -X POST ${{ secrets.RAILWAY_WEBHOOK_STAGING }}

  # ─────────────────────────────────────────────────────────
  # Deploy to Production
  # ─────────────────────────────────────────────────────────
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://x402pay.xyz
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/payment-service \
            payment-service=registry.x402pay.xyz/payment-service:${{ github.sha }} \
            --namespace=x402pay-prod
          
          kubectl rollout status deployment/payment-service \
            --namespace=x402pay-prod
        env:
          KUBECONFIG: ${{ secrets.KUBECONFIG }}
      
      - name: Deploy Frontend to Vercel
        run: |
          curl -X POST ${{ secrets.VERCEL_DEPLOY_HOOK }}
```

---

## 10. SECURITY ARCHITECTURE

### 10.1 Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. USER AUTHENTICATION (Wallet-based)                      │
│                                                             │
│     ┌──────────┐                                            │
│     │  User    │                                            │
│     └────┬─────┘                                            │
│          │                                                  │
│          │ 1. Click "Connect Wallet"                        │
│          ▼                                                  │
│     ┌──────────────┐                                        │
│     │  Frontend    │                                        │
│     └────┬─────────┘                                        │
│          │                                                  │
│          │ 2. Request signature                             │
│          ▼                                                  │
│     ┌──────────────┐                                        │
│     │ Hiro Wallet  │                                        │
│     └────┬─────────┘                                        │
│          │                                                  │
│          │ 3. Sign message:                                 │
│          │    "x402Pay Login\nTimestamp: 1675..."          │
│          ▼                                                  │
│     ┌──────────────┐                                        │
│     │  Frontend    │                                        │
│     └────┬─────────┘                                        │
│          │                                                  │
│          │ 4. POST /api/auth/login                          │
│          │    { address, signature, message, timestamp }    │
│          ▼                                                  │
│     ┌──────────────┐                                        │
│     │  Backend     │                                        │
│     │  (Auth API)  │                                        │
│     └────┬─────────┘                                        │
│          │                                                  │
│          │ 5. Verify signature                              │
│          │    - Recover address from signature              │
│          │    - Check timestamp (< 5 min old)               │
│          │    - Verify address matches                      │
│          │                                                  │
│          │ 6. Generate JWT                                  │
│          │    Payload: { userId, address, exp }             │
│          │    Sign with private key                         │
│          │                                                  │
│          │ 7. Store session in Redis                        │
│          │    Key: session:{userId}                         │
│          │    Value: { address, loginAt, ... }              │
│          │    TTL: 7 days                                   │
│          │                                                  │
│          │ 8. Return JWT                                    │
│          ▼                                                  │
│     ┌──────────────┐                                        │
│     │  Frontend    │                                        │
│     └────┬─────────┘                                        │
│          │                                                  │
│          │ 9. Store JWT in httpOnly cookie                  │
│          │    + localStorage (for quick checks)             │
│          │                                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  AUTHORIZATION FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. API REQUEST AUTHORIZATION                                │
│                                                             │
│     ┌──────────┐                                            │
│     │  Client  │                                            │
│     └────┬─────┘                                            │
│          │                                                  │
│          │ 1. GET /api/v1/content                           │
│          │    Header: Authorization: Bearer {JWT}           │
│          ▼                                                  │
│     ┌──────────────┐                                        │
│     │ API Gateway  │                                        │
│     └────┬─────────┘                                        │
│          │                                                  │
│          │ 2. Extract JWT from header                       │
│          │                                                  │
│          │ 3. Verify JWT signature                          │
│          │    - Check signature validity                    │
│          │    - Check expiration                            │
│          │    - Extract payload                             │
│          │                                                  │
│          │ 4. Check session in Redis                        │
│          │    - Verify session exists                       │
│          │    - Check not revoked                           │
│          │                                                  │
│          │ 5. Attach user to request                        │
│          │    req.user = { userId, address }                │
│          │                                                  │
│          │ 6. Check permissions                             │
│          │    - Resource ownership                          │
│          │    - API key scopes                              │
│          │    - Rate limits                                 │
│          │                                                  │
│          │ 7. Forward to service                            │
│          ▼                                                  │
│     ┌──────────────┐                                        │
│     │  Service     │                                        │
│     └──────────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Security Best Practices

```typescript
// ═══════════════════════════════════════════════════════════
//  SECURITY IMPLEMENTATION
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// 1. Input Validation & Sanitization
// ───────────────────────────────────────────────────────────

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Schema validation
const PaymentRequestSchema = z.object({
  contentId: z.string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9-_]+$/),
  txId: z.string()
    .regex(/^0x[a-fA-F0-9]{64}$/),
  nonce: z.string()
    .length(32)
});

// Sanitize HTML inputs
function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

// ───────────────────────────────────────────────────────────
// 2. Rate Limiting
// ───────────────────────────────────────────────────────────

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const paymentLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:payment:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many payment requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  keyGenerator: (req) => {
    // Rate limit by API key or IP
    return req.headers['x-api-key'] || req.ip;
  }
});

app.use('/api/v1/payments', paymentLimiter);
app.use('/api/v1', apiLimiter);

// ───────────────────────────────────────────────────────────
// 3. SQL Injection Prevention
// ───────────────────────────────────────────────────────────

// ALWAYS use parameterized queries
const getPayment = await db.query(
  'SELECT * FROM payments WHERE tx_id = $1',
  [txId] // ✓ Safe - parameterized
);

// NEVER concatenate user input
// const query = `SELECT * FROM payments WHERE tx_id = '${txId}'`; // ✗ UNSAFE

// ───────────────────────────────────────────────────────────
// 4. XSS Prevention
// ───────────────────────────────────────────────────────────

import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.testnet.hiro.so"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// ───────────────────────────────────────────────────────────
// 5. CSRF Protection
// ───────────────────────────────────────────────────────────

import csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Apply to state-changing endpoints
app.post('/api/v1/content', csrfProtection, createContent);
app.delete('/api/v1/content/:id', csrfProtection, deleteContent);

// ───────────────────────────────────────────────────────────
// 6. Secrets Management
// ───────────────────────────────────────────────────────────

// Use environment variables
const config = {
  jwtSecret: process.env.JWT_SECRET,
  dbPassword: process.env.DB_PASSWORD,
  apiKey: process.env.STACKS_API_KEY
};

// Validate required secrets on startup
const requiredEnvVars = [
  'JWT_SECRET',
  'DB_PASSWORD',
  'STACKS_API_KEY'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Rotate secrets regularly (implementation with HashiCorp Vault)
async function rotateJwtSecret() {
  const newSecret = crypto.randomBytes(64).toString('hex');
  
  // Store in Vault
  await vault.write('secret/x402pay/jwt', {
    value: newSecret,
    rotatedAt: new Date().toISOString()
  });
  
  // Graceful rotation (support both old and new for 24h)
  config.jwtSecret = newSecret;
}

// ───────────────────────────────────────────────────────────
// 7. Audit Logging
// ───────────────────────────────────────────────────────────

interface AuditLog {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  result: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  metadata?: any;
}

async function logAudit(log: AuditLog) {
  await db.auditLogs.insert({
    ...log,
    timestamp: new Date()
  });
  
  // Also send to SIEM (Security Information and Event Management)
  await siem.send({
    type: 'audit',
    severity: log.result === 'failure' ? 'warning' : 'info',
    data: log
  });
}

// Log all authentication attempts
app.post('/api/auth/login', async (req, res) => {
  try {
    const { address, signature } = req.body;
    
    const valid = verifySignature(address, signature);
    
    await logAudit({
      userId: address,
      action: 'login',
      resource: 'auth',
      result: valid ? 'success' : 'failure',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    if (!valid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Continue with login...
  } catch (error) {
    // Log error
  }
});
```

### 10.3 Smart Contract Security

```clarity
;; ═══════════════════════════════════════════════════════════
;;  SMART CONTRACT SECURITY PATTERNS
;; ═══════════════════════════════════════════════════════════

;; ───────────────────────────────────────────────────────────
;; 1. Access Control
;; ───────────────────────────────────────────────────────────

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))

;; Modifier-style access control
(define-private (is-contract-owner)
  (is-eq tx-sender CONTRACT-OWNER)
)

(define-public (admin-function)
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    ;; Admin logic here
    (ok true)
  )
)

;; ───────────────────────────────────────────────────────────
;; 2. Reentrancy Protection
;; ───────────────────────────────────────────────────────────

(define-data-var locked bool false)

(define-private (acquire-lock)
  (begin
    (asserts! (not (var-get locked)) (err u200))
    (var-set locked true)
    (ok true)
  )
)

(define-private (release-lock)
  (var-set locked false)
)

(define-public (protected-function)
  (begin
    (try! (acquire-lock))
    ;; Critical section
    (let ((result (do-something)))
      (release-lock)
      (ok result)
    )
  )
)

;; ───────────────────────────────────────────────────────────
;; 3. Integer Overflow Protection
;; ───────────────────────────────────────────────────────────

(define-constant MAX-UINT u340282366920938463463374607431768211455)

(define-private (safe-add (a uint) (b uint))
  (let ((result (+ a b)))
    (asserts! (<= result MAX-UINT) (err u300))
    (asserts! (>= result a) (err u300)) ;; Overflow check
    (ok result)
  )
)

(define-private (safe-mul (a uint) (b uint))
  (if (is-eq a u0)
    (ok u0)
    (let ((result (* a b)))
      (asserts! (is-eq (/ result a) b) (err u301)) ;; Overflow check
      (ok result)
    )
  )
)

;; ───────────────────────────────────────────────────────────
;; 4. Input Validation
;; ───────────────────────────────────────────────────────────

(define-constant ERR-INVALID-AMOUNT (err u400))
(define-constant ERR-INVALID-ADDRESS (err u401))

(define-public (validate-payment (amount uint) (recipient principal))
  (begin
    ;; Validate amount
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (<= amount u1000000000000) ERR-INVALID-AMOUNT)
    
    ;; Validate recipient
    (asserts! (not (is-eq recipient tx-sender)) ERR-INVALID-ADDRESS)
    
    (ok true)
  )
)

;; ───────────────────────────────────────────────────────────
;; 5. Pausability (Circuit Breaker)
;; ───────────────────────────────────────────────────────────

(define-data-var contract-paused bool false)
(define-constant ERR-CONTRACT-PAUSED (err u500))

(define-public (pause-contract)
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (var-set contract-paused true)
    (ok true)
  )
)

(define-public (unpause-contract)
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (var-set contract-paused false)
    (ok true)
  )
)

(define-private (check-not-paused)
  (asserts! (not (var-get contract-paused)) ERR-CONTRACT-PAUSED)
  (ok true)
)

;; Use in public functions
(define-public (payment-function)
  (begin
    (try! (check-not-paused))
    ;; Function logic
    (ok true)
  )
)
```

---

## 11. DATABASE DESIGN

### 11.1 PostgreSQL Schema

```sql
-- ═══════════════════════════════════════════════════════════
--  POSTGRESQL SCHEMA - x402Pay
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- Users Table
-- ───────────────────────────────────────────────────────────

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  contract_address VARCHAR(100),
  email VARCHAR(255),
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  
  -- Indexes
  CONSTRAINT wallet_address_valid CHECK (wallet_address ~ '^SP[A-Z0-9]{39}$')
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_contract ON users(contract_address);

-- ───────────────────────────────────────────────────────────
-- Content Table
-- ───────────────────────────────────────────────────────────

CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL, -- 'article', 'video', 'api', 'dataset'
  
  -- Pricing
  price_stx BIGINT, -- in micro-STX
  price_sbtc BIGINT, -- in satoshis
  price_usdcx BIGINT, -- in cents
  default_asset VARCHAR(10) DEFAULT 'STX',
  
  -- Metadata
  metadata JSONB,
  ipfs_cid VARCHAR(100),
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  
  CONSTRAINT valid_content_id CHECK (content_id ~ '^[a-zA-Z0-9-_]+$'),
  CONSTRAINT positive_prices CHECK (
    (price_stx IS NULL OR price_stx > 0) AND
    (price_sbtc IS NULL OR price_sbtc > 0) AND
    (price_usdcx IS NULL OR price_usdcx > 0)
  )
);

CREATE INDEX idx_content_creator ON content(creator_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_published ON content(published_at) WHERE status = 'published';

-- ───────────────────────────────────────────────────────────
-- Payments Table
-- ───────────────────────────────────────────────────────────

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_id VARCHAR(66) UNIQUE NOT NULL,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  payer_address VARCHAR(42) NOT NULL,
  
  -- Payment details
  amount BIGINT NOT NULL,
  asset VARCHAR(10) NOT NULL,
  
  -- Revenue split
  creator_amount BIGINT,
  platform_amount BIGINT,
  collaborator_amount BIGINT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  verified_at TIMESTAMP,
  
  -- Metadata
  is_agent BOOLEAN DEFAULT false,
  user_agent TEXT,
  ip_address INET,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_tx_id CHECK (tx_id ~ '^0x[a-fA-F0-9]{64}$'),
  CONSTRAINT valid_asset CHECK (asset IN ('STX', 'sBTC', 'USDCx'))
);

CREATE INDEX idx_payments_tx ON payments(tx_id);
CREATE INDEX idx_payments_content ON payments(content_id);
CREATE INDEX idx_payments_payer ON payments(payer_address);
CREATE INDEX idx_payments_created ON payments(created_at);
CREATE INDEX idx_payments_agent ON payments(is_agent);

-- ───────────────────────────────────────────────────────────
-- Access Grants Table
-- ───────────────────────────────────────────────────────────

CREATE TABLE access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address VARCHAR(42) NOT NULL,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  
  access_token TEXT NOT NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,
  
  UNIQUE(user_address, content_id)
);

CREATE INDEX idx_access_user_content ON access_grants(user_address, content_id);
CREATE INDEX idx_access_token ON access_grants(access_token);
CREATE INDEX idx_access_expires ON access_grants(expires_at) WHERE revoked_at IS NULL;

-- ───────────────────────────────────────────────────────────
-- API Keys Table
-- ───────────────────────────────────────────────────────────

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash
  key_preview VARCHAR(16) NOT NULL, -- First 8 chars for display
  
  name VARCHAR(100) NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read'],
  
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,
  
  CONSTRAINT valid_scopes CHECK (
    scopes <@ ARRAY['read', 'write', 'admin']::TEXT[]
  )
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(revoked_at) WHERE revoked_at IS NULL;

-- ───────────────────────────────────────────────────────────
-- Audit Logs Table
-- ───────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  resource_id UUID,
  result VARCHAR(20) NOT NULL, -- 'success', 'failure'
  
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_result ON audit_logs(result);

-- ───────────────────────────────────────────────────────────
-- Functions & Triggers
-- ───────────────────────────────────────────────────────────

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Calculate revenue statistics
CREATE OR REPLACE FUNCTION calculate_creator_revenue(creator_uuid UUID)
RETURNS TABLE (
  total_revenue BIGINT,
  payment_count BIGINT,
  agent_revenue BIGINT,
  human_revenue BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(p.amount), 0) AS total_revenue,
    COUNT(*)::BIGINT AS payment_count,
    COALESCE(SUM(CASE WHEN p.is_agent THEN p.amount ELSE 0 END), 0) AS agent_revenue,
    COALESCE(SUM(CASE WHEN NOT p.is_agent THEN p.amount ELSE 0 END), 0) AS human_revenue
  FROM payments p
  JOIN content c ON p.content_id = c.id
  WHERE c.creator_id = creator_uuid
    AND p.status = 'confirmed';
END;
$$ LANGUAGE plpgsql;
```

### 11.2 TimescaleDB Schema (Analytics)

```sql
-- ═══════════════════════════════════════════════════════════
--  TIMESCALEDB SCHEMA - Analytics
-- ═══════════════════════════════════════════════════════════

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ───────────────────────────────────────────────────────────
-- Payment Events (Time-series)
-- ───────────────────────────────────────────────────────────

CREATE TABLE payment_events (
  time TIMESTAMPTZ NOT NULL,
  tx_id VARCHAR(66) NOT NULL,
  content_id VARCHAR(50) NOT NULL,
  creator_id UUID NOT NULL,
  user_id VARCHAR(42) NOT NULL,
  
  amount BIGINT NOT NULL,
  asset VARCHAR(10) NOT NULL,
  
  is_agent BOOLEAN DEFAULT false,
  user_agent TEXT,
  ip_address INET,
  country_code VARCHAR(2),
  
  UNIQUE(time, tx_id)
);

-- Convert to hypertable (time-series partitioning)
SELECT create_hypertable('payment_events', 'time');

-- Create indexes
CREATE INDEX idx_payment_events_content ON payment_events(content_id, time DESC);
CREATE INDEX idx_payment_events_creator ON payment_events(creator_id, time DESC);
CREATE INDEX idx_payment_events_asset ON payment_events(asset, time DESC);

-- ───────────────────────────────────────────────────────────
-- Continuous Aggregates (Materialized Views)
-- ───────────────────────────────────────────────────────────

-- Hourly revenue aggregates
CREATE MATERIALIZED VIEW revenue_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', time) AS hour,
  creator_id,
  asset,
  SUM(amount) AS total_revenue,
  COUNT(*) AS payment_count,
  SUM(CASE WHEN is_agent THEN 1 ELSE 0 END) AS agent_count,
  SUM(CASE WHEN NOT is_agent THEN 1 ELSE 0 END) AS human_count,
  AVG(amount) AS avg_payment
FROM payment_events
GROUP BY hour, creator_id, asset;

-- Refresh policy (update every hour)
SELECT add_continuous_aggregate_policy('revenue_hourly',
  start_offset => INTERVAL '3 hours',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour');

-- Daily revenue aggregates
CREATE MATERIALIZED VIEW revenue_daily
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', time) AS day,
  creator_id,
  asset,
  SUM(amount) AS total_revenue,
  COUNT(*) AS payment_count,
  SUM(CASE WHEN is_agent THEN amount ELSE 0 END) AS agent_revenue,
  SUM(CASE WHEN NOT is_agent THEN amount ELSE 0 END) AS human_revenue
FROM payment_events
GROUP BY day, creator_id, asset;

-- Content performance aggregates
CREATE MATERIALIZED VIEW content_performance_daily
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', time) AS day,
  content_id,
  COUNT(*) AS views,
  COUNT(DISTINCT user_id) AS unique_users,
  SUM(amount) AS revenue,
  SUM(CASE WHEN is_agent THEN 1 ELSE 0 END) AS agent_views
FROM payment_events
GROUP BY day, content_id;

-- ───────────────────────────────────────────────────────────
-- Retention Policies
-- ───────────────────────────────────────────────────────────

-- Keep raw data for 90 days
SELECT add_retention_policy('payment_events', INTERVAL '90 days');

-- Keep hourly aggregates for 1 year
SELECT add_retention_policy('revenue_hourly', INTERVAL '1 year');

-- Keep daily aggregates forever (or 5 years)
-- SELECT add_retention_policy('revenue_daily', INTERVAL '5 years');
```

---

## 12. API DESIGN

### 12.1 REST API Specification

```yaml
# ═══════════════════════════════════════════════════════════
#  OPENAPI SPECIFICATION - x402Pay API v1
# ═══════════════════════════════════════════════════════════

openapi: 3.0.3
info:
  title: x402Pay API
  version: 1.0.0
  description: |
    x402Pay SDK API for Bitcoin-native content monetization
  contact:
    email: dev@x402pay.xyz
  license:
    name: MIT

servers:
  - url: https://api.x402pay.xyz/v1
    description: Production
  - url: https://api.testnet.x402pay.xyz/v1
    description: Testnet

# ───────────────────────────────────────────────────────────
# Authentication
# ───────────────────────────────────────────────────────────

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

  schemas:
    Error:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        code:
          type: string

# ───────────────────────────────────────────────────────────
# Endpoints
# ───────────────────────────────────────────────────────────

paths:
  # ─────────────────────────────────────────────────────────
  # Authentication
  # ─────────────────────────────────────────────────────────
  
  /auth/login:
    post:
      summary: Authenticate with wallet signature
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                address:
                  type: string
                  example: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
                signature:
                  type: string
                message:
                  type: string
                timestamp:
                  type: integer
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    type: object
                    properties:
                      id:
                        type: string
                      address:
                        type: string
        '401':
          description: Invalid signature
  
  # ─────────────────────────────────────────────────────────
  # Payments
  # ─────────────────────────────────────────────────────────
  
  /payments/initiate:
    post:
      summary: Get payment instructions (402 response)
      tags: [Payments]
      security:
        - ApiKeyAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                contentId:
                  type: string
                  example: "article-123"
      responses:
        '402':
          description: Payment Required
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                  payment:
                    type: object
                    properties:
                      contentId:
                        type: string
                      amount:
                        type: string
                      asset:
                        type: string
                      recipient:
                        type: string
                      nonce:
                        type: string
  
  /payments/verify:
    post:
      summary: Verify payment and get access token
      tags: [Payments]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                txId:
                  type: string
                  example: "0xabc..."
                contentId:
                  type: string
                nonce:
                  type: string
      responses:
        '200':
          description: Payment verified
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken:
                    type: string
                  transaction:
                    type: object
        '401':
          description: Invalid payment
  
  /payments/history:
    get:
      summary: Get payment history
      tags: [Payments]
      security:
        - BearerAuth: []
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: Payment history
          content:
            application/json:
              schema:
                type: object
                properties:
                  payments:
                    type: array
                    items:
                      type: object
                  total:
                    type: integer
  
  # ─────────────────────────────────────────────────────────
  # Content
  # ─────────────────────────────────────────────────────────
  
  /content:
    get:
      summary: List creator's content
      tags: [Content]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Content list
    
    post:
      summary: Create new content
      tags: [Content]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                contentId:
                  type: string
                title:
                  type: string
                description:
                  type: string
                priceStx:
                  type: string
                priceSbtc:
                  type: string
                priceUsdcx:
                  type: string
      responses:
        '201':
          description: Content created
  
  /content/{id}:
    get:
      summary: Get content details
      tags: [Content]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Content details
    
    put:
      summary: Update content
      tags: [Content]
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Content updated
    
    delete:
      summary: Delete content
      tags: [Content]
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Content deleted
  
  # ─────────────────────────────────────────────────────────
  # Analytics
  # ─────────────────────────────────────────────────────────
  
  /analytics/revenue:
    get:
      summary: Get revenue analytics
      tags: [Analytics]
      security:
        - BearerAuth: []
      parameters:
        - name: startDate
          in: query
          schema:
            type: string
            format: date
        - name: endDate
          in: query
          schema:
            type: string
            format: date
        - name: granularity
          in: query
          schema:
            type: string
            enum: [hour, day, week, month]
      responses:
        '200':
          description: Revenue data
          content:
            application/json:
              schema:
                type: object
                properties:
                  period:
                    type: object
                  data:
                    type: array
                  summary:
                    type: object
  
  /analytics/top-content:
    get:
      summary: Get top performing content
      tags: [Analytics]
      security:
        - BearerAuth: []
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: Top content
```

---

## 13. INTEGRATION PATTERNS

### 13.1 Webhook System

```typescript
// ═══════════════════════════════════════════════════════════
//  WEBHOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════

interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

interface WebhookSubscription {
  id: string;
  userId: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
}

class WebhookService {
  
  async deliverWebhook(
    subscription: WebhookSubscription,
    event: WebhookEvent
  ): Promise<void> {
    // 1. Create payload
    const payload = {
      id: event.id,
      type: event.type,
      data: event.data,
      timestamp: event.timestamp
    };
    
    // 2. Generate signature (HMAC)
    const signature = crypto
      .createHmac('sha256', subscription.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    // 3. Send webhook
    try {
      const response = await axios.post(subscription.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-x402Pay-Signature': signature,
          'X-x402Pay-Event': event.type,
          'X-x402Pay-Delivery': event.id
        },
        timeout: 10000 // 10 second timeout
      });
      
      // 4. Log delivery
      await this.logDelivery({
        webhookId: subscription.id,
        eventId: event.id,
        status: 'success',
        statusCode: response.status,
        responseTime: response.duration
      });
      
    } catch (error) {
      // 5. Handle failure
      await this.handleFailure(subscription, event, error);
    }
  }
  
  async handleFailure(
    subscription: WebhookSubscription,
    event: WebhookEvent,
    error: Error
  ): Promise<void> {
    // Log failure
    await this.logDelivery({
      webhookId: subscription.id,
      eventId: event.id,
      status: 'failed',
      error: error.message
    });
    
    // Retry logic (exponential backoff)
    const attempts = await this.getDeliveryAttempts(event.id);
    
    if (attempts < 5) {
      const delay = Math.pow(2, attempts) * 1000; // 1s, 2s, 4s, 8s, 16s
      
      setTimeout(() => {
        this.deliverWebhook(subscription, event);
      }, delay);
    } else {
      // Max retries reached - disable webhook
      await this.disableWebhook(subscription.id);
      
      // Notify user
      await this.notifyWebhookFailure(subscription);
    }
  }
}

// ─────────────────────────────────────────────────────────
// Webhook Events
// ─────────────────────────────────────────────────────────

// payment.verified
{
  "id": "evt_123",
  "type": "payment.verified",
  "data": {
    "txId": "0xabc...",
    "contentId": "article-123",
    "amount": "100000",
    "asset": "STX",
    "payer": "SP2J6ZY...",
    "createdAt": "2026-02-09T12:00:00Z"
  },
  "timestamp": 1675944000
}

// content.created
{
  "id": "evt_124",
  "type": "content.created",
  "data": {
    "contentId": "article-124",
    "title": "New Article",
    "price": "0.10",
    "asset": "STX"
  },
  "timestamp": 1675944060
}
```

---

## 14. SCALABILITY & PERFORMANCE

### 14.1 Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   CACHING ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LAYER 1: CDN (Cloudflare)                                  │
│  ├─ Static assets (images, CSS, JS)                         │
│  ├─ Landing page (SSG)                                      │
│  └─ API responses (public endpoints)                        │
│                                                             │
│  LAYER 2: Application Cache (Redis)                         │
│  ├─ User sessions (TTL: 7 days)                             │
│  ├─ API keys (TTL: 1 hour)                                  │
│  ├─ Content metadata (TTL: 5 minutes)                       │
│  ├─ Payment nonces (TTL: 5 minutes)                         │
│  └─ Rate limiting counters                                  │
│                                                             │
│  LAYER 3: Query Result Cache (Redis)                        │
│  ├─ Revenue analytics (TTL: 1 hour)                         │
│  ├─ Top content rankings (TTL: 15 minutes)                  │
│  └─ Creator statistics (TTL: 5 minutes)                     │
│                                                             │
│  LAYER 4: Database Query Cache (PostgreSQL)                 │
│  ├─ Materialized views                                      │
│  └─ Query result caching                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

```typescript
// Cache implementation
class CacheService {
  private redis: Redis;
  
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Usage
const cache = new CacheService(redisClient);

// Cache content metadata
await cache.set(`content:${contentId}`, content, 300); // 5 min TTL

// Cache-aside pattern
async function getContent(contentId: string): Promise<Content> {
  // Try cache first
  const cached = await cache.get<Content>(`content:${contentId}`);
  if (cached) return cached;
  
  // Cache miss - query database
  const content = await db.content.findById(contentId);
  
  // Store in cache
  await cache.set(`content:${contentId}`, content, 300);
  
  return content;
}

// Invalidate on update
async function updateContent(contentId: string, updates: Partial<Content>) {
  await db.content.update(contentId, updates);
  await cache.invalidate(`content:${contentId}`);
}
```

### 14.2 Database Optimization

```sql
-- ═══════════════════════════════════════════════════════════
--  DATABASE OPTIMIZATION STRATEGIES
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- 1. Partitioning (Payments by time)
-- ───────────────────────────────────────────────────────────

-- Partition payments table by month
CREATE TABLE payments_2026_01 PARTITION OF payments
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE payments_2026_02 PARTITION OF payments
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Auto-create partitions
CREATE OR REPLACE FUNCTION create_monthly_partitions()
RETURNS void AS $$
DECLARE
  start_date DATE;
  end_date DATE;
  partition_name TEXT;
BEGIN
  FOR i IN 0..11 LOOP
    start_date := date_trunc('month', NOW() + (i || ' months')::INTERVAL);
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'payments_' || to_char(start_date, 'YYYY_MM');
    
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I PARTITION OF payments
      FOR VALUES FROM (%L) TO (%L)
    ', partition_name, start_date, end_date);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────
-- 2. Indexing Strategy
-- ───────────────────────────────────────────────────────────

-- Covering index for common queries
CREATE INDEX idx_payments_content_time_covering 
ON payments(content_id, created_at DESC) 
INCLUDE (amount, asset, is_agent);

-- Partial index for active content
CREATE INDEX idx_content_active 
ON content(status, published_at) 
WHERE status = 'published' AND enabled = true;

-- GIN index for JSONB queries
CREATE INDEX idx_content_metadata 
ON content USING GIN (metadata);

-- ───────────────────────────────────────────────────────────
-- 3. Query Optimization
-- ───────────────────────────────────────────────────────────

-- Use EXPLAIN ANALYZE to optimize queries
EXPLAIN (ANALYZE, BUFFERS) 
SELECT c.*, SUM(p.amount) as revenue
FROM content c
LEFT JOIN payments p ON c.id = p.content_id
WHERE c.creator_id = 'uuid-here'
  AND c.status = 'published'
GROUP BY c.id
ORDER BY revenue DESC
LIMIT 10;

-- Optimize with materialized view
CREATE MATERIALIZED VIEW content_revenue_summary AS
SELECT 
  c.id,
  c.title,
  c.creator_id,
  COUNT(p.id) as payment_count,
  SUM(p.amount) as total_revenue,
  MAX(p.created_at) as last_payment_at
FROM content c
LEFT JOIN payments p ON c.id = p.content_id
WHERE c.status = 'published'
GROUP BY c.id, c.title, c.creator_id;

CREATE UNIQUE INDEX ON content_revenue_summary(id);
CREATE INDEX ON content_revenue_summary(creator_id, total_revenue DESC);

-- Refresh policy
REFRESH MATERIALIZED VIEW CONCURRENTLY content_revenue_summary;

-- ───────────────────────────────────────────────────────────
-- 4. Connection Pooling
-- ───────────────────────────────────────────────────────────

-- PgBouncer configuration
[databases]
x402pay = host=localhost port=5432 dbname=x402pay

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3
```

---

## 15. MONITORING & OBSERVABILITY

### 15.1 Metrics & Alerting

```typescript
// ═══════════════════════════════════════════════════════════
//  PROMETHEUS METRICS
// ═══════════════════════════════════════════════════════════

import client from 'prom-client';

// Create registry
const register = new client.Registry();

// Default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const paymentTotal = new client.Counter({
  name: 'payments_total',
  help: 'Total number of payments',
  labelNames: ['asset', 'status']
});

const paymentAmount = new client.Gauge({
  name: 'payment_amount_total',
  help: 'Total payment amount by asset',
  labelNames: ['asset']
});

const activeUsers = new client.Gauge({
  name: 'active_users',
  help: 'Number of active users'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(paymentTotal);
register.registerMetric(paymentAmount);
register.registerMetric(activeUsers);

// Middleware to track HTTP requests
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });
  
  next();
});

// Track payments
async function recordPayment(payment: Payment) {
  paymentTotal.labels(payment.asset, payment.status).inc();
  paymentAmount.labels(payment.asset).inc(payment.amount);
}

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

```yaml
# ═══════════════════════════════════════════════════════════
#  PROMETHEUS ALERTING RULES
# ═══════════════════════════════════════════════════════════

groups:
  - name: x402pay_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} (threshold: 0.05)"
      
      # Payment verification failing
      - alert: PaymentVerificationFailures
        expr: |
          rate(payments_total{status="failed"}[10m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Payment verifications failing"
      
      # Database connection pool exhausted
      - alert: DatabasePoolExhausted
        expr: |
          pg_stat_database_numbackends / pg_settings_max_connections > 0.9
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool near capacity"
      
      # High API latency
      - alert: HighAPILatency
        expr: |
          histogram_quantile(0.95, 
            rate(http_request_duration_seconds_bucket[5m])
          ) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API latency is high"
          description: "95th percentile latency: {{ $value }}s"
```

### 15.2 Logging Strategy

```typescript
// ═══════════════════════════════════════════════════════════
//  STRUCTURED LOGGING (Winston)
// ═══════════════════════════════════════════════════════════

import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'payment-service',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console (development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File (production)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Usage
logger.info('Payment verified', {
  txId: '0xabc...',
  contentId: 'article-123',
  amount: 100000,
  asset: 'STX',
  userId: 'SP2J6ZY...'
});

logger.error('Payment verification failed', {
  txId: '0xdef...',
  error: error.message,
  stack: error.stack
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    logger.info('HTTP request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: Date.now() - start,
      userId: req.user?.id,
      ip: req.ip
    });
  });
  
  next();
});
```

---

## 16. DEPLOYMENT ARCHITECTURE

### 16.1 Production Deployment Checklist

```markdown
# ═══════════════════════════════════════════════════════════
#  PRODUCTION DEPLOYMENT CHECKLIST
# ═══════════════════════════════════════════════════════════

## Pre-Deployment

### Code Quality
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code coverage > 80%
- [ ] Linting passing (ESLint, Prettier)
- [ ] TypeScript compilation successful
- [ ] Security audit passing (npm audit, Snyk)

### Configuration
- [ ] Environment variables set
- [ ] Secrets stored in vault (not in repo)
- [ ] Database migrations tested
- [ ] Feature flags configured
- [ ] Rate limits configured

### Infrastructure
- [ ] SSL certificates valid
- [ ] DNS configured correctly
- [ ] CDN configured
- [ ] Backup strategy in place
- [ ] Monitoring configured

## Deployment Steps

### 1. Database
- [ ] Run migrations (with rollback plan)
- [ ] Verify schema changes
- [ ] Test queries on production replica
- [ ] Update materialized views

### 2. Backend Services
- [ ] Build Docker images
- [ ] Push to registry
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Deploy to production (blue-green)
- [ ] Verify health checks

### 3. Frontend
- [ ] Build production bundle
- [ ] Deploy to Vercel
- [ ] Invalidate CDN cache
- [ ] Verify static assets loading

### 4. Verification
- [ ] Run smoke tests
- [ ] Check error logs
- [ ] Monitor metrics (5 minutes)
- [ ] Test critical flows:
  - [ ] Wallet connection
  - [ ] Payment flow
  - [ ] Content access
  - [ ] Analytics loading

## Post-Deployment

### Monitoring
- [ ] Check error rates
- [ ] Check latency (p95, p99)
- [ ] Check database performance
- [ ] Check memory/CPU usage
- [ ] Review logs for anomalies

### Communication
- [ ] Notify team of deployment
- [ ] Update changelog
- [ ] Announce new features (if any)

## Rollback Plan

If issues detected:
1. Revert to previous version immediately
2. Investigate in staging environment
3. Fix and redeploy
```

---

## CONCLUSION

This complete system architecture provides a production-ready blueprint for building x402Pay. Key highlights:

✅ **Comprehensive Coverage**: Frontend, backend, blockchain, database, SDK
✅ **Security-First**: Authentication, authorization, input validation, audit logging
✅ **Scalable**: Caching, database optimization, horizontal scaling
✅ **Observable**: Metrics, logging, alerting
✅ **Production-Ready**: CI/CD, deployment strategies, monitoring

**Total Pages**: 120+ pages of detailed system design
**Estimated Implementation Time**: 8-12 weeks (full production system)
**MVP Implementation Time**: 7-10 days (hackathon version)

---

**Document Status**: Complete ✓  
**Last Updated**: February 9, 2026  
**Architects**: x402Pay Engineering Team  
**Version**: 1.0.0
