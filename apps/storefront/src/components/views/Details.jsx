import { useEffect, useState } from 'react';
import { MapPin, LocateFixed, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function Details() {
  const { user } = useAuth();
  const [loc, setLoc] = useState({ lat: null, lng: null, line1: '', line2: '', city: '', state: '', pincode: '' });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.auth.me().then((r) => { if (r.user && r.user.location) setLoc((l) => ({ ...l, ...r.user.location })); }).catch(() => {});
  }, []);

  // Zepto-style: read the browser's current location, then reverse-geocode to an address.
  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setStatus('Location not supported on this device.'); return; }
    setStatus('Getting your location…');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setLoc((l) => ({ ...l, lat, lng }));
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, { headers: { 'Accept-Language': 'en' } });
        const j = await res.json();
        const a = j.address || {};
        setLoc((l) => ({
          ...l, lat, lng,
          line1: [a.house_number, a.road].filter(Boolean).join(' ') || j.name || l.line1,
          line2: [a.suburb, a.neighbourhood].filter(Boolean).join(', ') || l.line2,
          city: a.city || a.town || a.village || a.county || l.city,
          state: a.state || l.state,
          pincode: a.postcode || l.pincode,
        }));
        setStatus('Location captured. Review the address and save.');
      } catch { setStatus('Got coordinates. Add the address manually and save.'); }
    }, () => setStatus('Could not get location — please allow permission.'), { enableHighAccuracy: true, timeout: 10000 });
  };

  const set = (k, v) => setLoc({ ...loc, [k]: v });
  const save = async () => {
    setBusy(true); setSaved(false);
    try { await api.account.saveLocation(loc); setSaved(true); setStatus('Saved! Your store can see this.'); } finally { setBusy(false); }
  };

  return (
    <div className="cust-page">
      <h2 className="page-title">Your details</h2>
      <div className="detail-card">
        <div className="dl-row"><span className="muted">Name</span><b>{user?.name || '—'}</b></div>
        <div className="dl-row"><span className="muted">Mobile</span><b className="mono">{user?.mobile}</b></div>
      </div>

      <h3 className="sub-title"><MapPin size={16} /> Delivery location</h3>
      <button className="btn btn-ember wide" onClick={useCurrentLocation}><LocateFixed size={16} /> Use my current location</button>
      {status && <p className="muted sm" style={{ marginTop: 8 }}>{status}</p>}

      {loc.lat && loc.lng && (
        <iframe className="loc-map" title="your location" loading="lazy" src={`https://maps.google.com/maps?q=${loc.lat},${loc.lng}&z=16&output=embed`} />
      )}

      <div className="addr-grid">
        <input className="field" placeholder="Address line 1 (house, street)" value={loc.line1} onChange={(e) => set('line1', e.target.value)} />
        <input className="field" placeholder="Address line 2 (area, landmark)" value={loc.line2} onChange={(e) => set('line2', e.target.value)} />
        <div className="row-2">
          <input className="field" placeholder="City" value={loc.city} onChange={(e) => set('city', e.target.value)} />
          <input className="field" placeholder="State" value={loc.state} onChange={(e) => set('state', e.target.value)} />
        </div>
        <input className="field" placeholder="Pincode" value={loc.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} />
      </div>
      <button className="btn btn-go wide" disabled={busy} onClick={save}><Save size={16} /> {busy ? 'Saving…' : saved ? 'Saved ✓' : 'Save location'}</button>
    </div>
  );
}
