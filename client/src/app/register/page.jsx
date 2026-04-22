'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/utils/api';
import { validateEmail, validatePassword, validateName } from '@/utils/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!validateName(form.name))         errs.name     = 'Name must be at least 2 characters';
    if (!validateEmail(form.email))       errs.email    = 'Enter a valid email address';
    const passErrs = validatePassword(form.password);
    if (passErrs.length > 0)             errs.password = passErrs[0];
    if (form.password !== form.confirm)   errs.confirm  = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await authAPI.register({
        name:     form.name,
        email:    form.email,
        password: form.password,
      });
      login(data.token, data.user);
      toast.success('Account created!');
      router.push('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

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
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Start practicing interviews for free
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Atharva Kavade"
                className={`input-field ${errors.name ? 'error' : ''}`}
              />
              {errors.name && (
                <p style={{ fontSize: 12, color: 'var(--crimson)', marginTop: 6 }}>{errors.name}</p>
              )}
            </div>

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
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
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

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`input-field ${errors.confirm ? 'error' : ''}`}
                  style={{ paddingRight: 44 }}
                />
                <button
                  onClick={() => setShowConfirm(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 16, color: 'var(--text-muted)',
                  }}
                >
                  {showConfirm ? '🙈' : '👁'}
                </button>
              </div>
              {errors.confirm && (
                <p style={{ fontSize: 12, color: 'var(--crimson)', marginTop: 6 }}>{errors.confirm}</p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 4 }}
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>

          </div>
        </div>

        {/* Login link */}
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--signal)', textDecoration: 'none', fontWeight: 600 }}>
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}