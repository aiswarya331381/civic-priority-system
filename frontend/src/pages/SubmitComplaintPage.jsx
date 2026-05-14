import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotif } from '../context/NotifContext';
import LocationPicker from '../components/shared/LocationPicker';
import ImageUploader  from '../components/shared/ImageUploader';
import api from '../utils/api';

const CATEGORIES = [
  { value: 'roads',        label: '🛣️  Roads & Potholes' },
  { value: 'water',        label: '💧 Water Supply' },
  { value: 'electricity',  label: '⚡ Electricity' },
  { value: 'sanitation',   label: '🗑️  Sanitation & Garbage' },
  { value: 'drainage',     label: '🌊 Drainage & Flooding' },
  { value: 'parks',        label: '🌳 Parks & Public Spaces' },
  { value: 'streetlights', label: '💡 Street Lights' },
  { value: 'other',        label: '📌 Other' },
];

export default function SubmitComplaintPage() {
  const { addNotif } = useNotif();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: '', description: '', severity: 'medium', category: 'other' });
  const [location, setLocation] = useState(null);
  const [images,   setImages]   = useState([]);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()       || form.title.trim().length < 10)       e.title       = 'Title must be at least 10 characters';
    if (!form.description.trim() || form.description.trim().length < 20) e.description = 'Description must be at least 20 characters';
    if (!location?.lat || !location?.lng)                                  e.location    = 'Please select a location on the map';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    try {
      // Use FormData so we can send both JSON fields and image files
      const fd = new FormData();
      fd.append('title',       form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('severity',    form.severity);
      fd.append('category',    form.category);
      fd.append('location',    JSON.stringify(location));
      images.forEach(f => fd.append('images', f));

      const res = await api.post('/complaints', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      addNotif('success', 'Complaint Submitted!', `Reference: ${res.data.complaint._id}`);
      navigate(`/complaints/${res.data.complaint._id}`);
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Submission failed';
      addNotif('error', 'Submission Failed', msg);
    } finally { setLoading(false); }
  };

  const f = (field, val) => setForm(p => ({ ...p, [field]: val }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Report a Civic Issue</div>
          <div className="page-subtitle">All fields marked * are required. Your complaint will be reviewed within 24 hours.</div>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="content">
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>

            {/* ── Section 1: Basic Info ── */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-header">
                <span className="card-title">📋 Issue Details</span>
              </div>

              <div className="form-row" style={{ marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label req">Category</label>
                  <select className="form-select" value={form.category} onChange={e => f('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label req">Severity Level</label>
                  <select className="form-select" value={form.severity} onChange={e => f('severity', e.target.value)}>
                    <option value="low">🟢 Low — Minor inconvenience</option>
                    <option value="medium">🟡 Medium — Affecting daily life</option>
                    <option value="high">🟠 High — Significant hazard</option>
                    <option value="critical">🔴 Critical — Immediate danger</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label req">Complaint Title</label>
                <input className="form-input" placeholder="Brief, specific title (e.g. Deep pothole on NH-516 near bus stand)"
                  value={form.title} onChange={e => f('title', e.target.value)} />
                {errors.title && <p className="form-error">{errors.title}</p>}
                <p className="form-hint">{form.title.length}/150 characters (minimum 10)</p>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label req">Detailed Description</label>
                <textarea className="form-textarea" rows={5}
                  placeholder="Describe the issue in detail — exact spot, how long it's been there, how many people are affected, any previous complaints..."
                  value={form.description} onChange={e => f('description', e.target.value)} />
                {errors.description && <p className="form-error">{errors.description}</p>}
                <p className="form-hint">{form.description.length}/2000 characters (minimum 20)</p>
              </div>
            </div>

            {/* ── Section 2: Location ── */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-header">
                <span className="card-title">📍 Location</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Search, click map, or use GPS</span>
              </div>
              <LocationPicker value={location} onChange={setLocation} />
              {errors.location && <p className="form-error" style={{ marginTop: '0.5rem' }}>{errors.location}</p>}
            </div>

            {/* ── Section 3: Images ── */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-header">
                <span className="card-title">📷 Photo Evidence</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optional · Max 5 photos · 2MB each</span>
              </div>
              <ImageUploader files={images} onChange={setImages} maxFiles={5} maxMB={2} />
            </div>

            {/* ── Submit ── */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Submitting...</> : '📤 Submit Complaint'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
