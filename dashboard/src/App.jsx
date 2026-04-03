import { useState, useEffect } from 'react';

const C = {
  bg: '#0A0E17', card: '#111827', border: '#1e293b', text: '#e2e8f0',
  muted: '#64748b', dim: '#475569', blue: '#3b82f6', green: '#10b981',
  amber: '#f59e0b', red: '#ef4444', purple: '#8b5cf6',
  blueG: 'rgba(59,130,246,0.12)', greenG: 'rgba(16,185,129,0.12)',
  amberG: 'rgba(245,158,11,0.12)', redG: 'rgba(239,68,68,0.12)',
};

const font = "'Inter', -apple-system, sans-serif";
const mono = "'JetBrains Mono', 'SF Mono', monospace";

// Sample data matching demo output — replaced by live transactions.json
const SAMPLE_DATA = [
  { id: 'txn_1', timestamp: '2026-04-03T13:00:00Z', chain: 'Base', to: '0x7a25...488D', amount_usd: 500, tax: 25, tax_jurisdiction: 'Texas', tax_rate: 0.0625, work_type: 'compute', counterparty_id: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', status: 'tax_calculated' },
  { id: 'txn_2', timestamp: '2026-04-03T13:01:00Z', chain: 'Ethereum Mainnet', to: '0xdAC1...1ec7', amount_usd: 300, tax: 12, tax_jurisdiction: 'Washington', tax_rate: 0.065, work_type: 'research', counterparty_id: '0xdAC17F958D2ee523a2206206994597C13D831ec7', status: 'tax_calculated' },
  { id: 'txn_3', timestamp: '2026-04-03T13:02:00Z', chain: 'Base', to: '0x7a25...488D', amount_usd: 200, tax: 0, tax_jurisdiction: 'Florida', tax_rate: 0, work_type: 'content', counterparty_id: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', status: 'tax_calculated' },
  { id: 'txn_4', timestamp: '2026-04-03T13:03:00Z', chain: 'Polygon', to: '0x2791...4174', amount_usd: 150, tax: 6.19, tax_jurisdiction: 'New Jersey', tax_rate: 0.06625, work_type: 'consulting', counterparty_id: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', status: 'tax_calculated' },
  { id: 'txn_5', timestamp: '2026-04-03T13:04:00Z', chain: 'Base', to: '0x7a25...488D', amount_usd: 500, tax: 25, tax_jurisdiction: 'Texas', tax_rate: 0.0625, work_type: 'compute', counterparty_id: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', alert_1099: true, status: 'tax_calculated' },
];

export default function App() {
  const [transactions, setTransactions] = useState(SAMPLE_DATA);
  const [view, setView] = useState('feed');

  // Try to load live data
  useEffect(() => {
    fetch('/api/transactions')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setTransactions(data); })
      .catch(() => {}); // Fall back to sample data
  }, []);

  const totalPayments = transactions.reduce((s, t) => s + t.amount_usd, 0);
  const totalTax = transactions.reduce((s, t) => s + t.tax, 0);
  const alerts1099 = transactions.filter(t => t.alert_1099).length;

  // Counterparty YTD totals
  const counterparties = {};
  transactions.forEach(t => {
    const id = t.counterparty_id || t.to;
    if (!counterparties[id]) counterparties[id] = { id, total: 0, tax: 0, count: 0, chain: t.chain };
    counterparties[id].total += t.amount_usd;
    counterparties[id].tax += t.tax;
    counterparties[id].count++;
  });

  // Jurisdiction summary
  const jurisdictions = {};
  transactions.forEach(t => {
    const j = t.tax_jurisdiction;
    if (!jurisdictions[j]) jurisdictions[j] = { name: j, total: 0, tax: 0, rate: t.tax_rate, count: 0 };
    jurisdictions[j].total += t.amount_usd;
    jurisdictions[j].tax += t.tax;
    jurisdictions[j].count++;
  });

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: font }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px' }}>
            <span style={{ color: C.blue }}>AgentTax</span>
            <span style={{ color: C.dim, margin: '0 8px' }}>×</span>
            <span style={{ color: C.green }}>OWS</span>
          </div>
          <span style={{ fontSize: 11, color: C.dim, background: C.card, padding: '3px 10px', borderRadius: 100, border: `1px solid ${C.border}` }}>
            Tax Compliance Dashboard
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['feed', 'counterparties', 'jurisdictions'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6,
              background: view === v ? C.blue : 'transparent',
              color: view === v ? '#fff' : C.muted,
              border: view === v ? 'none' : `1px solid ${C.border}`,
              cursor: 'pointer', fontFamily: font, textTransform: 'capitalize',
            }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, padding: '20px 24px' }}>
        <StatCard label="Total Payments" value={`$${totalPayments.toLocaleString()}`} color={C.blue} bg={C.blueG} />
        <StatCard label="Tax Obligations" value={`$${totalTax.toFixed(2)}`} color={C.amber} bg={C.amberG} />
        <StatCard label="Transactions" value={transactions.length} color={C.green} bg={C.greenG} />
        <StatCard label="1099 Alerts" value={alerts1099} color={alerts1099 > 0 ? C.red : C.green} bg={alerts1099 > 0 ? C.redG : C.greenG} />
      </div>

      {/* Content */}
      <div style={{ padding: '0 24px 40px' }}>
        {view === 'feed' && <TransactionFeed transactions={transactions} />}
        {view === 'counterparties' && <CounterpartyView counterparties={counterparties} />}
        {view === 'jurisdictions' && <JurisdictionView jurisdictions={jurisdictions} />}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 12, padding: '16px 20px' }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontFamily: font }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: mono, letterSpacing: '-1px' }}>{value}</div>
    </div>
  );
}

