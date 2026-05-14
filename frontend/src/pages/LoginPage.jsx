import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { addNotif } = useNotif();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      addNotif('success', `Welcome, ${user.name}`, `Signed in as ${user.role}`);
      navigate('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Government banner */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          {/* <div style={{ fontSize: '2rem' }}>🏛️</div> */}
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-icon">🏛️</div>
            <h1>Civic Issue Reporting System</h1>
            <p>Government of India</p>
          </div>

          <div className="auth-gov-banner">
            🔒 Secure Government Portal — Authorized Access Only
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Registered Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>

            {err && (
              <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius)', padding: '0.6rem 0.875rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--red)', fontWeight: 500 }}>
                ⚠️ {err}
              </div>
            )}

            <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Signing In...</> : 'Sign In to Portal'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            New citizen?{' '}
            <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              Create an Account
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          © Palasa Municipal Corporation, Andhra Pradesh. All rights reserved.
        </div>
      </div>
    </div>
  );
}
