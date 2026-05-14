import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });

function LocationMarker({ setLocation }) {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setPosition([lat, lng]);
      setLocation({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
    },
  });
  return position ? <Marker position={position} /> : null;
}

function ChangeMapView({ location }) {
  const map = useMap();
  if (location?.lat && location?.lng) {
    map.setView([location.lat, location.lng], 15);
  }
  return null;
}

export default function MapPreview({ location, setLocation }) {
  const [address, setAddress] = useState("");
  const [searching, setSearching] = useState(false);

  const searchLocation = async () => {
    if (!address.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setLocation({ lat, lng, address: data[0].display_name });
      } else {
        alert("Location not found. Try a more specific address.");
      }
    } catch {
      alert("Error fetching location. Check internet connection.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="map-card">
      {/* Search header */}
      <div className="map-card-header">
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          📍 Select Location on Map
        </span>
      </div>

      {/* Search bar */}
      <div style={{ padding: '0.6rem 0.75rem', background: 'var(--bg-white)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search for address or landmark..."
          value={address}
          onChange={e => setAddress(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchLocation()}
          style={{ margin: 0, flex: 1, background: 'var(--bg-muted)' }}
        />
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={searchLocation}
          disabled={searching}
        >
          {searching ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : 'Search'}
        </button>
      </div>

      {/* Map */}
      <div style={{ height: 300 }}>
        <MapContainer center={[18.7726, 84.4097]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker setLocation={setLocation} />
          <ChangeMapView location={location} />
          {location?.lat && <Marker position={[location.lat, location.lng]} />}
        </MapContainer>
      </div>

      {/* Selected location */}
      {location?.lat ? (
        <div className="map-location-info">
          <span>📍</span>
          <span style={{ flex: 1 }}>{location.address}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </span>
        </div>
      ) : (
        <div className="map-hint">
          💡 Click anywhere on the map to drop a pin, or use the search box above
        </div>
      )}
    </div>
  );
}
