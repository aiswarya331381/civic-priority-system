import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SevBadge, StatusBadge } from '../components/shared/Badge';
import PriorityBadge from '../components/shared/PriorityBadge';
import Spinner from '../components/shared/Spinner';
import { fmt } from '../utils/helpers';
import api from '../utils/api';

export default function AdminDashboardPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/complaints/analytics').then(r => setData(r.data.analytics)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page center-pad"><Spinner /></div>;

  const { total = 0, byStatus = {}, bySeverity = {}, byPriority = {}, recent = [], topPriority = [] } = data || {};

  const Bar = ({ label, count = 0, color }) => (
    <div className="chart-row">
      <span className="chart-label">{label}</span>
      <div className="chart-track">
        <div className="chart-fill" style={{ width: total ? `${(count / total) * 100}%` : '0%', background: color }} />
      </div>
      <span className="chart-count">{count}</span>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Analytics Overview</div>
          <div className="page-subtitle">Live summary of all civic complaints and their resolution status</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setLoading(true); api.get('/complaints/analytics').then(r => setData(r.data.analytics)).finally(() => setLoading(false)); }}>
          ↻ Refresh
        </button>
      </div>

      <div className="content">

        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
          {[
            { label: 'Total',       value: total,                        color: 'var(--primary)' },
            { label: 'Pending',     value: byStatus.pending    || 0,     color: '#92400e' },
            { label: 'In Progress', value: byStatus['in-progress'] || 0, color: 'var(--cyan)' },
            { label: 'Resolved',    value: byStatus.resolved   || 0,     color: 'var(--green)' },
            { label: 'Critical',    value: bySeverity.critical || 0,     color: 'var(--red)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">By Severity</span></div>
            <div className="chart-bar">
              <Bar label="Critical" count={bySeverity.critical} color="#991b1b" />
              <Bar label="High"     count={bySeverity.high}     color="#9a3412" />
              <Bar label="Medium"   count={bySeverity.medium}   color="#92400e" />
              <Bar label="Low"      count={bySeverity.low}      color="#15803d" />
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">By Status</span></div>
            <div className="chart-bar">
              <Bar label="Pending"  count={byStatus.pending}           color="#92400e" />
              <Bar label="In Prog"  count={byStatus['in-progress']}    color="var(--cyan)" />
              <Bar label="Resolved" count={byStatus.resolved}          color="var(--green)" />
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">By Priority</span></div>
            <div className="chart-bar">
              <Bar label="Critical" count={byPriority.critical} color="#991b1b" />
              <Bar label="High"     count={byPriority.high}     color="#9a3412" />
              <Bar label="Medium"   count={byPriority.medium}   color="#92400e" />
              <Bar label="Low"      count={byPriority.low}      color="#15803d" />
            </div>
          </div>
        </div>

        {/* Top Priority — needs attention first */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ padding: '1rem 1.25rem', background: '#fef2f2', borderColor: '#fecaca' }}>
            <span className="card-title" style={{ color: '#991b1b' }}>🔴 Highest Priority — Needs Immediate Attention</span>
            <span style={{ fontSize: '0.75rem', color: '#991b1b', opacity: 0.75 }}>Sorted by priority score</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Title</th><th>Priority</th><th>Severity</th><th>Upvotes</th><th>Location</th><th>Age</th><th>Action</th></tr></thead>
              <tbody>
                {topPriority.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>✅ No unresolved complaints</td></tr>
                ) : topPriority.map(c => (
                  <tr key={c._id} style={{ background: c.priorityLevel === 'critical' ? '#fef2f2' : c.priorityLevel === 'high' ? '#fff7ed' : undefined }}>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{c.title}</td>
                    <td><PriorityBadge level={c.priorityLevel} score={c.priorityScore} /></td>
                    <td><SevBadge level={c.severity} /></td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>👍 {c.upvotes || 0}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.location?.address}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmt(c.createdAt)}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/complaints/${c._id}`)}>
                        Manage →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent complaints */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '1rem 1.25rem' }}>
            <span className="card-title">Recent Complaints</span>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/complaints')}>View All</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Title</th><th>Severity</th><th>Status</th><th>Priority</th><th>Location</th><th>Date</th></tr></thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No complaints yet</td></tr>
                ) : recent.map(c => (
                  <tr key={c._id} onClick={() => navigate(`/complaints/${c._id}`)}>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{c.title}</td>
                    <td><SevBadge level={c.severity} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><PriorityBadge level={c.priorityLevel} score={c.priorityScore} /></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.location?.address}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmt(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
