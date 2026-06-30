import { useRef, useState } from 'react';
import { Search, Filter, Upload, Plus, X, ChevronRight, MapPin, MessageCircle, Phone, Mail, FileSpreadsheet } from 'lucide-react';
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

export default function Customers() {
  const [q, setQ] = useState('');
  const [statusId, setStatusId] = useState('all');
  const [segment, setSegment] = useState('all');   // all | buyers | contacts
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);

  const statuses = useAsync(() => api.crm.statuses(), []);
  const { data, loading, error, reload } = useAsync(
    () => api.crm.customers({ q: q || undefined, statusId: statusId === 'all' ? undefined : statusId }),
    [q, statusId],
  );

  return (
    <>
      <div className="stack">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="search" style={{ flex: 1 }}><Search size={15} /><input placeholder="Search name or mobile…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div className="sel"><Filter size={14} />
            <select value={statusId} onChange={(e) => setStatusId(e.target.value)}>
              <option value="all">All statuses</option>
              {statuses.data?.statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button className="btn btn-ink" onClick={() => setAdding(true)}><Plus size={16} /> Add</button>
          <button className="btn btn-ink" onClick={() => setImporting(true)}><Upload size={16} /> Import</button>
        </div>

        <div className="chips">
          {[['all', 'All'], ['buyers', 'Buyers'], ['contacts', 'Contacts (bulk)']].map(([k, label]) => (
            <button key={k} className={`chip ${segment === k ? 'chip-on' : ''}`} onClick={() => setSegment(k)}>{label}</button>
          ))}
        </div>

        {loading ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Could not load. Is the API running and are you staff?'} onRetry={reload} /> : (
          <div className="panel p0">
            <table className="tbl">
              <thead><tr><th>Customer</th><th>City</th><th>Status</th><th></th><th /></tr></thead>
              <tbody>
                {data.items.filter((c) => segment === 'all' || (segment === 'buyers' ? !!c.userId : !c.userId)).map((c) => (
                  <tr key={c.id}>
                    <td onClick={() => setOpenId(c.id)} style={{ cursor: 'pointer' }}><div className="c-name">{c.name} {c.userId ? <span className="tag tag-buyer">Buyer</span> : <span className="tag tag-contact">Contact</span>}</div><div className="muted mono sm">{c.mobile}</div></td>
                    <td onClick={() => setOpenId(c.id)} style={{ cursor: 'pointer' }}>{c.city ?? '—'}</td>
                    <td onClick={() => setOpenId(c.id)} style={{ cursor: 'pointer' }}>{c.status ? <span className="status-pill" style={{ '--c': c.status.color }}>{c.status.name}</span> : '—'}</td>
                    <td><WaIcon mobile={c.mobile} text={`Hi ${c.name},`} /></td>
                    <td className="chev" onClick={() => setOpenId(c.id)}><ChevronRight size={16} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.items.length === 0 && <div className="state">No customers match these filters.</div>}
          </div>
        )}
      </div>

      {openId && <Drawer id={openId} statuses={statuses.data?.statuses ?? []} onClose={() => setOpenId(null)} onChanged={reload} />}
      {adding && <AddCustomer onClose={() => setAdding(false)} onSaved={() => { setAdding(false); reload(); }} />}
      {importing && <ImportModal onClose={() => setImporting(false)} onDone={() => { setImporting(false); reload(); }} />}
    </>
  );
}

function Drawer({ id, statuses, onClose, onChanged }) {
  const { data, loading, reload } = useAsync(() => api.crm.customer(id), [id]);
  const c = data?.customer;
  const setStatus = async (sid) => { await api.crm.updateCustomer(id, { statusId: sid }); await reload(); onChanged(); };
  const log = async (channel) => { await api.crm.logCommunication(id, { channel }); };
  const loc = c?.location;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer">
        {loading || !c ? <Loading /> : (
          <>
            <div className="drawer-head">
              <div><div className="c-name lg">{c.name}</div><div className="muted mono">{c.mobile}</div></div>
              <button className="icon-btn" onClick={onClose}><X size={18} /></button>
            </div>

            {/* details — each contactable line has a WhatsApp icon */}
            <div className="detail-row"><span className="k"><Phone size={12} /> Mobile</span><span className="v">{c.mobile}<WaIcon mobile={c.mobile} text={`Hi ${c.name},`} /></span></div>
            {c.email && <div className="detail-row"><span className="k"><Mail size={12} /> Email</span><span className="v">{c.email}</span></div>}
            {(c.city || c.state) && <div className="detail-row"><span className="k">Place</span><span className="v">{[c.city, c.state].filter(Boolean).join(', ')}</span></div>}

            {c.isBuyer ? (
              <>
                <div className="field-label" style={{ marginTop: 14 }}>Orders ({c.orders?.length || 0})</div>
                {(c.orders || []).length === 0 ? <div className="muted sm">No orders yet.</div> : (c.orders || []).map((o) => (
                  <div className="detail-row" key={o.id}><span className="mono sm">{o.orderNumber}</span><span className="v mono">{rupee(o.total)} <span className="muted sm">· {o.status}</span></span></div>
                ))}
              </>
            ) : (
              <div className="loc-addr" style={{ marginTop: 12 }}><b>Bulk contact</b><div className="muted">Uploaded for campaigns & advertisements. Phone is all that's needed here.</div></div>
            )}

            <div className="field-label" style={{ marginTop: 14 }}>Status</div>
            <div className="status-chips">
              {statuses.map((st) => (
                <button key={st.id} className={`status-pill ${c.statusId === st.id ? 'on' : ''}`} style={{ '--c': st.color }} onClick={() => setStatus(st.id)}>{st.name}</button>
              ))}
            </div>

            {/* location with map (Zepto-style saved current location) */}
            <div className="field-label">Location</div>
            {loc && (loc.lat || loc.line1) ? (
              <>
                <div className="loc-addr">
                  {loc.line1 ? <div>{loc.line1}</div> : null}
                  {loc.line2 ? <div>{loc.line2}</div> : null}
                  <div className="muted">{[loc.city, loc.state, loc.pincode].filter(Boolean).join(', ')}</div>
                </div>
                {loc.lat && loc.lng && (
                  <iframe className="loc-map" title="location" loading="lazy" src={`https://maps.google.com/maps?q=${loc.lat},${loc.lng}&z=15&output=embed`} />
                )}
              </>
            ) : <div className="muted sm" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><MapPin size={13} /> No saved location yet.</div>}

            <div className="field-label" style={{ marginTop: 14 }}>Log a touch</div>
            <div className="quick">
              <button onClick={() => log('WHATSAPP')}><MessageCircle size={14} /> Logged WhatsApp</button>
              <button onClick={() => log('CALL')}><Phone size={14} /> Logged call</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function AddCustomer({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', mobile: '', email: '', city: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const set = (k, v) => setForm({ ...form, [k]: v });
  const valid = form.name.trim() && /^[6-9]\d{9}$/.test(form.mobile);   // phone mandatory, email optional
  const save = async () => {
    setBusy(true); setErr(null);
    try { await api.crm.createCustomer({ name: form.name.trim(), mobile: form.mobile, email: form.email || undefined, city: form.city || undefined }); onSaved(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); } finally { setBusy(false); }
  };
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <div className="modal-head"><span>Add customer</span><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <div className="modal-body">
          <div className="field-label">Name *</div>
          <input className="field" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Customer name" autoFocus />
          <div className="field-label">Mobile * (required)</div>
          <input className="field mono" value={form.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" />
          <div className="row-fields">
            <div><div className="field-label">Email (optional)</div><input className="field" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="optional" /></div>
            <div><div className="field-label">City</div><input className="field" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="City" /></div>
          </div>
          {err && <p style={{ color: 'var(--ember)', fontSize: 13 }}>{err}</p>}
          <button className="btn btn-ember wide" disabled={!valid || busy} onClick={save}>{busy ? 'Saving…' : 'Add customer'}</button>
        </div>
      </div>
    </>
  );
}

function ImportModal({ onClose, onDone }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const run = async (file) => {
    if (!file) return;
    setBusy(true); setError(null);
    try { const { batch } = await api.crm.importCustomers(file); setResult(batch); }
    catch (e) { setError(e instanceof Error ? e.message : 'Import failed'); } finally { setBusy(false); }
  };
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <div className="modal-head"><b>Import customers</b><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <div className="modal-body">
          {!result ? (
            <>
              <p className="muted">Upload an Excel or CSV with columns <span className="mono">name, mobile, email, city</span>. Duplicates (by mobile) are skipped.</p>
              <div className="drop" onClick={() => inputRef.current?.click()}><FileSpreadsheet size={24} /><b>{busy ? 'Importing…' : 'Choose .xlsx or .csv'}</b></div>
              <input ref={inputRef} type="file" accept=".xlsx,.csv" hidden onChange={(e) => run(e.target.files?.[0])} />
              {error && <p style={{ color: 'var(--ember)', fontSize: 13 }}>{error}</p>}
            </>
          ) : (
            <>
              <div className="imp-grid">
                <div className="imp-stat ok"><b className="mono">{result.imported}</b><span>Imported</span></div>
                <div className="imp-stat"><b className="mono">{result.duplicates}</b><span>Duplicates</span></div>
                <div className="imp-stat warn"><b className="mono">{result.failed}</b><span>Failed</span></div>
              </div>
              <button className="btn btn-ember wide" onClick={onDone}>Done — {result.imported} added</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
