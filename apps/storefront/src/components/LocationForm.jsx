import { useState } from 'react';
import { LocateFixed, Save, X } from 'lucide-react';
import { api } from '../lib/api';

// Add a delivery location: 3 address lines + city/state/pincode, with a
// "use current location" button that captures GPS and shows it on a map.
export default function LocationForm({ onSaved, onCancel }) {
  const [loc, setLoc] = useState({ label: '', line1: '', line2: '', line3: '', city: '', state: '', pincode: '', lat: null, lng: null });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setLoc((l) => ({ ...l, [k]: v }));

  const useCurrent = () => {
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
        setStatus('Location captured — check the address below and save.');
      } catch { setStatus('Got your coordinates. Fill the address and save.'); }
    }, () => setStatus('Could not get location — please allow permission.'), { enableHighAccuracy: true, timeout: 10000 });
  };

  const save = async () => {
    if (!loc.line1.trim() || !loc.city.trim() || !/^\d{6}$/.test(loc.pincode)) { setError('Add address line 1, city and a 6-digit pincode'); return; }
    setBusy(true); setError(null);
    try { const r = await api.account.addLocation({ ...loc, lat: loc.lat ?? undefined, lng: loc.lng ?? undefined }); onSaved(r.locations); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save'); } finally { setBusy(false); }
  };

  return (
    <div className="loc-form">
      <div className="lf-head"><b>Add delivery location</b>{onCancel && <button className="icon-btn" onClick={onCancel}><X size={16} /></button>}</div>
      <button className="btn btn-ember wide" onClick={useCurrent}><LocateFixed size={16} /> Use my current location</button>
      {status && <p className="muted sm" style={{ marginTop: 6 }}>{status}</p>}
      {loc.lat && loc.lng && <iframe className="loc-map" title="your location" loading="lazy" src={`https://maps.google.com/maps?q=${loc.lat},${loc.lng}&z=16&output=embed`} />}

      <input className="field" placeholder="Address line 1 (house no, street)" value={loc.line1} onChange={(e) => set('line1', e.target.value)} />
      <input className="field" placeholder="Address line 2 (area, landmark)" value={loc.line2} onChange={(e) => set('line2', e.target.value)} />
      <input className="field" placeholder="Address line 3 (optional)" value={loc.line3} onChange={(e) => set('line3', e.target.value)} />
      <div className="row-2">
        <input className="field" placeholder="City" value={loc.city} onChange={(e) => set('city', e.target.value)} />
        <input className="field" placeholder="State" value={loc.state} onChange={(e) => set('state', e.target.value)} />
      </div>
      <div className="row-2">
        <input className="field mono" placeholder="Pincode" value={loc.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} />
        <input className="field" placeholder="Label (Home, Shop…)" value={loc.label} onChange={(e) => set('label', e.target.value)} />
      </div>
      {error && <p className="otp-err" style={{ textAlign: 'left' }}>{error}</p>}
      <button className="btn btn-go wide" disabled={busy} onClick={save}><Save size={16} /> {busy ? 'Saving…' : 'Save location'}</button>
    </div>
  );
}
