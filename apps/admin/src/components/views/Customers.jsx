import { useState } from 'react';
import { Search, ChevronRight, X, Phone, Mail, MapPin, MessageCircle, Package, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { useAsync, Loading, ErrorState } from '../ui';

const waLink = (mobile, text) => {
  const d = String(mobile || '').replace(/\D/g, '');
  const n = d.length === 10 ? `91${d}` : d;
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};
const WaIcon = ({ mobile, text }) => (
  <a className="wa-icon" href={waLink(mobile, text)} target="_blank" rel="noreferrer" title="Message on WhatsApp"><MessageCircle size={14} /></a>
);

// Registered buyers who signed in / ordered. Read-only directory (no marketing CRM).
export default function Customers() {
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const { data, loading, error, reload } = useAsync(() => api.customers.list({ q: q || undefined, limit: 50 }), [q]);

  return (
    <>
      <div className="stack">
        <div className="search"><Search size={15} /><input placeholder="Search name or mobile…" value={q} onChange={(e) => setQ(e.target.value)} /></div>

        {loading ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Could not load customers'} onRetry={reload} /> : (
          <div className="panel p0">
            <table className="tbl">
              <thead><tr><th>Customer</th><th>City</th><th>Orders</th><th></th><th /></tr></thead>
              <tbody>
                {data.items.map((c) => (
                  <tr key={c.id}>
                    <td onClick={() => setOpenId(c.id)} style={{ cursor: 'pointer' }}><div className="c-name">{c.name || 'Customer'}</div><div className="muted mono sm">{c.mobile}</div></td>
                    <td onClick={() => setOpenId(c.id)} style={{ cursor: 'pointer' }}>{c.city ?? '—'}</td>
                    <td onClick={() => setOpenId(c.id)} style={{ cursor: 'pointer' }} className="mono">{c.orderCount}</td>
                    <td><WaIcon mobile={c.mobile} text={`Hi ${c.name || ''},`} /></td>
                    <td className="chev" onClick={() => setOpenId(c.id)}><ChevronRight size={16} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.items.length === 0 && <div className="state">No customers yet. They appear here as soon as they sign in.</div>}
          </div>
        )}
      </div>

      {openId && <Drawer id={openId} onClose={() => setOpenId(null)} onDeleted={() => { setOpenId(null); reload(); }} />}
    </>
  );
}

function Drawer({ id, onClose, onDeleted }) {
  const { data, loading } = useAsync(() => api.customers.detail(id), [id]);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const del = async () => { setDeleting(true); try { await api.customers.remove(id); onDeleted(); } finally { setDeleting(false); } };
  const c = data?.customer;
  const loc = c?.location;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer">
        {loading || !c ? <Loading /> : (
          <>
            <div className="drawer-head">
              <div><div className="c-name" style={{ fontSize: 17 }}>{c.name || 'Customer'}</div><div className="muted mono">{c.mobile}</div></div>
              <button className="icon-btn" onClick={onClose}><X size={18} /></button>
            </div>

            <div className="detail-row"><span className="k"><Phone size={12} /> Mobile</span><span className="v">{c.mobile}<WaIcon mobile={c.mobile} text={`Hi ${c.name || ''},`} /></span></div>
            {c.email && <div className="detail-row"><span className="k"><Mail size={12} /> Email</span><span className="v">{c.email}</span></div>}
            <div className="detail-row"><span className="k">Joined</span><span className="v">{new Date(c.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>

            <div className="field-label" style={{ marginTop: 14 }}>Location</div>
            {loc && (loc.lat || loc.line1) ? (
              <>
                <div className="loc-addr">
                  {loc.line1 ? <div>{loc.line1}</div> : null}
                  {loc.line2 ? <div>{loc.line2}</div> : null}
                  <div className="muted">{[loc.city, loc.state, loc.pincode].filter(Boolean).join(', ')}</div>
                </div>
                {loc.lat && loc.lng && <iframe className="loc-map" title="location" loading="lazy" src={`https://maps.google.com/maps?q=${loc.lat},${loc.lng}&z=15&output=embed`} />}
              </>
            ) : <div className="muted sm" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><MapPin size={13} /> No saved location yet.</div>}

            <div className="field-label" style={{ marginTop: 14 }}><Package size={13} /> Orders ({c.orders.length})</div>
            {c.orders.length === 0 ? <div className="muted sm">No orders yet.</div> : c.orders.map((o) => (
              <div className="detail-row" key={o.id}><span className="mono sm">{o.orderNumber}</span><span className="v mono">{rupee(o.total)} <span className="muted sm">· {o.status}</span></span></div>
            ))}

            <div className="danger-zone">
              {!confirming ? (
                <button className="btn btn-danger wide" onClick={() => setConfirming(true)}><Trash2 size={15} /> Delete customer</button>
              ) : (
                <div className="confirm-del">
                  <p className="muted sm">Permanently delete this customer's account and details? Past orders stay as records but will no longer be linked.</p>
                  <div className="cd-actions">
                    <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
                    <button className="btn btn-danger" disabled={deleting} onClick={del}>{deleting ? 'Deleting…' : 'Yes, delete'}</button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
