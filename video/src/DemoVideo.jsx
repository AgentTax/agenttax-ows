import { useCurrentFrame, interpolate, Sequence, AbsoluteFill } from 'remotion';
import data from './demo-data.json';

const C = {
  bg: '#0A0E17', card: '#111827', border: '#1e293b', text: '#e2e8f0',
  muted: '#64748b', dim: '#475569', blue: '#3b82f6', green: '#10b981',
  amber: '#f59e0b', red: '#ef4444', purple: '#8b5cf6',
};

const font = "'Inter', -apple-system, sans-serif";
const mono = "'JetBrains Mono', 'SF Mono', monospace";

export const DemoVideo = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: font }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* 1. Intro — 0 to 120 (4s) */}
      <Sequence from={0} durationInFrames={120}>
        <IntroSlide frame={frame} />
      </Sequence>

      {/* 2. Wallet Created — 120 to 210 (3s) */}
      <Sequence from={120} durationInFrames={90}>
        <WalletSlide frame={frame - 120} />
      </Sequence>

      {/* 3. Transactions — 210 to 660 (15s, 3s each) */}
      {data.transactions.map((tx, i) => (
        <Sequence key={i} from={210 + i * 90} durationInFrames={90}>
          <TransactionSlide tx={tx} index={i} frame={frame - (210 + i * 90)} />
        </Sequence>
      ))}

      {/* 4. Summary — 660 to 780 (4s) */}
      <Sequence from={660} durationInFrames={120}>
        <SummarySlide frame={frame - 660} />
      </Sequence>

      {/* 5. CTA — 780 to 900 (4s) */}
      <Sequence from={780} durationInFrames={120}>
        <CTASlide frame={frame - 780} />
      </Sequence>
    </AbsoluteFill>
  );
};

function IntroSlide({ frame }) {
  const titleOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const subOp = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: 'clamp' });
  const badgeOp = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ opacity: badgeOp, fontSize: 16, color: C.dim, letterSpacing: 4, marginBottom: 32, textTransform: 'uppercase' }}>
        OWS Hackathon
      </div>
      <div style={{ opacity: titleOp, fontSize: 80, fontWeight: 800, letterSpacing: '-3px', color: C.text, textAlign: 'center', lineHeight: 1.1 }}>
        <span style={{ color: C.blue }}>AgentTax</span>
        <span style={{ color: C.dim, fontSize: 60 }}> for </span>
        <span style={{ color: C.green }}>OWS</span>
      </div>
      <div style={{ opacity: subOp, fontSize: 26, color: C.muted, marginTop: 24, textAlign: 'center', lineHeight: 1.5 }}>
        Tax compliance as a signing policy.
        <br />
        Calculate before you sign.
      </div>
    </AbsoluteFill>
  );
}

function WalletSlide({ frame }) {
  const op = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const addrOp = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: op }}>
      <div style={{ fontSize: 14, color: C.green, letterSpacing: 3, marginBottom: 20, textTransform: 'uppercase' }}>
        OWS Wallet Created
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, color: C.text, marginBottom: 24 }}>
        {data.wallet.name}
      </div>
      <div style={{
        opacity: addrOp,
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 40px',
      }}>
        <div style={{ fontSize: 12, color: C.dim, marginBottom: 8 }}>Address</div>
        <div style={{ fontSize: 22, fontFamily: mono, color: C.blue, letterSpacing: '0.5px' }}>
          {data.wallet.address}
        </div>
      </div>
      <div style={{ opacity: addrOp, fontSize: 14, color: C.dim, marginTop: 20 }}>
        Policy attached: <span style={{ color: C.amber }}>agenttax-compliance</span>
      </div>
    </AbsoluteFill>
  );
}

