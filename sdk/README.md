# @x402pay/sdk

Production-ready Bitcoin payment SDK implementing the Coinbase x402 v2 protocol on Stacks.

## Installation

```bash
npm install @x402pay/sdk
```

## Quick Start

```tsx
import { PaywallButton } from '@x402pay/sdk';

function App() {
  return (
    <PaywallButton
      contentId="article-1"
      price={0.10}
      asset="STX"
      onSuccess={(txId) => console.log('Payment successful:', txId)}
    />
  );
}
```

## Features

- ✅ Full x402 v2 protocol compliance
- ✅ React components for easy integration
- ✅ TypeScript support
- ✅ Multi-asset support (STX, sBTC, USDCx)
- ✅ AI agent detection
- ✅ Production-ready

## Documentation

Full documentation: https://paystack-six.vercel.app/docs

## Live Demo

https://paystack-six.vercel.app

## Contracts

6 production contracts deployed on Stacks testnet:
- Revenue Split
- Subscription Manager
- Escrow with Refunds
- Time-Gated Access
- Royalty Cascade
- Tiered Pricing

View all contracts: https://paystack-six.vercel.app/contracts

## License

MIT
