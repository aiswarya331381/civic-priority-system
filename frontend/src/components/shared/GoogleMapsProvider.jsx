import { createContext, useContext, useEffect, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

// Only the 'places' library is needed (search / autocomplete). Geocoding is
// available on the core `google.maps.Geocoder` once the base script loads,
// no separate library flag required.
const LIBRARIES = ['places'];

const GoogleMapsContext = createContext({ isLoaded: false, loadError: null, hasApiKey: false });
export const useGoogleMaps = () => useContext(GoogleMapsContext);

/**
 * Loads the Google Maps JavaScript API exactly once using the API key from
 * VITE_GOOGLE_MAPS_API_KEY (see frontend/.env.example). The key is never
 * hard-coded — if it's missing, `hasApiKey` is false and consumers should
 * fall back to alternate location-selection UI instead of rendering a
 * broken map.
 */
export default function GoogleMapsProvider({ children }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const hasApiKey = Boolean(apiKey);

  // Hooks must run unconditionally — passing an empty key is harmless, the
  // loader will simply report loadError instead of crashing the app.
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  // ── Catch runtime auth failures (bad key, billing not enabled, API not
  //    enabled, referrer restrictions, quota exceeded, etc.) ──────────────
  //
  // useJsApiLoader's `loadError` only fires when the <script> tag itself
  // fails to load. Google's Maps JS often loads the *script* successfully
  // but then fails to *authenticate*, in which case it silently swaps the
  // map's own DOM content for its built-in
  //   "Oops! Something went wrong. This page didn't load Google Maps
  //   correctly."
  // message — without ever touching `loadError`. Google's official hook
  // for this is `window.gm_authFailure`, called automatically by the Maps
  // script itself the moment auth fails. We register it before the script
  // runs so we can detect the failure and fall back to the working
  // OpenStreetMap/Leaflet picker instead of showing Google's broken map.
  const [authFailed, setAuthFailed] = useState(false);

  useEffect(() => {
    window.gm_authFailure = () => setAuthFailed(true);
    return () => { delete window.gm_authFailure; };
  }, []);

  const effectiveLoadError = authFailed
    ? new Error(
        'Google Maps authentication failed. In Google Cloud Console, check that: ' +
        '(1) billing is enabled on the project, (2) "Maps JavaScript API", "Places API", ' +
        'and "Geocoding API" are all enabled, and (3) the API key has no referrer ' +
        'restriction blocking this URL.'
      )
    : loadError;

  return (
    <GoogleMapsContext.Provider
      value={{
        isLoaded: hasApiKey && isLoaded && !authFailed,
        loadError: effectiveLoadError,
        hasApiKey,
      }}
    >
      {children}
    </GoogleMapsContext.Provider>
  );
}