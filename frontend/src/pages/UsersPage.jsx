import { useState, useEffect } from 'react';
import { useNotif } from '../context/NotifContext';
import Spinner from '../components/shared/Spinner';
import { fmt } from '../utils/helpers';
import api from '../utils/api';

export default function UsersPage() {
  const { addNotif } = useNotif();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users found</td></tr>
              ) : users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.role === 'admin' ? '#1e3a8a' : '#e5e7eb', color: u.role === 'admin' ? '#fff' : '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                        {(u.avatar || u.name?.slice(0, 2) || 'U').toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 8px', borderRadius: '4px', background: u.role === 'admin' ? 'var(--primary-bg)' : 'var(--bg-muted)', color: u.role === 'admin' ? 'var(--primary)' : 'var(--text-secondary)', border: `1px solid ${u.role === 'admin' ? 'var(--primary-border)' : 'var(--border)'}` }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{fmt(u.createdAt)}</td>
                  <td>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: u.isActive ? 'var(--green)' : 'var(--red)' }}>
                      {u.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => toggleUser(u._id)}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
