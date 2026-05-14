import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';
import { SevBadge, StatusBadge } from '../components/shared/Badge';
import PriorityBadge from '../components/shared/PriorityBadge';
import Spinner from '../components/shared/Spinner';
import { fmt, fmtFull } from '../utils/helpers';
import api from '../utils/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });

const AUTHORITIES = [
  'Public Works Dept','Roads & Highways','Sanitation Board',
  'Water Supply Div','Electricity Dept','Municipal Corp',
  'Traffic Police','Health Dept',
];

function StaticMap({ location }) {
  if (!location?.lat || !location?.lng) return null;
  return (
    <div style={{ height: 220, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', marginTop: '0.5rem' }}>
      <MapContainer center={[location.lat, location.lng]} zoom={15}
        style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[location.lat, location.lng]} />
      </MapContainer>
    </div>
  );
}

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addNotif } = useNotif();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [upvoting,  setUpvoting]  = useState(false);
  const [form, setForm] = useState({ status: '', assignedTo: '' });
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get(`/complaints/${id}`)
      .then(r => { setComplaint(r.data.complaint); setForm({ status: r.data.complaint.status, assignedTo: r.data.complaint.assignedTo || '' }); })
      .catch(() => { addNotif('error', 'Complaint not found'); navigate('/complaints'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/complaints/${id}`, { status: form.status, assignedTo: form.assignedTo || null });
      setComplaint(res.data.complaint);
      addNotif('success', 'Complaint updated successfully');
    } catch { addNotif('error', 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleUpvote = async () => {
    setUpvoting(true);
    try {
      const res = await api.post(`/complaints/${id}/upvote`);
      setComplaint(c => ({ ...c, upvotes: res.data.upvotes }));
      addNotif('info', res.data.upvoted ? 'Upvoted! This boosts priority.' : 'Upvote removed');
    } catch { addNotif('error', 'Failed to upvote'); }
    finally { setUpvoting(false); }
  };

  if (loading) return <div className="page center-pad"><Spinner /></div>;
  if (!complaint) return null;

  const isAdmin  = user?.role === 'admin';
  const isOwner  = complaint.userId?._id === user?._id || complaint.userId === user?._id;
  const loc      = complaint.location;
  const hasImages = complaint.images?.length > 0;

  return (
    <div className="page">
      {/* Lightbox */}
      {lightbox !== null && (
        <div onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '1rem' }}>
          <img src={complaint.images[lightbox]} alt="" style={{ maxHeight: '90vh', maxWidth: '90vw', borderRadius: 8, objectFit: 'contain' }} />
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '1rem', right: '1.25rem', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem', alignItems: 'center' }}>
            <SevBadge level={complaint.severity} />
            <StatusBadge status={complaint.status} />
            <PriorityBadge level={complaint.priorityLevel} score={complaint.priorityScore} />
          </div>
          <div className="page-title" style={{ fontSize: '1rem' }}>{complaint.title}</div>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="content">
        <div className="detail-grid">

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Description */}
            <div className="card">
              <div className="section-title">Description</div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>{complaint.description}</p>
            </div>

            {/* Images */}
            {hasImages && (
              <div className="card">
                <div className="section-title">Photo Evidence ({complaint.images.length})</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.6rem' }}>
                  {complaint.images.map((img, i) => (
                    <div key={i} onClick={() => setLightbox(i)}
                      style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '1', cursor: 'zoom-in', background: 'var(--bg-muted)' }}>
                      <img src={img} alt={`evidence-${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Click image to view full size</p>
              </div>
            )}

            {/* Location */}
            <div className="card">
              <div className="section-title">📍 Location</div>
              <StaticMap location={loc} />
              <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.8rem' }}>
                {[
                  ['Address', loc?.address],
                  ['Street',  loc?.street],
                  ['City',    loc?.city],
                  ['District',loc?.district],
                  ['State',   loc?.state],
                  ['Pincode', loc?.pincode],
                ].map(([k, v]) => v ? (
                  <div key={k}><span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{k}: </span><span>{v}</span></div>
                ) : null)}
              </div>
              {loc?.lat && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Coordinates: {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                </p>
              )}
            </div>

            {/* Timeline */}
            <div className="card">
              <div className="section-title">🕐 Progress Timeline</div>
              <div className="timeline">
                {complaint.updates.map((u, i) => (
                  <div key={i} className="timeline-item">
                    <div className={`timeline-dot ${i === complaint.updates.length - 1 ? 'tl-active' : 'tl-done'}`}>
                      {i === complaint.updates.length - 1 ? '●' : '✓'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.message}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {fmtFull(u.createdAt)}
                        {u.updatedByName && <span style={{ marginLeft: '0.5rem', color: 'var(--primary-light)' }}>by {u.updatedByName}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Details */}
            <div className="card">
              <div className="section-title">Details</div>
              {[
                ['Reference ID', <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--primary-light)' }}>{complaint._id}</span>],
                ['Category',     complaint.category?.replace(/_/g,' ')],
                ['Submitted',    fmt(complaint.createdAt)],
                ['Submitted By', complaint.userId?.name || '—'],
                ['Assigned To',  complaint.assignedTo || '—'],
                ['Priority',     <PriorityBadge level={complaint.priorityLevel} score={complaint.priorityScore} />],
              ].map(([k, v]) => (
                <div key={k} className="detail-row">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{k}</span>
                  <span style={{ fontWeight: 500, fontSize: '0.82rem', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Upvote */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>👍</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                {complaint.upvotes || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Citizens have supported this issue
              </div>
              <button className="btn btn-secondary w-full" onClick={handleUpvote} disabled={upvoting}>
                {upvoting ? <span className="spinner" /> : '👍 Support This Issue'}
              </button>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                More upvotes → higher priority for admin
              </p>
            </div>

            {/* Admin controls */}
            {isAdmin && (
              <div className="card">
                <div className="section-title">⚙️ Admin Controls</div>
                <div className="form-group">
                  <label className="form-label">Update Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="pending">⏳ Pending</option>
                    <option value="in-progress">🔧 In Progress</option>
                    <option value="resolved">✅ Resolved</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign To Authority</label>
                  <select className="form-select" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                    <option value="">— Unassigned —</option>
                    {AUTHORITIES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary w-full" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Saving...</> : '✓ Save Changes'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
