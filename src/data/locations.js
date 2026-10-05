// src/data/locations.js
// Real-place lookup for the LocationPicker.
//
// Primary source: Open-Meteo's free geocoding API (no API key, CORS enabled),
// which returns real cities/towns worldwide as the user types.
// Fallback: a bundled list of major Indian cities, used only if that request
// fails (offline, blocked, rate-limited) so sign-up never gets stuck.

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

const FALLBACK = [
  "Mumbai, Maharashtra, India", "Pune, Maharashtra, India", "Nagpur, Maharashtra, India",
  "Nashik, Maharashtra, India", "Kolhapur, Maharashtra, India", "Aurangabad, Maharashtra, India",
  "Solapur, Maharashtra, India", "Sangli, Maharashtra, India", "Satara, Maharashtra, India",
  "Thane, Maharashtra, India", "Navi Mumbai, Maharashtra, India", "Amravati, Maharashtra, India",
  "Delhi, Delhi, India", "Gurugram, Haryana, India", "Noida, Uttar Pradesh, India",
  "Lucknow, Uttar Pradesh, India", "Kanpur, Uttar Pradesh, India", "Varanasi, Uttar Pradesh, India",
  "Agra, Uttar Pradesh, India", "Jaipur, Rajasthan, India", "Udaipur, Rajasthan, India",
  "Jodhpur, Rajasthan, India", "Ahmedabad, Gujarat, India", "Surat, Gujarat, India",
  "Vadodara, Gujarat, India", "Rajkot, Gujarat, India", "Bengaluru, Karnataka, India",
  "Mysuru, Karnataka, India", "Mangaluru, Karnataka, India", "Hubballi, Karnataka, India",
  "Belagavi, Karnataka, India", "Hyderabad, Telangana, India", "Warangal, Telangana, India",
  "Visakhapatnam, Andhra Pradesh, India", "Vijayawada, Andhra Pradesh, India",
  "Chennai, Tamil Nadu, India", "Coimbatore, Tamil Nadu, India", "Madurai, Tamil Nadu, India",
  "Kochi, Kerala, India", "Thiruvananthapuram, Kerala, India", "Kozhikode, Kerala, India",
  "Panaji, Goa, India", "Margao, Goa, India", "Kolkata, West Bengal, India",
  "Bhubaneswar, Odisha, India", "Patna, Bihar, India", "Ranchi, Jharkhand, India",
  "Bhopal, Madhya Pradesh, India", "Indore, Madhya Pradesh, India", "Raipur, Chhattisgarh, India",
  "Chandigarh, Chandigarh, India", "Amritsar, Punjab, India", "Ludhiana, Punjab, India",
  "Dehradun, Uttarakhand, India", "Shimla, Himachal Pradesh, India", "Srinagar, Jammu and Kashmir, India",
  "Guwahati, Assam, India",
];

function fallbackSearch(query) {
  const q = query.trim().toLowerCase();
  const starts = FALLBACK.filter((l) => l.toLowerCase().startsWith(q));
  const contains = FALLBACK.filter((l) => !starts.includes(l) && l.toLowerCase().includes(q));
  return [...starts, ...contains].slice(0, 8);
}

// "Kolhapur, Maharashtra, India"
function labelFor(r) {
  const parts = [r.name, r.admin1, r.country].filter(Boolean);
  return parts.filter((p, i) => parts.indexOf(p) === i).join(", ");
}

// Resolves to { labels: string[], offline: boolean }
export async function searchLocations(query, signal) {
  const q = query.trim();
  if (q.length < 2) return { labels: [], offline: false };
  try {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`geocoding ${res.status}`);
    const data = await res.json();
    const labels = [...new Set((data.results || []).map(labelFor))];
    return { labels, offline: false };
  } catch (err) {
    if (err.name === "AbortError") throw err;
    return { labels: fallbackSearch(q), offline: true };
  }
}
