'use client';

const EMOTION_MAP = {
  happy:     { emoji: '😊', label: 'Happy',     color: 'var(--signal)' },
  neutral:   { emoji: '😐', label: 'Neutral',   color: 'var(--text-secondary)' },
  sad:       { emoji: '😟', label: 'Nervous',   color: 'var(--blue-accent)' },
  angry:     { emoji: '😠', label: 'Stressed',  color: 'var(--crimson)' },
  surprised: { emoji: '😲', label: 'Surprised', color: 'var(--amber)' },
  fearful:   { emoji: '😨', label: 'Anxious',   color: 'var(--amber)' },
  disgusted: { emoji: '😑', label: 'Tired',     color: 'var(--text-muted)' },
  confident: { emoji: '😌', label: 'Confident', color: 'var(--signal)' },
};

export default function EmotionBadge({ emotion, confidence, timeline = [] }) {
  const info = EMOTION_MAP[emotion?.toLowerCase()] || {
    emoji: '😐', label: 'Neutral', color: 'var(--text-secondary)',
  };
  const pct = confidence ? Math.round(confidence * 100) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Current emotion */}
      <div className="card" style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{ fontSize: 32 }}>{info.emoji}</span>
        <div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600, fontSize: 15,
            color: info.color,
          }}>
            {info.label}
          </p>
          {pct !== null && (
            <p style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}>
              {pct}% confidence
            </p>
          )}
        </div>
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="card" style={{ padding: '12px 16px' }}>
          <p style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}>
            EMOTION TIMELINE
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {timeline.slice(-10).map((e, i) => {
              const em = EMOTION_MAP[e?.toLowerCase()] || { emoji: '😐' };
              return (
                <span key={i} style={{ fontSize: 18 }} title={em.label}>
                  {em.emoji}
                </span>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}