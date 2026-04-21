'use client';

const SCORE_BARS = [
  { key: 'semantic',   label: 'Semantic Similarity', fillClass: 'score-fill-signal' },
  { key: 'keyword',    label: 'Keyword Match',        fillClass: 'score-fill-amber'  },
  { key: 'grammar',    label: 'Grammar Quality',      fillClass: 'score-fill-blue'   },
  { key: 'composite',  label: 'Overall Score',        fillClass: 'score-fill-signal' },
];

export default function ScoreCard({ scores = {} }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 15,
        color: 'var(--text-primary)',
        marginBottom: 20,
      }}>
        Score Breakdown
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SCORE_BARS.map(({ key, label, fillClass }) => {
          const val = scores[key] ?? 0;
          const pct = (val / 10) * 100;

          return (
            <div key={key}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: 6,
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {label}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                }}>
                  {val.toFixed(1)}
                </span>
              </div>
              <div className="score-bar">
                <div
                  className={fillClass}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}