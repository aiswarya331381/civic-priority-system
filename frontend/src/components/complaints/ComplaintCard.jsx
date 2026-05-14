import { useNavigate } from 'react-router-dom';
import { SevBadge, StatusBadge } from '../shared/Badge';
import PriorityBadge from '../shared/PriorityBadge';
import { fmt } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function ComplaintCard({ complaint, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="complaint-card" onClick={() => navigate(`/complaints/${complaint._id}`)}>
      <div className="card-top">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.4rem', alignItems: 'center' }}>
            <SevBadge level={complaint.severity} />
            <StatusBadge status={complaint.status} />
            {complaint.priorityLevel && <PriorityBadge level={complaint.priorityLevel} score={complaint.priorityScore} />}
          </div>
          <div className="complaint-title">{complaint.title}</div>
        </div>
        {isAdmin && (
          <button className="btn btn-danger btn-sm"
            onClick={e => { e.stopPropagation(); onDelete?.(complaint._id); }} title="Delete complaint">
            Delete
          </button>
        )}
      </div>

      <p className="complaint-desc">{complaint.description}</p>

      <div className="complaint-meta">
        <span>📍 {complaint.location?.address}</span>
        <span>📅 {fmt(complaint.createdAt)}</span>
        {complaint.category && <span>🏷️ {complaint.category}</span>}
        {complaint.images?.length > 0 && <span>📷 {complaint.images.length} photo{complaint.images.length > 1 ? 's' : ''}</span>}
        {complaint.upvotes > 0 && <span>👍 {complaint.upvotes}</span>}
      </div>

      <div className="complaint-footer">
        <div>
          {complaint.assignedTo
            ? <span className="chip">👤 {complaint.assignedTo}</span>
            : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not yet assigned</span>}
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--primary-light)', fontWeight: 500 }}>View Details →</span>
      </div>
    </div>
  );
}
