'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { userAPI } from '@/utils/api';

const DOMAIN_COLORS = {
  AI: 'var(--signal)', ML: 'var(--signal)',
  DSA: 'var(--amber)', OS: 'var(--amber)',
  Java: 'var(--blue-accent)', FS: 'var(--blue-accent)',
  HR: 'var(--crimson)',
};

function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ padding: '24px 28px', flex: 1, minWidth: 160 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>
      <p style={{
        fontFamily: 'var(--font-display)', fontSize: 32,
        fontWeight: 800, color: 'var(--signal)', lineHeight: 1,
      }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="card" style={{ padding: '10px 14px', fontSize: 13 }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Session {label}</p>
        <p style={{ color: 'var(--signal)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {payload[0].value?.toFixed(1)} / 10
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router   = useRouter();

  const [sessions, setSessions]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessRes, statsRes] = await Promise.all([
          userAPI.getSessions(),
          userAPI.getStats(),
        ]);
        setSessions(sessRes.data.sessions || []);
        setStats(statsRes.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = sessions.slice(-10).map((s, i) => ({
    session: i + 1,
    score:   s.averageScore,
  }));

  const domainData = stats?.domainPerformance
    ? Object.entries(stats.domainPerformance).map(([domain, score]) => ({ domain, score }))
    : [];

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navbar />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 28,
                fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6,
              }}>
                Welcome back, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                Track your progress and keep practicing
              </p>
            </div>
            <Link href="/setup" className="btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
              + Start New Interview
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[1,2,3].map(i => (
                <div key={i} className="card shimmer" style={{ height: 100 }} />
              ))}
            </div>
          ) : (
            <>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
                <StatCard
                  label="Total Sessions"
                  value={stats?.totalSessions ?? sessions.length}
                  sub="interviews completed"
                />
                <StatCard
                  label="Average Score"
                  value={stats?.averageScore ? `${stats.averageScore.toFixed(1)}` : '—'}
                  sub="out of 10"
                />
                <StatCard
                  label="Best Domain"
                  value={stats?.bestDomain ?? '—'}
                  sub="highest avg score"
                />
              </div>

              {/* Charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>

                {/* Score trend */}
                <div className="card" style={{ padding: 24 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>
                    Score Trend
                  </p>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={chartData}>
                        <XAxis
                          dataKey="session"
                          stroke="rgba(255,255,255,0.15)"
                          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 10]}
                          stroke="rgba(255,255,255,0.15)"
                          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone" dataKey="score"
                          stroke="var(--signal)" strokeWidth={2}
                          dot={{ fill: 'var(--signal)', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No sessions yet</p>
                    </div>
                  )}
                </div>

                {/* Domain performance */}
                <div className="card" style={{ padding: 24 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>
                    Domain Performance
                  </p>
                  {domainData.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {domainData.map(({ domain, score }) => (
                        <div key={domain}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{domain}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: DOMAIN_COLORS[domain] || 'var(--signal)' }}>
                              {score.toFixed(1)}
                            </span>
                          </div>
                          <div className="score-bar">
                            <div className="score-fill-signal" style={{ width: `${(score / 10) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data yet</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Past sessions table */}
              <div className="card" style={{ padding: 24 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>
                  Past Sessions
                </p>
                {sessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <p style={{ fontSize: 32, marginBottom: 12 }}>🎯</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No sessions yet. Start your first interview!</p>
                    <Link href="/setup" className="btn-primary" style={{ display: 'inline-flex', marginTop: 20, fontSize: 14 }}>
                      Start Interview →
                    </Link>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          {['Date', 'Domain', 'Difficulty', 'Questions', 'Score', 'Trend', ''].map(h => (
                            <th key={h} style={{
                              textAlign: 'left', padding: '8px 12px',
                              fontSize: 11, color: 'var(--text-muted)',
                              fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
                              fontWeight: 500,
                            }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((s, i) => (
                          <tr key={s._id || i} style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            transition: 'background 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)' }}>
                              {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span className="badge badge-signal">{s.domain}</span>
                            </td>
                            <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)' }}>
                              {s.difficulty}
                            </td>
                            <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
                              {s.totalQuestions}
                            </td>
                            <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--signal)', fontWeight: 600 }}>
                              {s.averageScore?.toFixed(1)}
                            </td>
                            <td style={{ padding: '12px', fontSize: 16 }}>
                              {s.averageScore >= 7 ? '📈' : s.averageScore >= 5 ? '➡️' : '📉'}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <button
                                onClick={() => router.push(`/report?sessionId=${s._id}`)}
                                className="btn-ghost"
                                style={{ padding: '6px 14px', fontSize: 12 }}
                              >
                                View Report
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}