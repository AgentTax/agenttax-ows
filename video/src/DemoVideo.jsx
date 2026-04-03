import { useCurrentFrame, interpolate, spring, useVideoConfig, Sequence, AbsoluteFill } from 'remotion';

const C = {
  bg: '#0A0E17', card: '#111827', border: '#1e293b', text: '#e2e8f0',
  muted: '#64748b', blue: '#3b82f6', green: '#10b981', amber: '#f59e0b',
  red: '#ef4444', purple: '#8b5cf6',
};

const font = "'Inter', -apple-system, sans-serif";
const mono = "'JetBrains Mono', monospace";

const TRANSACTIONS = [
  { name: 'AI Compute', chain: 'Base', amount: 500, tax: 25, jurisdiction: 'Texas', rate: '6.25%', to: '0x7a25...488D', type: 'compute' },
  { name: 'Research Data', chain: 'Ethereum', amount: 300, tax: 19.50, jurisdiction: 'Washington', rate: '6.50%', to: '0xdAC1...1ec7', type: 'research' },
  { name: 'Content Gen', chain: 'Base', amount: 200, tax: 0, jurisdiction: 'Florida', rate: '0%', to: '0x7a25...488D', type: 'content' },
  { name: 'Consulting', chain: 'Polygon', amount: 150, tax: 9.94, jurisdiction: 'New Jersey', rate: '6.625%', to: '0x2791...4174', type: 'consulting' },
  { name: 'Compute (1099!)', chain: 'Base', amount: 500, tax: 25, jurisdiction: 'Texas', rate: '6.25%', to: '0x7a25...488D', type: 'compute', alert: true },
];

export const DemoVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: font }}>
      {/* Background gradient orbs */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* Intro */}
      <Sequence from={0} durationInFrames={90}>
        <IntroSlide frame={frame} fps={fps} />
      </Sequence>

      {/* Problem statement */}
      <Sequence from={90} durationInFrames={75}>
        <ProblemSlide frame={frame - 90} fps={fps} />
      </Sequence>

      {/* Transaction flow */}
      <Sequence from={165} durationInFrames={180}>
        <TransactionFlow frame={frame - 165} fps={fps} />
      </Sequence>

      {/* Dashboard preview */}
      <Sequence from={345} durationInFrames={60}>
        <DashboardSlide frame={frame - 345} fps={fps} />
      </Sequence>

      {/* CTA */}
      <Sequence from={405} durationInFrames={45}>
        <CTASlide frame={frame - 405} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

function IntroSlide({ frame, fps }) {
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const subtitleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });
  const badgeOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ opacity: badgeOpacity, fontSize: 18, color: C.muted, letterSpacing: 4, marginBottom: 24, textTransform: 'uppercase' }}>
        OWS Hackathon Entry
      </div>
      <div style={{ opacity: titleOpacity, fontSize: 72, fontWeight: 800, letterSpacing: '-3px', color: C.text, textAlign: 'center', lineHeight: 1.1 }}>
        <span style={{ color: C.blue }}>AgentTax</span>
        <span style={{ color: C.dim }}> x </span>
        <span style={{ color: C.green }}>OWS</span>
      </div>
      <div style={{ opacity: subtitleOpacity, fontSize: 28, color: C.muted, marginTop: 20, textAlign: 'center', maxWidth: 700 }}>
        Tax-compliant agent payments.
        <br />
        Calculate before you sign.
      </div>
    </AbsoluteFill>
  );
}

