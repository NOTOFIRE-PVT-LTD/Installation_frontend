const placeCache = new Map();

export function formatPlaceFromNominatim(json) {
  const a = json?.address || {};
  const road = a.road || a.street || a.pedestrian || a.path;
  const area = a.suburb || a.neighbourhood || a.residential || a.subdistrict;
  const city = a.city || a.town || a.village || a.county || a.state_district;
  const state = a.state;

  const parts = [road, area, city, state].filter(Boolean);
  if (parts.length >= 2) {
    return parts.slice(0, 3).join(', ');
  }
  if (parts.length === 1) return parts[0];

  const bits = String(json?.display_name || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return bits.slice(0, 3).join(', ') || null;
}

export async function placeNameFromCoords(lat, lng) {
  if (lat == null || lng == null || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null;
  const key = `${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;
  if (placeCache.has(key)) return placeCache.get(key);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16&addressdetails=1`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) throw new Error('Geocode failed');
    const json = await res.json();
    const name = formatPlaceFromNominatim(json) || `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
    placeCache.set(key, name);
    return name;
  } catch {
    return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
  }
}

export async function readLocation() {
  if (!navigator.geolocation) return { error: 'Location is not supported on this device' };

  const getPosition = (options) =>
    new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ pos }),
        (err) => resolve({ error: err }),
        options
      );
    });

  // Try high accuracy with a 12s timeout and small maximumAge for fast lock
  let result = await getPosition({ enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 });

  // If high accuracy timed out, retry with normal accuracy as fallback
  if (!result.pos && result.error?.code === 3) {
    result = await getPosition({ enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 });
  }

  if (!result.pos) {
    const code = result.error?.code;
    return {
      error:
        code === 1
          ? 'Location permission denied. Please allow location access in your phone/browser settings.'
          : code === 2
          ? 'Position unavailable. Please check that phone GPS / Location is turned ON.'
          : 'GPS request timed out. Please try again.',
    };
  }

  const lat = result.pos.coords.latitude;
  const lng = result.pos.coords.longitude;
  const accuracy = Math.round(result.pos.coords.accuracy || 0);
  const address = await placeNameFromCoords(lat, lng);
  return { lat, lng, accuracy, address };
}

export function formatPlanTime(hm) {
  const [h, m] = String(hm || '').split(':').map(Number);
  if (!Number.isFinite(h)) return hm || '—';
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = ((h + 11) % 12) + 1;
  return `${hour}:${String(m ?? 0).padStart(2, '0')} ${suffix}`;
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}
