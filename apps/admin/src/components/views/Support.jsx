import { useState } from 'react';
import { Check, RotateCcw, Trash2, MessageCircle, LifeBuoy } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, Loading, ErrorState } from '../ui';

const waLink = (mobile) => { const d = String(mobile || '').replace(/\D/g, ''); const n = d.length === 10 ? `91${d}` : d; return `https://wa.me/${n}`; };
const FILTERS = [['OPEN', 'Open'], ['RESOLVED', 'Resolved'], ['', 'All']];

export default function Support() {
  const [status, setStatus] = useState('OPEN');
  const [type, setType] = useState('');
  const { data, loading, error, reload } = useAsync(() => api.support.list({ status: status || undefined, type: type || undefined, limit: 100 }), [status, type]);
  const [busy, setBusy] = useState(null);

  const act = async (fn, id) => { setBusy(id); try { await fn(); await reload(); } finally { setBusy(null); } };

  return (
    <div className="stack">
      <div className="chips">
        {FILTERS.map(([k, label]) => (
          <button key={k} className={`chip ${status === k ? 'chip-on' : ''}`} onClick={() => setStatus(k)}>
            {label}{k === 'OPEN' && data?.openCount ? ` (${data.openCount})` : ''}
          </button>
        ))}
      </div>
      <div className="chips">
        {[['', 'All types'], ['SUPPORT', 'Support'], ['ENQUIRY', 'Bulk enquiries']].map(([k, label]) => (
          <button key={k} className={`chip ${type === k ? 'chip-on' : ''}`} onClick={() => setType(k)}>{label}</button>
        ))}
      </div>

      {loading ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Could not load'} onRetry={reload} /> : (
        data.items.length === 0 ? <div className="panel"><div className="state"><LifeBuoy size={26} /><h3>No queries here</h3><p>Customer support messages will show up here.</p></div></div> : (
          <div className="ticket-list">
            {data.items.map((t) => (
              <div className="ticket" key={t.id}>
                <div className="ticket-top">
                  <div>
                    <span className={`tk-type ${t.type === 'ENQUIRY' ? 'enq' : ''}`}>{t.type === 'ENQUIRY' ? 'Enquiry' : 'Support'}</span>
                    <span className={`tk-status ${t.status === 'OPEN' ? 'open' : 'done'}`}>{t.status === 'OPEN' ? 'Open' : 'Resolved'}</span>
                  </div>
                  <span className="muted sm">{new Date(t.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="tk-subject">{t.subject}</div>
                <div className="tk-msg">{t.message}</div>
                <div className="tk-foot">
                  <span className="muted sm">{t.name || 'Customer'}{t.mobile ? ` · ${t.mobile}` : ''}</span>
                  <div className="tk-actions">
                    {t.mobile && <a className="wa-icon" href={waLink(t.mobile)} target="_blank" rel="noreferrer" title="Reply on WhatsApp"><MessageCircle size={14} /></a>}
                    {t.status === 'OPEN'
                      ? <button className="btn btn-ember sm" disabled={busy === t.id} onClick={() => act(() => api.support.resolve(t.id), t.id)}><Check size={14} /> Clear</button>
                      : <button className="btn btn-ghost sm" disabled={busy === t.id} onClick={() => act(() => api.support.reopen(t.id), t.id)}><RotateCcw size={14} /> Reopen</button>}
                    <button className="icon-btn sm" disabled={busy === t.id} title="Delete" onClick={() => act(() => api.support.remove(t.id), t.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