function TransactionFeed({ transactions }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Transaction Feed</div>
      {transactions.map(tx => (
        <div key={tx.id} style={{
          background: C.card, border: `1px solid ${tx.alert_1099 ? C.red : C.border}`,
          borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          ...(tx.alert_1099 ? { boxShadow: `0 0 20px ${C.redG}` } : {}),
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>${tx.amount_usd.toLocaleString()}</span>
              <span style={{ fontSize: 10, color: C.dim, background: C.bg, padding: '2px 8px', borderRadius: 4 }}>{tx.chain}</span>
              <span style={{ fontSize: 10, color: C.purple, background: `${C.purple}15`, padding: '2px 8px', borderRadius: 4 }}>{tx.work_type}</span>
              {tx.alert_1099 && (
                <span style={{ fontSize: 10, color: C.red, background: C.redG, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  1099 THRESHOLD
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: C.dim, fontFamily: mono }}>
              To: {tx.to?.slice(0, 10)}...{tx.to?.slice(-4)} &middot; {new Date(tx.timestamp).toLocaleTimeString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: tx.tax > 0 ? C.amber : C.green }}>
              {tx.tax > 0 ? `$${tx.tax.toFixed(2)} tax` : 'No tax'}
            </div>
            <div style={{ fontSize: 10, color: C.dim }}>{tx.tax_jurisdiction} ({(tx.tax_rate * 100).toFixed(2)}%)</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CounterpartyView({ counterparties }) {
  const sorted = Object.values(counterparties).sort((a, b) => b.total - a.total);
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Counterparty 1099 Tracker</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map(cp => {
          const over = cp.total >= 600;
          return (
            <div key={cp.id} style={{
              background: C.card, border: `1px solid ${over ? C.red : C.border}`,
              borderRadius: 10, padding: '14px 18px',
              ...(over ? { boxShadow: `0 0 20px ${C.redG}` } : {}),
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontFamily: mono, color: C.text, marginBottom: 4 }}>
                    {cp.id.slice(0, 10)}...{cp.id.slice(-4)}
                  </div>
                  <div style={{ fontSize: 11, color: C.dim }}>{cp.count} transactions &middot; {cp.chain}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: over ? C.red : C.text, fontFamily: mono }}>
                    ${cp.total.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: over ? C.red : C.dim }}>
                    {over ? '1099 REQUIRED' : `$${(600 - cp.total).toFixed(0)} until threshold`}
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ marginTop: 10, height: 4, background: C.bg, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (cp.total / 600) * 100)}%`,
                  height: '100%',
                  background: over ? C.red : C.blue,
                  borderRadius: 2,
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JurisdictionView({ jurisdictions }) {
  const sorted = Object.values(jurisdictions).sort((a, b) => b.tax - a.tax);
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Tax by Jurisdiction</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {sorted.map(j => (
          <div key={j.name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{j.name}</div>
                <div style={{ fontSize: 11, color: C.dim }}>{j.count} transactions &middot; ${j.total.toLocaleString()} volume</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.amber, fontFamily: mono }}>${j.tax.toFixed(2)}</div>
                <div style={{ fontSize: 10, color: C.dim }}>{(j.rate * 100).toFixed(2)}% rate</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
