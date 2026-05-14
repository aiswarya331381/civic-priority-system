import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';
import ComplaintCard from '../components/complaints/ComplaintCard';
import Spinner from '../components/shared/Spinner';
import api from '../utils/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const { addNotif } = useNotif();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    api.get('/complaints')
      .then(r => setComplaints(r.data.complaints))
      .catch(() => addNotif('error', 'Failed to load complaints'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) return;
    try {
      await api.delete(`/complaints/${id}`);
      setComplaints(c => c.filter(x => x._id !== id));
      addNotif('success', 'Complaint deleted successfully');
    } catch { addNotif('error', 'Failed to delete complaint'); }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{isAdmin ? 'Admin Dashboard' : 'My Complaints'}</div>
          <div className="page-subtitle">
            {isAdmin ? 'Overview of all submitted complaints' : `Welcome back, ${user?.name}`}
          </div>
        </div>
        {!isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>
            + Report New Issue
          </button>
        )}
      </div>

      <div className="content">
        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: 'Total Complaints', value: stats.total, color: 'var(--primary)' },
            { label: 'Pending Review',   value: stats.pending,    color: 'var(--yellow)' },
            { label: 'In Progress',      value: stats.inProgress, color: 'var(--cyan)' },
            { label: 'Resolved',         value: stats.resolved,   color: 'var(--green)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Complaints */}
        {loading ? (
          <div className="center-pad"><Spinner /></div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No complaints submitted yet</h3>
            <p>Submit your first civic issue to get started</p>
            {!isAdmin && (
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/complaints/new')}>
                + Report an Issue
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '0.875rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Showing {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} — sorted by most recent
            </div>
            <div className="cards-grid">
              {[...complaints]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(c => <ComplaintCard key={c._id} complaint={c} onDelete={handleDelete} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
