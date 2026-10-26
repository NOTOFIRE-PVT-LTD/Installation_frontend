const placeCache = new Map();

export function formatPlaceFromNominatim(json) {
  const a = json?.address || {};
  const city = a.city || a.town || a.village || a.suburb || a.county;
  const area = a.suburb || a.neighbourhood || a.residential || a.city_district;
  if (area && city && area !== city) return `${area}, ${city}`;
  if (city) return city;
  const bits = String(json?.display_name || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return bits.slice(0, 2).join(', ') || null;
}

export async function placeNameFromCoords(lat, lng) {
  if (lat == null || lng == null || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null;
  const key = `${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;
  if (placeCache.has(key)) return placeCache.get(key);
  try {
    // shortcut: public Nominatim, swap to a keyed geocoder if this starts 429ing
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14&addressdetails=1`
    );
    const json = await res.json();
    const name = formatPlaceFromNominatim(json);
    if (name) placeCache.set(key, name);
    return name;
  } catch {
    return null;
  }
}

export async function readLocation() {
  if (!navigator.geolocation) return { error: 'Location is not supported on this device' };
  const result = await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ pos }),
      (err) =>
        resolve({
          error:
            err?.code === 1
              ? 'Location permission was denied. Enable location to check in or check out.'
              : 'Could not read GPS location.',
        }),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
  if (!result.pos) return { error: result.error };
  const lat = result.pos.coords.latitude;
  const lng = result.pos.coords.longitude;
  const address = await placeNameFromCoords(lat, lng);
  return { lat, lng, accuracy: result.pos.coords.accuracy, address };
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
