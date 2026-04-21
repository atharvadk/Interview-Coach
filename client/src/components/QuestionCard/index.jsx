'use client';

const DOMAIN_COLORS = {
  AI:   'signal',
  ML:   'signal',
  DSA:  'amber',
  OS:   'amber',
  Java: 'blue',
  FS:   'blue',
  HR:   'crimson',
};

const DIFFICULTY_COLORS = {
  Easy:   'signal',
  Medium: 'amber',
  Hard:   'crimson',
};

export default function QuestionCard({ question, domain, difficulty, questionNumber, totalQuestions }) {
  const domainColor = DOMAIN_COLORS[domain] || 'signal';
  const diffColor   = DIFFICULTY_COLORS[difficulty] || 'amber';

  return (
    <div className="card" style={{ padding: 28, height: '100%' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span className={`badge badge-${domainColor}`}>{domain}</span>
        <span className={`badge badge-${diffColor}`}>{difficulty}</span>
        <span style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          Q{questionNumber} / {totalQuestions}
        </span>
      </div>

      {/* Question text */}
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 18,
        fontWeight: 600,
        lineHeight: 1.6,
        color: 'var(--text-primary)',
        letterSpacing: '-0.01em',
      }}>
        {question}
      </p>

      {/* Hint */}
      <p style={{
        marginTop: 20,
        fontSize: 13,
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}>
        💡 Take your time. Speak clearly and cover the core concepts.
      </p>

    </div>
  );
}