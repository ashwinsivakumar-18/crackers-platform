
import { useState, useRef } from 'react';
import { Search, Upload, X, ChevronRight, Filter, MessageCircle, PhoneCall, CalendarClock, FileSpreadsheet } from 'lucide-react';

import { api } from '../../lib/api';
import { useAsync, Loading, ErrorState } from '../ui';

export default function Customers() {
  const [q, setQ] = useState('');
  const [statusId, setStatusId] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [importing, setImporting] = useState(false);

  const statuses = useAsync(() => api.crm.statuses(), []);
  const { data, loading, error, reload } = useAsync(
    () => api.crm.customers({ q: q || undefined, statusId: statusId === 'all' ? undefined : statusId }),
    [q, statusId]
  );

  return (
    <>
      <header className="top">
        <div><h1>Customers</h1><p className="muted sm">{data ? `${data.items.length} shown` : ''}</p></div>
        <button className="btn btn-ink" onClick={() => setImporting(true)}><Upload size={16} /> Import</button>
      </header>

      <div className="content">
        <div className="filters">
          <div className="search"><Search size={15} /><input placeholder="Search name or mobile…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div className="sel">
            <Filter size={14} />
            <select value={statusId} onChange={(e) => setStatusId(e.target.value)}>
              <option value="all">All statuses</option>
              {statuses.data?.statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {loading ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Could not load. Is the API running and are you staff?'} onRetry={reload} /> :
        <div className="panel p0">
            <table className="tbl">
              <thead><tr><th>Customer</th><th>City</th><th>Status</th><th /></tr></thead>
              <tbody>
                {data.items.map((c) =>
              <tr key={c.id} onClick={() => setOpenId(c.id)}>
                    <td><div className="c-name">{c.name}</div><div className="muted mono sm">{c.mobile}</div></td>
                    <td>{c.city ?? '—'}</td>
                    <td>{c.status ? <span className="status-pill" style={{ ['--c']: c.status.color }}>{c.status.name}</span> : '—'}</td>
                    <td className="chev"><ChevronRight size={16} /></td>
                  </tr>
              )}
              </tbody>
            </table>
            {data.items.length === 0 && <div className="state">No customers match these filters.</div>}
          </div>
        }
      </div>

      {openId && <Drawer id={openId} statuses={statuses.data?.statuses ?? []} onClose={() => setOpenId(null)} onChanged={reload} />}
      {importing && <ImportModal onClose={() => setImporting(false)} onDone={() => {setImporting(false);reload();}} />}
    </>);

}

function Drawer({ id, statuses, onClose, onChanged }) {
  const { data, loading, reload } = useAsync(() => api.crm.customer(id), [id]);
  const c = data?.customer;

  const setStatus = async (statusId) => {
    await api.crm.updateCustomer(id, { statusId });
    await reload();onChanged();
  };
  const log = async (channel) => {await api.crm.logCommunication(id, { channel });await reload();};

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer">
        {loading || !c ? <Loading /> :
        <>
            <div className="drawer-head">
              <div><div className="c-name lg">{c.name}</div><div className="muted mono">{c.mobile}{c.city ? ` · ${c.city}` : ''}</div></div>
              <button className="icon-btn" onClick={onClose}><X size={18} /></button>
            </div>
            <div className="field-label">Status</div>
            <div className="status-chips">
              {statuses.map((st) =>
            <button key={st.id} className={`status-pill btn-pill ${c.statusId === st.id ? 'on' : ''}`}
            style={{ ['--c']: st.color }} onClick={() => setStatus(st.id)}>{st.name}</button>
            )}
            </div>
            <div className="field-label">Quick actions</div>
            <div className="quick">
              <button onClick={() => log('WHATSAPP')}><MessageCircle size={15} /> Log WhatsApp</button>
              <button onClick={() => log('CALL')}><PhoneCall size={15} /> Log call</button>
              <button onClick={() => log('CALL')}><CalendarClock size={15} /> Follow-up</button>
            </div>
          </>
        }
      </aside>
    </>);

}

function ImportModal({ onClose, onDone }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async (file) => {
    if (!file) return;
    setBusy(true);setError(null);
    try {
      const { batch } = await api.crm.importCustomers(file);
      setResult(batch);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    } finally {setBusy(false);}
  };

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <div className="modal-head"><b>Import customers</b><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <div className="modal-body">
          {!result ?
          <>
              <p className="muted">Upload an Excel or CSV with columns <span className="mono">name, mobile, email, city</span>. Duplicates (by mobile) are detected automatically.</p>
              <div className="drop" onClick={() => inputRef.current?.click()}>
                <FileSpreadsheet size={24} /><b>{busy ? 'Importing…' : 'Choose .xlsx or .csv'}</b><span>tap to select</span>
              </div>
              <input ref={inputRef} type="file" accept=".xlsx,.csv" hidden onChange={(e) => run(e.target.files?.[0])} />
              {error && <p className="err-text">{error}</p>}
            </> :

          <>
              <div className="imp-grid">
                <div className="imp-stat ok"><b className="mono">{result.imported}</b><span>Imported</span></div>
                <div className="imp-stat"><b className="mono">{result.duplicates}</b><span>Duplicates</span></div>
                <div className="imp-stat warn"><b className="mono">{result.failed}</b><span>Failed</span></div>
              </div>
              <button className="btn btn-ember wide" onClick={onDone}>Done — {result.imported} added</button>
            </>
          }
        </div>
      </div>
    </>);

}