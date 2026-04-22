'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/utils/api';
import { validateEmail } from '@/utils/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!validateEmail(form.email))   errs.email    = 'Enter a valid email address';
    if (!form.password)               errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await authAPI.login({
        email:    form.email,
        password: form.password,
      });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setErrors({ form: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      {/* Glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,179,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--signal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, margin: '0 auto 16px',
          }}>
            ⚡
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26, fontWeight: 800,
            letterSpacing: '-0.02em', marginBottom: 8,
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Login to continue your practice
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Form-level error */}
            {errors.form && (
              <div style={{
                background: 'rgba(255,71,87,0.08)',
                border: '1px solid rgba(255,71,87,0.25)',
                borderRadius: 8, padding: '12px 16px',
                fontSize: 14, color: 'var(--crimson)',
              }}>
                {errors.form}
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                className={`input-field ${errors.email ? 'error' : ''}`}
              />
              {errors.email && (
                <p style={{ fontSize: 12, color: 'var(--crimson)', marginTop: 6 }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Your password"
                  className={`input-field ${errors.password ? 'error' : ''}`}
                  style={{ paddingRight: 44 }}
                />
                <button
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 16, color: 'var(--text-muted)',
                  }}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: 12, color: 'var(--crimson)', marginTop: 6 }}>{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 4 }}
            >
              {loading ? 'Logging in...' : 'Login →'}
            </button>

          </div>
        </div>

        {/* Register link */}
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--signal)', textDecoration: 'none', fontWeight: 600 }}>
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}