function TransactionSlide({ tx, index, frame }) {
  const slideIn = interpolate(frame, [0, 18], [60, 0], { extrapolateRight: 'clamp' });
  const mainOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const hashOp = interpolate(frame, [12, 28], [0, 1], { extrapolateRight: 'clamp' });
  const taxOp = interpolate(frame, [22, 38], [0, 1], { extrapolateRight: 'clamp' });
  const statusOp = interpolate(frame, [32, 48], [0, 1], { extrapolateRight: 'clamp' });

  const runningTotal = data.transactions.slice(0, index + 1).reduce((s, t) => s + t.tax, 0);

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', padding: '50px 100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: C.dim, letterSpacing: 2, textTransform: 'uppercase' }}>
          Transaction {index + 1} of {data.transactions.length}
        </div>
        <div style={{ fontSize: 13, color: C.amber, fontFamily: mono }}>
          Running tax: ${runningTotal.toFixed(2)}
        </div>
      </div>

      {/* Main card */}
      <div style={{
        opacity: mainOp,
        transform: `translateY(${slideIn}px)`,
        background: tx.alert_1099 ? 'rgba(239,68,68,0.06)' : C.card,
        border: `1px solid ${tx.alert_1099 ? C.red : C.border}`,
        borderRadius: 16, padding: '32px 40px',
        ...(tx.alert_1099 ? { boxShadow: `0 0 40px rgba(239,68,68,0.15)` } : {}),
      }}>
        {/* Top row: name + amount */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 6 }}>{tx.name}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: C.green, background: `${C.green}15`, padding: '3px 10px', borderRadius: 6 }}>{tx.chain}</span>
              <span style={{ fontSize: 12, color: C.purple, background: `${C.purple}15`, padding: '3px 10px', borderRadius: 6 }}>{tx.type}</span>
              <span style={{ fontSize: 12, color: C.dim }}>{tx.state_from} → {tx.state_to}</span>
            </div>
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, color: C.text, fontFamily: mono, letterSpacing: '-2px' }}>
            ${tx.amount}
          </div>
        </div>

        {/* Transaction hash */}
        <div style={{ opacity: hashOp, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>Transaction Hash</div>
          <div style={{ fontSize: 15, fontFamily: mono, color: C.blue, letterSpacing: '0.3px' }}>
            {tx.tx_hash}
          </div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>
            From: {data.wallet.address_short} → To: {tx.counterparty_short}
          </div>
        </div>

        {/* Tax breakdown */}
        <div style={{ opacity: taxOp, display: 'flex', gap: 24, marginBottom: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
          <TaxField label="Tax Obligation" value={tx.tax > 0 ? `$${tx.tax.toFixed(2)}` : 'No tax due'} color={tx.tax > 0 ? C.amber : C.green} large />
          <TaxField label="Jurisdiction" value={tx.jurisdiction} color={C.text} />
          <TaxField label="Rate" value={tx.rate_pct} color={C.text} />
          <TaxField label="YTD to Counterparty" value={`$${tx.ytd_to_counterparty.toLocaleString()}`} color={tx.ytd_to_counterparty >= 600 ? C.red : C.text} />
        </div>

        {/* Status + 1099 alert */}
        <div style={{ opacity: statusOp, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: C.green }} />
            <span style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>{tx.status}</span>
            <span style={{ fontSize: 13, color: C.dim }}>— OWS signing allowed</span>
          </div>
          {tx.alert_1099 && (
            <div style={{ fontSize: 14, color: C.red, background: 'rgba(239,68,68,0.12)', padding: '6px 16px', borderRadius: 8, fontWeight: 700, letterSpacing: '0.5px' }}>
              1099 THRESHOLD EXCEEDED — $600+ to this counterparty
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function TaxField({ label, value, color, large }) {
  return (
    <div style={{ minWidth: large ? 160 : 120 }}>
      <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: large ? 24 : 16, fontWeight: large ? 700 : 500, color, fontFamily: mono }}>{value}</div>
    </div>
  );
}

function SummarySlide({ frame }) {
  const op = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const { summary } = data;

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: op }}>
      <div style={{ fontSize: 14, color: C.purple, letterSpacing: 3, marginBottom: 24, textTransform: 'uppercase' }}>
        Session Summary
      </div>
      <div style={{ display: 'flex', gap: 32, marginBottom: 40 }}>
        <SummaryBox label="Total Payments" value={`$${summary.total_payments.toLocaleString()}`} color={C.blue} />
        <SummaryBox label="Tax Obligations" value={`$${summary.total_tax.toFixed(2)}`} color={C.amber} />
        <SummaryBox label="Transactions" value={summary.tx_count} color={C.green} />
        <SummaryBox label="1099 Alerts" value={summary.alerts_1099} color={C.red} />
      </div>
      <div style={{ fontSize: 16, color: C.dim, textAlign: 'center', maxWidth: 600, lineHeight: 1.7 }}>
        Every transaction was tax-checked before the wallet signed.
        <br />
        Audit trail logged. 1099 thresholds monitored in real time.
      </div>
    </AbsoluteFill>
  );
}

function SummaryBox({ label, value, color }) {
  return (
    <div style={{ background: `${color}12`, border: `1px solid ${color}33`, borderRadius: 16, padding: '24px 36px', textAlign: 'center', minWidth: 160 }}>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 40, fontWeight: 800, color, fontFamily: mono, letterSpacing: '-2px' }}>{value}</div>
    </div>
  );
}

function CTASlide({ frame }) {
  const op = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: op }}>
      <div style={{ fontSize: 56, fontWeight: 800, color: C.text, letterSpacing: '-2px', textAlign: 'center', marginBottom: 24 }}>
        Calculate before you sign.
      </div>
      <div style={{ fontSize: 20, color: C.muted, marginBottom: 12, fontFamily: mono }}>
        github.com/AgentTax/agenttax-ows
      </div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 16 }}>
        <span style={{ fontSize: 22, color: C.blue, fontWeight: 700 }}>AgentTax.io</span>
        <span style={{ color: C.dim, fontSize: 18 }}>×</span>
        <span style={{ fontSize: 22, color: C.green, fontWeight: 700 }}>Open Wallet Standard</span>
      </div>
    </AbsoluteFill>
  );
}
