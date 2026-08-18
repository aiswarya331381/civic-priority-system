import { useState, useRef, useCallback } from 'react';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import GoogleMapsProvider, { useGoogleMaps } from './GoogleMapsProvider';
import LocationPicker from './LocationPicker'; // OpenStreetMap/Leaflet fallback — used only if no API key is configured

const DEFAULT_CENTER = { lat: 18.7726, lng: 84.4097 }; // Palasa, AP — same default as the original picker
const MAP_CONTAINER_STYLE = { width: '100%', height: '320px' };
const MAP_OPTIONS = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
};

function parseAddressComponents(components = []) {
  const get = (type) => components.find(c => c.types.includes(type))?.long_name || '';
  const streetNumber = get('street_number');
  const route = get('route');
  return {
    street:   [streetNumber, route].filter(Boolean).join(', '),
    area:     get('sublocality') || get('sublocality_level_1') || get('neighborhood') || '',
    city:     get('locality') || get('administrative_area_level_2') || '',
    district: get('administrative_area_level_2') || '',
    state:    get('administrative_area_level_1') || '',
    pincode:  get('postal_code') || '',
    country:  get('country') || '',
  };
}

function GoogleLocationPickerInner({ value, onChange }) {
  const [autocomplete, setAutocomplete] = useState(null);
  const [map, setMap] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [searchText, setSearchText] = useState(value?.address || '');
  const geocoderRef = useRef(null);

  const position = value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : null;

  const getGeocoder = () => {
    if (!geocoderRef.current) geocoderRef.current = new window.google.maps.Geocoder();
    return geocoderRef.current;
  };

  const reverseGeocode = useCallback((lat, lng) => {
    setGeocoding(true);
    setConfirmed(false);
    getGeocoder().geocode({ location: { lat, lng } }, (results, status) => {
      setGeocoding(false);
      if (status === 'OK' && results?.[0]) {
        const parsed = parseAddressComponents(results[0].address_components);
        setSearchText(results[0].formatted_address);
        onChange({ address: results[0].formatted_address, ...parsed, lat, lng });
      } else {
        const addr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setSearchText(addr);
        onChange({ address: addr, street: '', area: '', city: '', district: '', state: '', pincode: '', lat, lng });
      }
    });
  }, [onChange]);

  const geocodeAddressText = useCallback((text) => {
    if (!text || !text.trim()) return;
    setGeocoding(true);
    setGeoError('');
    getGeocoder().geocode(
      { address: text, componentRestrictions: { country: 'IN' } },
      (results, status) => {
        setGeocoding(false);
        if (status === 'OK' && results?.[0]) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          const parsed = parseAddressComponents(results[0].address_components);
          setConfirmed(false);
          setSearchText(results[0].formatted_address);
          onChange({ address: results[0].formatted_address, ...parsed, lat, lng });
          map?.panTo({ lat, lng });
          map?.setZoom(16);
        } else {
          setGeoError(`Couldn't find "${text}". Try a more specific address, or click/drag on the map instead.`);
        }
      }
    );
  }, [onChange, map]);

  const handlePlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place.geometry?.location) {
      geocodeAddressText(searchText);
      return;
    }
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const parsed = parseAddressComponents(place.address_components);
    setConfirmed(false);
    setSearchText(place.formatted_address || place.name);
    onChange({ address: place.formatted_address || place.name, ...parsed, lat, lng });
    map?.panTo({ lat, lng });
    map?.setZoom(16);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const place = autocomplete?.getPlace?.();
      if (!place?.geometry) geocodeAddressText(searchText);
    }
  };

  const handleMapClick = (e) => {
    reverseGeocode(e.latLng.lat(), e.latLng.lng());
  };

  const handleMarkerDragEnd = (e) => {
    reverseGeocode(e.latLng.lat(), e.latLng.lng());
  };

  const handleMyLocation = () => {
    setGeoError('');
    if (!navigator.geolocation) { setGeoError('Geolocation is not supported by your browser.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        reverseGeocode(coords.latitude, coords.longitude);
        map?.panTo({ lat: coords.latitude, lng: coords.longitude });
        map?.setZoom(16);
        setLocating(false);
      },
      () => { setGeoError('Location access denied. You can still search or click on the map.'); setLocating(false); },
      { timeout: 10000 }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '0.9rem', zIndex: 1 }}>🔍</span>
          <Autocomplete
            onLoad={setAutocomplete}
            onPlaceChanged={handlePlaceChanged}
            options={{ componentRestrictions: { country: 'in' }, fields: ['formatted_address', 'address_components', 'geometry', 'name'] }}
          >
            <input
              className="form-input location-search-input"
              style={{ paddingLeft: '2.25rem', margin: 0 }}
              placeholder="Type your address, then press Enter (e.g. Palasa Bus Stand)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoComplete="off"
            />
          </Autocomplete>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => geocodeAddressText(searchText)}
          disabled={geocoding}
          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          title="Search this address"
        >
          {geocoding ? <span className="spinner" /> : 'Search'}
        </button>
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
      {geoError && <p className="form-error" style={{ margin: 0 }}>{geoError}</p>}

      <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '0.4rem 0.75rem', background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🗺️ Type &amp; press Enter to search · Click the map to pin · Drag the marker to adjust</span>
          {geocoding && <span className="spinner" />}
        </div>
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={position || DEFAULT_CENTER}
          zoom={position ? 16 : 12}
          options={MAP_OPTIONS}
          onClick={handleMapClick}
          onLoad={setMap}
        >
          {position && (
            <Marker
              position={position}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </GoogleMap>
      </div>

      {value?.lat ? (
        <div style={{ background: 'var(--bg-white)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ background: 'var(--primary-bg)', borderBottom: '1px solid var(--primary-border)', padding: '0.6rem 0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📋 Selected Location
            </span>
            <button
              type="button"
              className={`btn btn-sm ${confirmed ? 'btn-success' : 'btn-primary'}`}
              onClick={() => setConfirmed(true)}
            >
              {confirmed ? '✓ Confirmed' : 'Confirm Location'}
            </button>
          </div>
          <div style={{ padding: '0.75rem 0.875rem', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6, fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
            {value.address}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem 1rem', padding: '0.75rem 0.875rem', fontSize: '0.78rem' }}>
            {[
              ['Street', value.street],
              ['Area', value.area],
              ['City', value.city],
              ['District', value.district],
              ['State', value.state],
              ['Pincode', value.pincode],
            ].filter(([, v]) => v).map(([label, v]) => (
              <div key={label}>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>{label}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-muted)', border: '1px dashed var(--border-dark)', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          📍 No location selected yet — type an address and press Enter, click the map, or use your current location
        </div>
      )}
    </div>
  );
}

function GoogleLocationPickerBody(props) {
  const { isLoaded, loadError, hasApiKey } = useGoogleMaps();

  if (!hasApiKey) {
    return (
      <div>
        <div className="info-box" style={{ marginBottom: '0.75rem' }}>
          🗺️ Google Maps isn't configured (missing <code>VITE_GOOGLE_MAPS_API_KEY</code>) — using the built-in
          OpenStreetMap picker instead. See the README to enable Google Maps.
        </div>
        <LocationPicker {...props} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <div className="form-error" style={{ marginBottom: '0.75rem' }}>
          ⚠️ Google Maps failed to load (check your API key / billing status). Falling back to OpenStreetMap.
        </div>
        <LocationPicker {...props} />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
        <span className="spinner" /> Loading Google Maps…
      </div>
    );
  }

  return <GoogleLocationPickerInner {...props} />;
}

/**
 * Drop-in replacement for LocationPicker — same `value`/`onChange` contract
 * — that uses the Google Maps JavaScript API (Places search + Geocoding)
 * for location selection. Automatically falls back to the existing
 * OpenStreetMap picker if no API key is configured.
 */
export default function LocationPickerGoogle(props) {
  return (
    <GoogleMapsProvider>
      <GoogleLocationPickerBody {...props} />
    </GoogleMapsProvider>
  );
}