
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup,
  useMapEvents, useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Fix broken marker icon in Vite/Webpack ────────────────────────────────────
const markerIconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl:       markerIconUrl,
  shadowUrl:     markerShadowUrl,
  iconSize:      [25, 41],
  iconAnchor:    [12, 41],
  popupAnchor:   [1, -34],
  shadowSize:    [41, 41],
});

// ── Move map view when position changes ───────────────────────────────────────
function MapCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position?.lat && position?.lng) {
      map.setView([position.lat, position.lng], 16, { animate: true });
    }
  }, [position?.lat, position?.lng]);
  return null;
}

// ── Handle map click → trigger reverse geocode ────────────────────────────────
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

// ── Parse Nominatim address_components into clean fields ──────────────────────
function parseAddress(addr = {}) {
  return {
    street:   [addr.house_number, addr.road, addr.pedestrian, addr.footway]
                .filter(Boolean).join(', '),
    area:     addr.neighbourhood || addr.suburb || addr.residential || addr.hamlet || '',
    city:     addr.city || addr.town || addr.village || addr.municipality || '',
    district: addr.county || addr.state_district || addr.district || '',
    state:    addr.state || '',
    pincode:  addr.postcode || '',
    country:  addr.country || '',
  };
}

// ── Address detail row ────────────────────────────────────────────────────────
function AddressRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
      padding: '0.45rem 0', borderBottom: '1px solid var(--border)',
      fontSize: '0.825rem',
    }}>
      <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
      <span style={{ color: 'var(--text-muted)', minWidth: 68, fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--text)', lineHeight: 1.4 }}>{value}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LocationPicker({ value, onChange }) {
  const DEFAULT = { lat: 18.7726, lng: 84.4097 }; // Palasa, AP

  const [query,       setQuery]       = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSug,     setShowSug]     = useState(false);
  const [fetching,    setFetching]    = useState(false);
  const [locating,    setLocating]    = useState(false);

  const debounceRef = useRef(null);
  const sugRef      = useRef(null);

  const position = value?.lat && value?.lng
    ? { lat: value.lat, lng: value.lng }
    : null;

  // ── Autocomplete (debounced 450ms) ────────────────────────────────────────
  const fetchSuggestions = useCallback(async (q) => {
    if (q.length < 3) { setSuggestions([]); setShowSug(false); return; }
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=6&countrycodes=in`,
        { headers: { 'Accept-Language': 'en-IN,en' } }
      );
      const data = await res.json();
      setSuggestions(data);
      setShowSug(true);
    } catch { setSuggestions([]); }
  }, []);

  const handleQueryChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 450);
  };

  // ── Select suggestion from dropdown ──────────────────────────────────────
  const handleSelect = (place) => {
    const lat    = parseFloat(place.lat);
    const lng    = parseFloat(place.lon);
    const parsed = parseAddress(place.address);
    const fullAddress = place.display_name;

    setQuery(fullAddress);
    setSuggestions([]);
    setShowSug(false);
    onChange({ address: fullAddress, ...parsed, lat, lng });
  };

  // ── Reverse geocode (map click or GPS) ───────────────────────────────────
  const reverseGeocode = useCallback(async (lat, lng) => {
    setFetching(true);
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
        { headers: { 'Accept-Language': 'en-IN,en' } }
      );
      const data = await res.json();
      const parsed     = parseAddress(data.address);
      const fullAddress = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setQuery(fullAddress);
      onChange({ address: fullAddress, ...parsed, lat, lng });
    } catch {
      const addr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setQuery(addr);
      onChange({ address: addr, street: '', area: '', city: '', district: '', state: '', pincode: '', lat, lng });
    } finally { setFetching(false); }
  }, [onChange]);

  // ── GPS location ──────────────────────────────────────────────────────────
  const handleMyLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported by your browser.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        reverseGeocode(coords.latitude, coords.longitude);
        setLocating(false);
      },
      () => { alert('Location access denied. Please allow GPS access.'); setLocating(false); },
      { timeout: 10000 }
    );
  };

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (sugRef.current && !sugRef.current.contains(e.target)) setShowSug(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

      {/* ── Search bar ── */}
      <div ref={sugRef} style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute', left: '0.75rem', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
              pointerEvents: 'none', fontSize: '0.9rem',
            }}>🔍</span>
            <input
              className="form-input"
              style={{ paddingLeft: '2.25rem', margin: 0 }}
              placeholder="Search area, street, landmark... (e.g. Palasa Bus Stand)"
              value={query}
              onChange={handleQueryChange}
              onFocus={() => suggestions.length && setShowSug(true)}
              autoComplete="off"
            />
            {fetching && (
              <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                <span className="spinner" />
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleMyLocation}
            disabled={locating}
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            title="Use my current GPS location"
          >
            {locating ? <span className="spinner" /> : '📍 My Location'}
          </button>
        </div>

        {/* Suggestion dropdown */}
        {showSug && suggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            zIndex: 9999, background: 'var(--bg-white)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)', overflow: 'hidden',
          }}>
            {suggestions.map((s, i) => (
              <button
                key={i} type="button"
                onMouseDown={() => handleSelect(s)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                  width: '100%', padding: '0.65rem 0.875rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                  borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                }}
                onMouseOver={e  => e.currentTarget.style.background = 'var(--primary-bg)'}
                onMouseOut={e   => e.currentTarget.style.background = 'none'}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>📍</span>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                    {s.name || s.display_name.split(',')[0]}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                    {s.display_name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Map ── */}
      <div style={{
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          padding: '0.4rem 0.75rem', background: 'var(--bg-muted)',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500,
        }}>
          🗺️ Click anywhere on the map to pin location · Drag the marker to adjust
        </div>

        <div style={{ height: 300 }}>
          <MapContainer
            center={position ? [position.lat, position.lng] : [DEFAULT.lat, DEFAULT.lng]}
            zoom={position ? 15 : 12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onMapClick={reverseGeocode} />
            <MapCenter position={position} />
            {position && (
              <Marker
                position={[position.lat, position.lng]}
                icon={customIcon}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    reverseGeocode(lat, lng);
                  },
                }}
              >
                <Popup>
                  <div style={{ fontSize: '0.78rem', minWidth: 160 }}>
                    <strong>📍 Selected Location</strong><br />
                    {value?.city && <span>{value.city}</span>}
                    {value?.state && <span>, {value.state}</span>}<br />
                    <span style={{ color: '#666' }}>
                      {value?.lat?.toFixed(5)}, {value?.lng?.toFixed(5)}
                    </span>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>

      {/* ── Address breakdown card ── */}
      {value?.lat && (
        <div style={{
          background: 'var(--bg-white)',
          border: '1px solid var(--primary-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Header */}
          <div style={{
            background: 'var(--primary-bg)',
            borderBottom: '1px solid var(--primary-border)',
            padding: '0.6rem 0.875rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📋 Detected Address Details
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', opacity: 0.7 }}>
              Auto-filled from map
            </span>
          </div>

          {/* Address rows */}
          <div style={{ padding: '0.25rem 0.875rem 0.5rem' }}>
            <AddressRow icon="🛣️"  label="Street"   value={value.street}   />
            <AddressRow icon="🏘️"  label="Area"     value={value.area}     />
            <AddressRow icon="🏙️"  label="City"     value={value.city}     />
            <AddressRow icon="🗺️"  label="District" value={value.district} />
            <AddressRow icon="📍"  label="State"    value={value.state}    />
            <AddressRow icon="📮"  label="Pincode"  value={value.pincode}  />

            {/* Coordinates */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.45rem 0',
              fontSize: '0.825rem',
            }}>
              <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>🌐</span>
              <span style={{ color: 'var(--text-muted)', minWidth: 68, fontWeight: 600, flexShrink: 0 }}>
                Coordinates
              </span>
              <span style={{
                fontFamily: 'monospace', fontSize: '0.8rem',
                background: 'var(--bg-muted)', padding: '2px 8px',
                borderRadius: '4px', color: 'var(--primary)',
                border: '1px solid var(--border)',
              }}>
                {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
              </span>
            </div>
          </div>

          {/* Full address at bottom */}
          {value.address && (
            <div style={{
              borderTop: '1px solid var(--border)',
              padding: '0.5rem 0.875rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-muted)',
              lineHeight: 1.5,
            }}>
              <span style={{ fontWeight: 600 }}>Full Address: </span>
              {value.address}
            </div>
          )}
        </div>
      )}

      {/* Placeholder when no location selected */}
      {!value?.lat && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'var(--bg-muted)',
          border: '1px dashed var(--border-dark)',
          borderRadius: 'var(--radius)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}>
          📍 No location selected yet — search above or click on the map
        </div>
      )}

    </div>
  );
}