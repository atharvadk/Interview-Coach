'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const DOMAINS = ['AI', 'ML', 'DSA', 'OS', 'Java', 'Full Stack', 'HR'];

const FEATURES = [
  { icon: '🎯', title: 'Adaptive Difficulty', desc: 'Questions get harder or easier based on your performance in real time.' },
  { icon: '🧠', title: 'Semantic Scoring', desc: 'AI evaluates meaning, not just keywords — just like a real interviewer.' },
  { icon: '😊', title: 'Emotion Analysis', desc: 'Live webcam tracks confidence and stress levels during your answers.' },
  { icon: '🎙', title: 'Speech to Text', desc: 'Answer by speaking naturally. Your words are transcribed instantly.' },
  { icon: '📊', title: 'Detailed Reports', desc: 'Get a full breakdown of every answer with scores and model answers.' },
  { icon: '⚡', title: 'Instant Feedback', desc: 'Know exactly what you missed and how to improve after every question.' },
];

const STEPS = [
  { num: '01', title: 'Choose Your Domain', desc: 'Pick from AI, ML, DSA, OS, Java, Full Stack or HR interviews.' },
  { num: '02', title: 'Answer Questions', desc: 'Speak your answers naturally. The AI listens and evaluates in real time.' },
  { num: '03', title: 'Get Your Report', desc: 'Review detailed feedback, scores, and model answers for every question.' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero */}
      <section className="grid-bg" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: -100, left: '20%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,179,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 50, right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(77,171,247,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '120px 24px 100px',
          position: 'relative', zIndex: 1, textAlign: 'center',
        }}>
          {/* Tag */}
          <div style={{ display: 'inline-flex', marginBottom: 24 }}>
            <span className="badge badge-signal" style={{ fontSize: 12, padding: '5px 14px' }}>
              ⚡ AI-Powered Interview Training
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 7vw, 80px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: 24,
          }}>
            Practice Smarter,<br />
            <span style={{ color: 'var(--signal)' }}>Get Hired Faster</span>
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            maxWidth: 560, margin: '0 auto 40px',
            lineHeight: 1.7,
          }}>
            Simulate real interviews with adaptive AI. Get scored on semantics,
            keywords, grammar and confidence — then improve with instant feedback.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>
              Get Started Free →
            </Link>
            <Link href="/login" className="btn-ghost" style={{ fontSize: 16, padding: '14px 36px' }}>
              Login
            </Link>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: 48, justifyContent: 'center',
            marginTop: 64, flexWrap: 'wrap',
          }}>
            {[
              { val: '82%', label: 'Avg score improvement' },
              { val: '64%', label: 'Fewer conceptual errors' },
              { val: '0.86', label: 'AI vs human correlation' },
            ].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 36, fontWeight: 800,
                  color: 'var(--signal)', lineHeight: 1,
                }}>
                  {val}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--signal)', letterSpacing: '0.1em', marginBottom: 12 }}>
            HOW IT WORKS
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Three steps to interview-ready
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {STEPS.map(({ num, title, desc }) => (
            <div key={num} className="card card-hover" style={{ padding: 32, position: 'relative' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 56, fontWeight: 800,
                color: 'rgba(0,255,179,0.08)',
                lineHeight: 1, display: 'block', marginBottom: 16,
              }}>
                {num}
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
                {title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Domains */}
      <section style={{ padding: '60px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 24 }}>
            SUPPORTED DOMAINS
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {DOMAINS.map(d => (
              <span key={d} className="badge badge-signal" style={{ fontSize: 13, padding: '7px 18px' }}>
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--signal)', letterSpacing: '0.1em', marginBottom: 12 }}>
            FEATURES
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Everything you need to ace interviews
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="card card-hover" style={{ padding: 28 }}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 14 }}>{icon}</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
                {title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section style={{
        padding: '100px 24px',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        background: 'linear-gradient(180deg, transparent, rgba(0,255,179,0.03))',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 800, letterSpacing: '-0.02em',
          marginBottom: 20,
        }}>
          Ready to start practicing?
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 36 }}>
          Join students who improved their scores by 82% in just 6 sessions.
        </p>
        <Link href="/register" className="btn-primary" style={{ fontSize: 16, padding: '14px 40px' }}>
          Start for Free →
        </Link>
      </section>

    </div>
  );
}