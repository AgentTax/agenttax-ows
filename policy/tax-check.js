#!/usr/bin/env node
// ============================================================================
// OWS Tax Policy — Pre-signing tax compliance check
// ============================================================================
// This policy executable is called by OWS before any transaction is signed.
// It calls AgentTax to calculate tax obligations and logs the transaction.
//
// Exit 0 = allow (tax calculated, logged)
// Exit 1 = deny  (compliance issue or API failure)
//
// PolicyContext is passed via stdin as JSON:
// {
//   "chain_id": "eip155:8453",
//   "wallet_id": "...",
//   "api_key_id": "...",
//   "transaction": { "to": "0x...", "value": "...", "data": "0x..." },
//   "spending": { "daily_total": "...", "date": "..." },
//   "timestamp": "..."
// }
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_FILE = join(__dirname, '..', 'transactions.json');
const AGENTTAX_API = process.env.AGENTTAX_API || 'https://agenttax.io/api/v1';
const AGENTTAX_KEY = process.env.AGENTTAX_KEY || '';

// Chain ID to human-readable name
const CHAIN_NAMES = {
  'eip155:1': 'Ethereum Mainnet',
  'eip155:8453': 'Base',
  'eip155:137': 'Polygon',
  'eip155:42161': 'Arbitrum',
  'solana:mainnet': 'Solana',
  'bip122:000000000019d6689c085ae165831e93': 'Bitcoin',
};

async function main() {
  // Read PolicyContext from stdin
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  let ctx;
  try {
    ctx = JSON.parse(input);
  } catch {
    console.error('tax-policy: invalid PolicyContext JSON');
    process.exit(1);
  }

  const { chain_id, wallet_id, transaction, timestamp } = ctx;
  const txValue = parseFloat(transaction?.value || '0');

  // Skip zero-value transactions (approvals, etc.)
  if (txValue === 0) {
    console.log('tax-policy: zero-value transaction, allowing');
    process.exit(0);
  }

  // Convert wei/lamports to USD estimate (simplified for hackathon)
  const amountUsd = estimateUsd(chain_id, txValue);

  // Call AgentTax for tax calculation
  let taxResult;
  try {
    taxResult = await calculateTax({
      amount: amountUsd,
      buyer_state: process.env.AGENT_STATE || 'CA',
      seller_state: process.env.COUNTERPARTY_STATE || 'TX',
      work_type: process.env.WORK_TYPE || 'compute',
      counterparty_id: transaction?.to || 'unknown',
    });
  } catch (err) {
    console.error(`tax-policy: AgentTax API error — ${err.message}`);
    // Fail open for hackathon demo (in production, fail closed)
    taxResult = { error: err.message, total_tax: 0 };
  }

  // Log transaction
  const entry = {
    id: `txn_${Date.now()}`,
    timestamp: timestamp || new Date().toISOString(),
    chain: CHAIN_NAMES[chain_id] || chain_id,
    chain_id,
    wallet_id,
    to: transaction?.to,
    amount_raw: transaction?.value,
    amount_usd: amountUsd,
    tax: taxResult.total_tax || 0,
    tax_jurisdiction: taxResult.use_tax?.jurisdiction || taxResult.sales_tax?.jurisdiction || taxResult.jurisdiction || 'N/A',
    tax_rate: taxResult.use_tax?.combined_rate || taxResult.sales_tax?.combined_rate || taxResult.combined_rate || 0,
    counterparty_id: transaction?.to,
    work_type: process.env.WORK_TYPE || 'compute',
    status: taxResult.error ? 'tax_estimate_failed' : 'tax_calculated',
    agenttax_response: taxResult,
  };

  appendLog(entry);

  // Check 1099 threshold
  const ytdTotal = getYtdTotal(transaction?.to);
  if (ytdTotal > 600) {
    entry.alert_1099 = true;
    console.log(`tax-policy: WARNING — counterparty ${transaction?.to?.slice(0, 10)}... has exceeded $600 YTD threshold ($${ytdTotal.toFixed(2)}). 1099 reporting required.`);
  }

  console.log(`tax-policy: ALLOW — $${amountUsd.toFixed(2)} payment, $${(taxResult.total_tax || 0).toFixed(2)} tax obligation (${entry.tax_jurisdiction})`);
  process.exit(0);
}

async function calculateTax({ amount, buyer_state, seller_state, work_type, counterparty_id }) {
  const headers = { 'Content-Type': 'application/json' };
  if (AGENTTAX_KEY) headers['X-API-Key'] = AGENTTAX_KEY;

  const res = await fetch(`${AGENTTAX_API}/calculate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      role: 'buyer',
      amount,
      buyer_state,
      seller_state,
      work_type,
      transaction_type: 'service',
      counterparty_id,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

function estimateUsd(chainId, rawValue) {
  // Simplified price estimates for demo
  const prices = {
    'eip155:1': 3200,      // ETH
    'eip155:8453': 3200,   // Base (ETH)
    'eip155:137': 0.50,    // MATIC
    'solana:mainnet': 150, // SOL
  };
  const pricePerUnit = prices[chainId] || 1;

  // Convert from smallest unit (wei = 1e18, lamports = 1e9)
  const isEvm = chainId?.startsWith('eip155:');
  const divisor = isEvm ? 1e18 : 1e9;

  return (rawValue / divisor) * pricePerUnit;
}

function appendLog(entry) {
  let log = [];
  if (existsSync(LOG_FILE)) {
    try { log = JSON.parse(readFileSync(LOG_FILE, 'utf8')); } catch { log = []; }
  }
  log.push(entry);
  writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

function getYtdTotal(counterpartyId) {
  if (!counterpartyId || !existsSync(LOG_FILE)) return 0;
  try {
    const log = JSON.parse(readFileSync(LOG_FILE, 'utf8'));
    return log
      .filter(e => e.counterparty_id === counterpartyId)
      .reduce((sum, e) => sum + (e.amount_usd || 0), 0);
  } catch { return 0; }
}

main().catch(err => {
  console.error(`tax-policy: fatal error — ${err.message}`);
  process.exit(1);
});
