# AgentTax for OWS

**Tax-compliant agent payments for Open Wallet Standard.**

Every AI agent that buys or sells services has tax obligations. Most don't know it. `ows-tax-policy` is a pre-signing policy plugin for OWS that calculates sales tax, use tax, and 1099 reporting requirements before your agent's wallet signs a transaction.

Built on [AgentTax.io](https://agenttax.io) — the tax engine for AI-to-AI commerce.

## How It Works

```
Agent wants to pay → OWS Policy Engine → tax-check.js → AgentTax API
                                                        ↓
                                                   Tax calculated
                                                   Transaction logged
                                                   1099 tracked
                                                        ↓
                                              OWS signs transaction ✓
```

The OWS policy engine evaluates `tax-check.js` before any transaction is signed. The policy:

1. Reads the transaction details from OWS PolicyContext (chain, amount, recipient)
2. Calls AgentTax to calculate the tax obligation (51 US jurisdictions, state + local rates)
3. Logs the transaction with tax breakdown for audit trail
4. Tracks counterparty payments toward the $600 IRS 1099 reporting threshold
5. Returns allow/deny to OWS

## Components

| Component | Description |
|-----------|-------------|
| `policy/tax-check.js` | OWS policy executable — calls AgentTax, logs transactions |
| `policy/policy.json` | OWS policy config — chain allowlist + executable |
| `dashboard/` | React dashboard — transaction feed, 1099 tracker, jurisdiction view |
| `demo/run-demo.js` | Automated demo — 5 agent payments across chains and states |

## Quick Start

```bash
# Install
npm install

# Run the demo (simulates 5 agent payments)
npm run demo

# Start the dashboard to see results
npm run dashboard
# Open http://localhost:5173
```

## Attach to an OWS Wallet

```bash
# Create a wallet
ows wallet create --name "agent-treasury"

# Attach the tax policy
ows policy create --file policy/policy.json

# Now every transaction is tax-checked before signing
ows sign tx --wallet agent-treasury --chain ethereum --tx "0x..."
# → tax-check.js runs first, calculates tax, logs it, then OWS signs
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENTTAX_API` | `https://agenttax.io/api/v1` | AgentTax API endpoint |
| `AGENTTAX_KEY` | (none) | AgentTax API key (optional, uses demo mode) |
| `AGENT_STATE` | `CA` | Agent's tax jurisdiction (2-letter state) |
| `COUNTERPARTY_STATE` | `TX` | Counterparty's state |
| `WORK_TYPE` | `compute` | Type of work: compute, research, content, consulting, trading |

## What Gets Logged

Every transaction produces a log entry in `transactions.json`:

```json
{
  "id": "txn_1712160000000",
  "timestamp": "2026-04-03T13:00:00.000Z",
  "chain": "Base",
  "amount_usd": 500.00,
  "tax": 25.00,
  "tax_jurisdiction": "Texas",
  "tax_rate": 0.0625,
  "counterparty_id": "0x7a25...",
  "work_type": "compute",
  "status": "tax_calculated",
  "alert_1099": false
}
```

## Why This Matters

AI agents are already transacting on-chain. They buy compute, sell research, trade assets. Every one of these transactions has potential tax implications:

- **Sales tax** varies by state (0% in Oregon, 10.25% in parts of California)
- **Use tax** applies when the seller doesn't collect
- **1099 reporting** is required for $600+ paid to any single counterparty
- **Nexus rules** determine which states can tax you

No agent handles this today. `ows-tax-policy` makes it automatic — calculate before you sign, log everything, alert on thresholds.

## Tech Stack

- **Policy**: Node.js ES modules, OWS PolicyContext interface
- **Tax Engine**: [AgentTax.io](https://agenttax.io) — 51 jurisdictions, 105 zip-level rates
- **Dashboard**: React + Vite (inline styles, no dependencies beyond React)
- **Chains**: EVM (Ethereum, Base, Polygon, Arbitrum), Solana, Bitcoin

## License

MIT
