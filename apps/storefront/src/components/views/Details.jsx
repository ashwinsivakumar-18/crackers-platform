import { useEffect, useState } from 'react';
import { MapPin, Trash2, Star, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import LocationForm from '../LocationForm';
import { Loading } from '../ui';

// Profile: account details + manage saved delivery locations (up to 5).
export default function Details() {
  const { user } = useAuth();
  const [locations, setLocations] = useState(null);
  const [adding, setAdding] = useState(false);

  const load = () => api.account.locations().then((r) => { setLocations(r.locations); setAdding(r.locations.length === 0); }).catch(() => setLocations([]));
  useEffect(() => { load(); }, []);

  const onSaved = (locs) => { setLocations(locs); setAdding(false); };
  const remove = async (id) => { const r = await api.account.removeLocation(id); setLocations(r.locations); if (r.locations.length === 0) setAdding(true); };
  const makeDefault = async (id) => { const r = await api.account.setDefaultLocation(id); setLocations(r.locations); };

  return (
    <div className="cust-page">
      <h2 className="page-title">Your details</h2>
      <div className="detail-card">
        <div className="dl-row"><span className="muted">Name</span><b>{user?.name || '—'}</b></div>
        <div className="dl-row"><span className="muted">Mobile</span><b className="mono">{user?.mobile}</b></div>
        {user?.email && <div className="dl-row"><span className="muted">Email</span><b>{user.email}</b></div>}
      </div>

      <h3 className="sub-title"><MapPin size={16} /> Delivery locations {locations ? `(${locations.length}/5)` : ''}</h3>
      {locations === null ? <Loading /> : (
        <div className="loc-pick">
          {locations.map((l) => (
            <div key={l.id} className={`loc-card ${l.isDefault ? 'on' : ''}`}>
              <span className="lc-body">
                <span className="lc-label"><MapPin size={13} /> {l.label || 'Address'} {l.isDefault && <span className="tag-default">Default</span>}</span>
                <span className="lc-addr">{[l.line1, l.line2, l.line3].filter(Boolean).join(', ')}<br />{[l.city, l.state, l.pincode].filter(Boolean).join(', ')}</span>
              </span>
              <span style={{ display: 'flex', gap: 6 }}>
                {!l.isDefault && <button className="lc-del" title="Set default" onClick={() => makeDefault(l.id)}><Star size={15} /></button>}
                <button className="lc-del" title="Remove" onClick={() => remove(l.id)}><Trash2 size={15} /></button>
              </span>
            </div>
          ))}
          {!adding && locations.length < 5 && <button className="add-loc-btn" onClick={() => setAdding(true)}><Plus size={16} /> Add location</button>}
          {adding && <LocationForm onSaved={onSaved} onCancel={locations.length ? () => setAdding(false) : undefined} />}
        </div>
      )}
    </div>
  );
}