function ProblemSlide({ frame, fps }) {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const items = [
    'Sales tax varies 0% - 10.25% by state',
    '$600+ to one counterparty = 1099 required',
    'Use tax applies when seller doesn\'t collect',
    'No agent handles this today',
  ];

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 140px', opacity }}>
      <div style={{ fontSize: 16, color: C.amber, letterSpacing: 3, marginBottom: 16, textTransform: 'uppercase' }}>The Problem</div>
      <div style={{ fontSize: 44, fontWeight: 700, color: C.text, marginBottom: 40, letterSpacing: '-1px' }}>
        AI agents transact on-chain.<br />Tax obligations are invisible.
      </div>
      {items.map((item, i) => {
        const itemOpacity = interpolate(frame, [10 + i * 10, 20 + i * 10], [0, 1], { extrapolateRight: 'clamp' });
        return (
          <div key={i} style={{ opacity: itemOpacity, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: C.amber, flexShrink: 0 }} />
            <span style={{ fontSize: 22, color: C.muted }}>{item}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

function TransactionFlow({ frame, fps }) {
  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', padding: '40px 80px' }}>
      <div style={{ fontSize: 16, color: C.green, letterSpacing: 3, marginBottom: 8, textTransform: 'uppercase' }}>Live Demo</div>
      <div style={{ fontSize: 36, fontWeight: 700, color: C.text, marginBottom: 24, letterSpacing: '-1px' }}>
        5 Agent Payments, Tax-Checked Before Signing
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {TRANSACTIONS.map((tx, i) => {
          const startFrame = i * 34;
          const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], { extrapolateRight: 'clamp' });
          const slideX = interpolate(frame, [startFrame, startFrame + 15], [40, 0], { extrapolateRight: 'clamp' });

          return (
            <div key={i} style={{
              opacity,
              transform: `translateX(${slideX}px)`,
              background: tx.alert ? 'rgba(239,68,68,0.08)' : C.card,
              border: `1px solid ${tx.alert ? C.red : C.border}`,
              borderRadius: 12,
              padding: '14px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: mono, color: C.text, minWidth: 100 }}>
                  ${tx.amount}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{tx.name}</div>
                  <div style={{ fontSize: 12, color: C.dim }}>{tx.chain} &middot; {tx.type} &middot; {tx.to}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {tx.alert && (
                  <div style={{ fontSize: 12, color: C.red, background: 'rgba(239,68,68,0.15)', padding: '4px 12px', borderRadius: 6, fontWeight: 700 }}>
                    1099 ALERT
                  </div>
                )}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: tx.tax > 0 ? C.amber : C.green, fontFamily: mono }}>
                    {tx.tax > 0 ? `$${tx.tax.toFixed(2)}` : 'No tax'}
                  </div>
                  <div style={{ fontSize: 11, color: C.dim }}>{tx.jurisdiction} ({tx.rate})</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function DashboardSlide({ frame, fps }) {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const total = TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
  const totalTax = TRANSACTIONS.reduce((s, t) => s + t.tax, 0);

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity }}>
      <div style={{ fontSize: 16, color: C.purple, letterSpacing: 3, marginBottom: 16, textTransform: 'uppercase' }}>Dashboard</div>
      <div style={{ display: 'flex', gap: 40 }}>
        <StatBox label="Total Payments" value={`$${total.toLocaleString()}`} color={C.blue} />
        <StatBox label="Tax Obligations" value={`$${totalTax.toFixed(2)}`} color={C.amber} />
        <StatBox label="Transactions" value="5" color={C.green} />
        <StatBox label="1099 Alerts" value="1" color={C.red} />
      </div>
      <div style={{ marginTop: 32, fontSize: 18, color: C.muted, textAlign: 'center' }}>
        Real-time tax tracking across chains and jurisdictions
      </div>
    </AbsoluteFill>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ background: `${color}12`, border: `1px solid ${color}33`, borderRadius: 16, padding: '24px 36px', textAlign: 'center' }}>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 40, fontWeight: 800, color, fontFamily: mono, letterSpacing: '-2px' }}>{value}</div>
    </div>
  );
}

function CTASlide({ frame, fps }) {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity }}>
      <div style={{ fontSize: 52, fontWeight: 800, color: C.text, letterSpacing: '-2px', textAlign: 'center', marginBottom: 20 }}>
        Calculate before you sign.
      </div>
      <div style={{ fontSize: 22, color: C.muted, marginBottom: 32 }}>
        github.com/AgentTax/agenttax-ows
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 20, color: C.blue, fontWeight: 600 }}>AgentTax.io</span>
        <span style={{ color: C.dim }}>x</span>
        <span style={{ fontSize: 20, color: C.green, fontWeight: 600 }}>Open Wallet Standard</span>
      </div>
    </AbsoluteFill>
  );
}
