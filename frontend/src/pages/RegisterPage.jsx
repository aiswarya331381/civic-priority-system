import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { addNotif } = useNotif();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (form.password !== form.confirmPassword) { setErr('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      addNotif('success', 'Registration Successful', 'Welcome to the Civic Issue Portal');
      navigate('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.message || e.response?.data?.errors?.[0]?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '2rem' }}>🏛️</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            Government of Andhra Pradesh
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-icon">🏛️</div>
            <h1>Citizen Registration</h1>
            <p>Palasa Municipal Corporation</p>
          </div>

          <div className="auth-gov-banner">
            📋 Register to report and track civic issues in your area
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label req">Full Name</label>
              <input className="form-input" placeholder="As per official records"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label req">Email Address</label>
              <input className="form-input" type="email" placeholder="Your active email address"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label req">Password</label>
              <input className="form-input" type="password" placeholder="Minimum 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label req">Confirm Password</label>
              <input className="form-input" type="password" placeholder="Re-enter your password"
                value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>

            <div className="info-box">
              👤 You are registering as a <strong>Citizen</strong>. Admin access is granted only by the system administrator.
            </div>

            {err && (
              <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius)', padding: '0.6rem 0.875rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--red)', fontWeight: 500 }}>
                ⚠️ {err}
              </div>
            )}

            <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Registering...</> : 'Register as Citizen'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign In</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          © Palasa Municipal Corporation, Andhra Pradesh. All rights reserved.
        </div>
      </div>
    </div>
  );
}
