#!/usr/bin/env node
// Generate real wallet + transaction data for the demo video
// Uses ethers.js to create authentic signatures and addresses

import { ethers } from 'ethers';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a real wallet
const wallet = ethers.Wallet.createRandom();
console.log(`OWS Wallet: ${wallet.address}`);
console.log(`Mnemonic: ${wallet.mnemonic.phrase}`);

const SCENARIOS = [
  { name: 'AI Compute Service', chain: 'Base (eip155:8453)', to: ethers.Wallet.createRandom().address, amount: 500, tax: 25, jurisdiction: 'Texas', rate: 0.0625, type: 'compute', state_from: 'CA', state_to: 'TX' },
  { name: 'Research Data Purchase', chain: 'Ethereum (eip155:1)', to: ethers.Wallet.createRandom().address, amount: 300, tax: 19.50, jurisdiction: 'Washington', rate: 0.065, type: 'research', state_from: 'NY', state_to: 'WA' },
  { name: 'Content Generation', chain: 'Base (eip155:8453)', to: ethers.Wallet.createRandom().address, amount: 200, tax: 0, jurisdiction: 'Florida', rate: 0, type: 'content', state_from: 'FL', state_to: 'CA' },
  { name: 'Consulting Service', chain: 'Polygon (eip155:137)', to: ethers.Wallet.createRandom().address, amount: 150, tax: 9.94, jurisdiction: 'New Jersey', rate: 0.06625, type: 'consulting', state_from: 'NJ', state_to: 'TX' },
  { name: 'Recurring Compute', chain: 'Base (eip155:8453)', to: null, amount: 500, tax: 25, jurisdiction: 'Texas', rate: 0.0625, type: 'compute', state_from: 'CA', state_to: 'TX', alert_1099: true },
];

// Use the same counterparty for txns 0, 2, 4 (shows 1099 accumulation)
SCENARIOS[4].to = SCENARIOS[0].to;
SCENARIOS[2].to = SCENARIOS[0].to;

const transactions = [];

for (const s of SCENARIOS) {
  // Sign a message to get a real signature/hash
  const message = `AgentTax|${s.chain}|${s.to}|${s.amount}|${Date.now()}`;
  const signature = await wallet.signMessage(message);
  const txHash = ethers.keccak256(ethers.toUtf8Bytes(signature));

  let ytdTotal = transactions
    .filter(t => t.counterparty === s.to)
    .reduce((sum, t) => sum + t.amount, 0) + s.amount;

  transactions.push({
    tx_hash: txHash,
    signature: signature.slice(0, 22) + '...' + signature.slice(-8),
    wallet: wallet.address,
    counterparty: s.to,
    counterparty_short: s.to.slice(0, 6) + '...' + s.to.slice(-4),
    name: s.name,
    chain: s.chain,
    amount: s.amount,
    tax: s.tax,
    jurisdiction: s.jurisdiction,
    rate: s.rate,
    rate_pct: (s.rate * 100).toFixed(s.rate > 0 ? 2 : 0) + '%',
    type: s.type,
    state_from: s.state_from,
    state_to: s.state_to,
    alert_1099: s.alert_1099 || false,
    ytd_to_counterparty: ytdTotal,
    status: s.tax > 0 ? 'TAX CALCULATED' : 'NO TAX DUE',
  });
}

const output = {
  wallet: {
    address: wallet.address,
    address_short: wallet.address.slice(0, 6) + '...' + wallet.address.slice(-4),
    name: 'agent-treasury',
    created: new Date().toISOString(),
  },
  transactions,
  summary: {
    total_payments: transactions.reduce((s, t) => s + t.amount, 0),
    total_tax: transactions.reduce((s, t) => s + t.tax, 0),
    tx_count: transactions.length,
    alerts_1099: transactions.filter(t => t.alert_1099).length,
  },
};

const outPath = join(__dirname, 'src', 'demo-data.json');
writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`\nGenerated ${transactions.length} transactions`);
console.log(`Total: $${output.summary.total_payments} payments, $${output.summary.total_tax.toFixed(2)} tax`);
console.log(`Written to: ${outPath}`);
