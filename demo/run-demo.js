#!/usr/bin/env node
// ============================================================================
// OWS Tax Policy — Demo Script
// ============================================================================
// Simulates 5 agent payments through the tax policy, building up a
// transaction log that the dashboard can display.
//
// Usage: node demo/run-demo.js
// ============================================================================

import { spawn } from 'child_process';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LOG_FILE = join(ROOT, 'transactions.json');
const POLICY = join(ROOT, 'policy', 'tax-check.js');

// Clear previous log
if (existsSync(LOG_FILE)) unlinkSync(LOG_FILE);
writeFileSync(LOG_FILE, '[]');

const SCENARIOS = [
  {
    name: 'AI Compute Service (TX -> CA)',
    chain_id: 'eip155:8453',
    to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    value: '156250000000000000',
    env: { AGENT_STATE: 'CA', COUNTERPARTY_STATE: 'TX', WORK_TYPE: 'compute' },
  },
  {
    name: 'Research Data Purchase (NY -> WA)',
    chain_id: 'eip155:1',
    to: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    value: '93750000000000000',
    env: { AGENT_STATE: 'NY', COUNTERPARTY_STATE: 'WA', WORK_TYPE: 'research' },
  },
  {
    name: 'Content Generation (FL -> CA)',
    chain_id: 'eip155:8453',
    to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    value: '62500000000000000',
    env: { AGENT_STATE: 'FL', COUNTERPARTY_STATE: 'CA', WORK_TYPE: 'content' },
  },
  {
    name: 'Consulting Service (NJ -> TX)',
    chain_id: 'eip155:137',
    to: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    value: '300000000000000000000',
    env: { AGENT_STATE: 'NJ', COUNTERPARTY_STATE: 'TX', WORK_TYPE: 'consulting' },
  },
  {
    name: 'Recurring Compute — 1099 Threshold (TX -> CA)',
    chain_id: 'eip155:8453',
    to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    value: '156250000000000000',
    env: { AGENT_STATE: 'CA', COUNTERPARTY_STATE: 'TX', WORK_TYPE: 'compute' },
  },
];

function runPolicy(scenario) {
  return new Promise((resolve) => {
    const policyContext = JSON.stringify({
      chain_id: scenario.chain_id,
      wallet_id: 'demo-agent-treasury',
      api_key_id: 'demo-key',
      transaction: { to: scenario.to, value: scenario.value, data: '0x' },
      spending: { daily_total: '0', date: new Date().toISOString().split('T')[0] },
      timestamp: new Date().toISOString(),
    });

    const child = spawn('node', [POLICY], {
      cwd: ROOT,
      env: { ...process.env, ...scenario.env },
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000,
    });

    let stdout = '', stderr = '';
    child.stdout.on('data', d => stdout += d);
    child.stderr.on('data', d => stderr += d);
    child.stdin.write(policyContext);
    child.stdin.end();

    child.on('close', (code) => {
      if (stdout.trim()) console.log(stdout.trim());
      if (stderr.trim()) console.log(stderr.trim());
      if (code === 1) console.log('  Transaction DENIED by tax policy');
      resolve(code);
    });
  });
}

console.log('');
console.log('  OWS Tax Policy — Agent Payment Demo');
console.log('  Powered by AgentTax.io x Open Wallet Standard');
console.log('  ─────────────────────────────────────────────');
console.log('');

for (let i = 0; i < SCENARIOS.length; i++) {
  const s = SCENARIOS[i];
  console.log(`  Payment ${i + 1}/${SCENARIOS.length}: ${s.name}`);

  await runPolicy(s);
  console.log('');

  await new Promise(r => setTimeout(r, 500));
}

console.log('  ─────────────────────────────────────────────');
console.log('  Demo complete! Transaction log: transactions.json');
console.log('  Start dashboard: npm run dashboard');
console.log('');
