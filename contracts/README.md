# ⚡ PayStack Smart Contracts

> Clarity v2 · Stacks L2 (epoch 2.4) · Revenue Splitting · Programmable Payments

PayStack's on-chain layer uses [Clarity v2](https://docs.stacks.co/clarity/overview) smart contracts deployed on the Stacks blockchain. The primary contract — `revenue-split` — handles content registration, configurable revenue splits, and atomic payment processing with built-in event logging.

**Deployed (Testnet)**: [`STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-split`](https://explorer.hiro.so/txid/STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-split?chain=testnet)

---

## 📂 Structure

```
contracts/
└── paystack-contracts/
    ├── contracts/
    │   └── revenue-split.clar       # Main Clarity v2 smart contract
    ├── tests/
    │   └── revenue-split.test.ts    # Clarinet + Vitest test suite (6 tests)
    ├── deployments/
    │   ├── default.simnet-plan.yaml # Simnet deployment plan
    │   └── default.testnet-plan.yaml # Testnet deployment plan (Clarity v2, epoch 2.4)
    ├── settings/
    │   └── Devnet.toml              # Clarinet devnet configuration
    ├── Clarinet.toml                # Project manifest (clarity_version = 2, epoch = 2.4)
    └── package.json                 # Test dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Clarinet** — Install via `brew install clarinet` or from [Hiro releases](https://github.com/hirosystems/clarinet/releases)
- **Node.js** ≥ 20 (for running tests)

### Setup

```bash
cd contracts/paystack-contracts

# Validate Clarity syntax
clarinet check

# Install test dependencies
npm install

# Run the test suite
npm test
```

### Interactive Console

```bash
clarinet console    # Opens a REPL with your contracts loaded
```

---

## 📜 Contract: `revenue-split`

### Overview

The `revenue-split` contract manages the entire payment lifecycle:

1. **Content Registration** — Creators register content with a price and asset type
2. **Revenue Configuration** — Set split percentages between creator, platform, and collaborators
3. **Payment Processing** — Atomic transfer + split + access grant + event emission
4. **Duplicate Prevention** — On-chain payment history prevents double-spending

### Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| `u100` | `ERR-NOT-AUTHORIZED` | Caller is not the content owner |
| `u101` | `ERR-CONTENT-NOT-FOUND` | Content ID not registered |
| `u102` | `ERR-ALREADY-PAID` | Duplicate payment attempt |
| `u103` | `ERR-INSUFFICIENT-AMOUNT` | Payment below content price |
| `u104` | `ERR-TRANSFER-FAILED` | STX transfer failed |
| `u105` | `ERR-INVALID-SPLIT` | Revenue split percentages don't sum to 100 |

### Data Maps

| Map | Key | Value | Purpose |
|-----|-----|-------|---------|
| `content-prices` | `content-id (string-ascii 64)` | `{ price, asset, creator }` | Content pricing registry |
| `revenue-splits` | `content-id (string-ascii 64)` | `{ creator-share, platform-share, collaborator-share, collaborator }` | Split configuration |
| `payment-history` | `{ content-id, payer }` | `{ paid, amount, block-height }` | Duplicate prevention |
| `creator-registry` | `principal` | `{ name, total-revenue, content-count }` | Creator profiles |

### Public Functions

#### `register-content`

```clarity
(register-content
  (content-id (string-ascii 64))
  (price uint)
  (asset (string-ascii 10)))
```

Registers new content with a price and asset type. Only callable once per content ID. Sets the caller as the content creator.

#### `set-content-config`

```clarity
(set-content-config
  (content-id (string-ascii 64))
  (creator-share uint)
  (platform-share uint)
  (collaborator-share uint)
  (collaborator principal))
```

Configures revenue split percentages. Shares must sum to `u100`. Only the content creator can call this.

#### `pay-for-content`

```clarity
(pay-for-content
  (content-id (string-ascii 64))
  (amount uint))
```

Processes a payment:
1. Validates content exists and amount ≥ price
2. Checks for duplicate payment
3. Transfers STX from payer to creator (and splits if configured)
4. Records payment in history
5. Emits `payment-processed` print event

### Read-Only Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `get-content-price` | `{ price, asset, creator }` | Look up content pricing |
| `get-payment-status` | `{ paid, amount, block-height }` | Check if a user has paid |
| `get-creator-info` | `{ name, total-revenue, content-count }` | Creator profile data |
| `get-revenue-split` | `{ creator-share, platform-share, ... }` | Split configuration |

---

## 🧪 Testing

### Test Suite

The test file at `tests/revenue-split.test.ts` uses **Clarinet simnet** with **Vitest** to test all contract functions:

| Test | Description |
|------|-------------|
| Contract deployment | Verifies the contract deploys without errors |
| Content registration | Registers content and verifies stored data |
| Content configuration | Sets revenue splits and validates percentages |
| Payment processing | Processes payment, verifies transfer and history |
| Duplicate prevention | Attempts double-payment, expects `ERR-ALREADY-PAID` |
| Amount validation | Sends insufficient amount, expects `ERR-INSUFFICIENT-AMOUNT` |

### Running Tests

```bash
cd contracts/paystack-contracts

# Full test suite
npm test

# With Clarinet directly
clarinet test
```

### Test Asset

Tests use the `SIM` mock asset (Clarinet's simulated STX) to avoid real transfer failures in the simnet environment.

---

## 💰 Supported Assets

| Asset | On-Chain Identifier | Settlement |
|-------|-------------------|------------|
| **STX** | Native Stacks token | Direct `stx-transfer?` |
| **sBTC** | SIP-010 fungible token | `contract-call? transfer` |
| **USDCx** | SIP-010 fungible token | `contract-call? transfer` |

> Current implementation handles STX natively. sBTC and USDCx support requires SIP-010 trait integration (planned).

---

## 🔄 Payment Flow (x402)

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────┐
│  Wallet   │────▶│  PayStack    │────▶│  revenue-split   │────▶│ Supabase │
│  (Hiro)   │     │  SDK         │     │  .clar           │     │ Backend  │
│           │     │              │     │                  │     │          │
│ 1. Sign   │     │ 2. Submit tx │     │ 3. Split + pay   │     │ 4. Grant │
│    intent │     │    to Stacks │     │    + emit event  │     │    access│
└──────────┘     └──────────────┘     └─────────────────┘     └──────────┘
```

1. **Signal** — User/agent signs payment intent in Hiro Wallet
2. **Submit** — SDK broadcasts transaction to Stacks mempool
3. **Execute** — `pay-for-content` splits revenue, records payment, emits event
4. **Verify** — Backend `verify-payment` Edge Function confirms on-chain, grants access

---

## 🚢 Deployment

### Testnet (Currently Deployed)

```
Contract: STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.revenue-split
Network:  Stacks testnet
Clarity:  v2
Epoch:    2.4
```

```bash
# Regenerate deployment plan (if needed)
clarinet deployments generate --testnet

# Apply deployment
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

> **Note**: The `Clarinet.toml` must specify `clarity_version = 2` and `epoch = 2.4` for the contract. Top-level `(print ...)` expressions must be removed to avoid `abort_by_response` errors during deployment.

### Mainnet

```bash
clarinet deployments generate --mainnet
clarinet deployments apply -p deployments/default.mainnet-plan.yaml
```

---

## 📖 Resources

- [Clarity Language Reference](https://docs.stacks.co/clarity/language-overview)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [Stacks API Reference](https://docs.hiro.so/stacks/api)
- [SIP-010 Fungible Token Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)
- [Stacks Explorer (Testnet)](https://explorer.hiro.so/?chain=testnet)

---

MIT — Built on Stacks. Hardened for Agents. Stacked for Creators.
