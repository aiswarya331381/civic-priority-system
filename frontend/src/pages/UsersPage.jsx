import { useState, useEffect } from 'react';
import { useNotif } from '../context/NotifContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/shared/Spinner';
import { fmt } from '../utils/helpers';
import api from '../utils/api';

export default function UsersPage() {
  const { addNotif } = useNotif();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null); // user pending "Make Admin" confirmation
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  }, []);

  const toggleUser = async (id) => {
    try {
      const res = await api.put(`/users/${id}/toggle`);
      setUsers(u => u.map(x => x._id === id ? res.data.user : x));
      addNotif('success', 'User status updated');
    } catch (e) { addNotif('error', e.response?.data?.message || 'Failed'); }
  };

  const confirmMakeAdmin = async () => {
    if (!confirmTarget) return;
    setPromoting(true);
    try {
      // Backend re-verifies the requester is an admin before applying this —
      // this call is not sufficient on its own, it's just the UI trigger.
      const res = await api.post(`/users/${confirmTarget._id}/make-admin`);
      setUsers(u => u.map(x => x._id === confirmTarget._id ? res.data.user : x));
      addNotif('success', 'User promoted', `${confirmTarget.name} is now an administrator`);
      setConfirmTarget(null);
    } catch (e) {
      addNotif('error', 'Could not promote user', e.response?.data?.message || 'Failed');
    } finally { setPromoting(false); }
  };

  if (loading) return <div className="page center-pad"><Spinner /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-subtitle">Manage registered citizens and their access</div>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--bg-muted)', border: '1px solid var(--border)', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius)', fontWeight: 500 }}>
          {users.length} Registered User{users.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="content">
        <div className="card" style={{ padding: 0 }}>
  <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users found</td></tr>
              ) : users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.role === 'admin' ? 'var(--primary)' : 'var(--bg-muted)', color: u.role === 'admin' ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, border: '1px solid var(--border)' }}>
                        {(u.avatar || u.name?.slice(0, 2) || 'U').toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                 <td>{u.phone || 'N/A'}</td>
                  <td>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 8px', borderRadius: '4px', background: u.role === 'admin' ? 'var(--primary-bg)' : 'var(--bg-muted)', color: u.role === 'admin' ? 'var(--primary)' : 'var(--text-secondary)', border: `1px solid ${u.role === 'admin' ? 'var(--primary-border)' : 'var(--border)'}` }}>
                      {u.role === 'admin' ? '🛡️ ADMIN' : 'USER'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{fmt(u.createdAt)}</td>
                  <td>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: u.isActive ? 'var(--green)' : 'var(--red)' }}>
                      {u.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {u.role !== 'admin' && (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setConfirmTarget(u)}
                          title="Grant this user administrator access"
                        >
                          🛡️ Make Admin
                        </button>
                      )}
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleUser(u._id)}
                        disabled={currentUser && u._id === currentUser._id}
                        title={currentUser && u._id === currentUser._id ? 'You cannot deactivate your own account' : undefined}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
         </table>
</div>
</div>
      </div>

      {/* ── Make Admin confirmation dialog ── */}
      {confirmTarget && (
        <div
          onClick={() => !promoting && setConfirmTarget(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 420, background: 'var(--bg-white)' }}>
            <div style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '0.5rem' }}>🛡️</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text)' }}>
              Make {confirmTarget.name} an administrator?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Are you sure you want to make this user an administrator? They will gain full access to
              User Management, Analytics, and all admin-only controls.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmTarget(null)} disabled={promoting}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={confirmMakeAdmin} disabled={promoting}>
                {promoting ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Promoting...</> : '🛡️ Make Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
