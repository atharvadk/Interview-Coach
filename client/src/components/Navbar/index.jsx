'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link href={isAuthenticated ? '/dashboard' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--signal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            ⚡
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: 17,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>
            InterviewAI
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated ? (
            <>
              {/* Avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--signal-dim), #0077FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 13, color: '#0A0A0F',
              }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>

              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {user?.name}
              </span>

              <button onClick={handleLogout} className="btn-ghost"
                style={{ padding: '7px 16px', fontSize: 13 }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost"
                style={{ padding: '7px 20px', fontSize: 14 }}>
                Login
              </Link>
              <Link href="/register" className="btn-primary"
                style={{ padding: '8px 20px', fontSize: 14 }}>
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}