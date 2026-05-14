import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';
import ComplaintCard from '../components/complaints/ComplaintCard';
import FilterBar from '../components/complaints/FilterBar';
import Spinner from '../components/shared/Spinner';
import api from '../utils/api';
import { sevOrder } from '../utils/helpers';

export default function ComplaintsPage() {
  const { user } = useAuth();
  const { addNotif } = useNotif();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', severity: '', status: '', sort: '-createdAt' });

  useEffect(() => {
    api.get('/complaints/all')
      .then(r => setComplaints(r.data.complaints))
      .catch(() => addNotif('error', 'Failed to load complaints'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint? This cannot be undone.')) return;
    try {
      await api.delete(`/complaints/${id}`);
      setComplaints(c => c.filter(x => x._id !== id));
      addNotif('success', 'Complaint deleted');
    } catch { addNotif('error', 'Delete failed'); }
  };

  const filtered = complaints
    .filter(c => {
      const q = filters.search.toLowerCase();
      return (!q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.location?.address.toLowerCase().includes(q))
        && (!filters.severity || c.severity === filters.severity)
        && (!filters.status || c.status === filters.status);
    })
    .sort((a, b) => {
      if (filters.sort === '-severity') return sevOrder[b.severity] - sevOrder[a.severity];
      if (filters.sort === 'createdAt') return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">All Complaints</div>
          <div className="page-subtitle">Browse and search all reported civic issues</div>
        </div>
      </div>
      <div className="content">
        <FilterBar filters={filters} onChange={setFilters} count={filtered.length} />
        {loading ? (
          <div className="center-pad"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No complaints found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="cards-grid">
            {filtered.map(c => <ComplaintCard key={c._id} complaint={c} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  );
}
