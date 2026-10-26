const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function formatPlaceFromNominatim(json) {
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

describe('formatPlaceFromNominatim', () => {
  it('prefers suburb and city like Noida', () => {
    assert.equal(
      formatPlaceFromNominatim({ address: { suburb: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh' } }),
      'Sector 62, Noida'
    );
  });

  it('falls back to city only', () => {
    assert.equal(formatPlaceFromNominatim({ address: { city: 'Noida' } }), 'Noida');
  });
});
