
import { useState } from 'react';
import { ShieldCheck, Check, X, RotateCcw, Sparkles } from 'lucide-react';

import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { useAsync, Loading, ErrorState, Empty, StatusBadge } from '../ui';

export default function Verify() {
  const { data, loading, error, reload } = useAsync(
    () => api.orders.adminList({ status: 'PAYMENT_UPLOADED', limit: 50 }),
    []
  );
  const [note, setNote] = useState({});
  const [busyId, setBusyId] = useState(null);

  const review = async (o, decision) => {
    const proof = o.paymentProofs?.[0];
    if (!proof) return;
    setBusyId(o.id);
    try {
      await api.orders.reviewPayment(o.id, proof.id, decision, note[o.id]);
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'No data'} onRetry={reload} />;
  if (data.items.length === 0)
  return <Empty><Sparkles size={26} /><h3>Queue clear</h3><p>Every uploaded payment has been reviewed.</p></Empty>;

  return (
    <div className="stack">
      <div className="queue-note">
        <ShieldCheck size={15} />
        Confirm each screenshot against the order amount before approving. Approving moves the order into fulfilment.
      </div>
      {data.items.map((o) => {
        const proof = o.paymentProofs?.[0];
        const match = proof ? Number(proof.amount) === Number(o.total) : false;
        const busy = busyId === o.id;
        return (
          <div className="review" key={o.id}>
            <div className="review-slip">
              {proof?.screenshotUrl ?
              // eslint-disable-next-line @next/next/no-img-element
              <img src={proof.screenshotUrl} alt="payment screenshot" style={{ width: '100%', borderRadius: 12 }} /> :

              <div style={{ color: '#fff' }}>No screenshot</div>
              }
            </div>
            <div className="review-body">
              <div className="review-head">
                <div>
                  <div className="mono ordno">{o.orderNumber}</div>
                  <div className="cust">{o.user?.name} · <span className="mono">{o.user?.mobile}</span></div>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <div className="amt-check">
                <div><span>Order total</span><b className="mono">{rupee(o.total)}</b></div>
                <div><span>Customer paid</span><b className="mono">{proof ? rupee(proof.amount) : '—'}</b></div>
                <div className={`amt-flag ${match ? 'ok' : 'warn'}`}>
                  {match ? <><Check size={13} /> Amounts match</> : <><X size={13} /> Mismatch — verify carefully</>}
                </div>
              </div>

              <input
                className="note"
                placeholder="Optional note to log with this decision…"
                value={note[o.id] || ''}
                onChange={(e) => setNote({ ...note, [o.id]: e.target.value })} />
              
              <div className="actions">
                <button className="btn btn-green" disabled={busy} onClick={() => review(o, 'APPROVE')}>
                  <Check size={16} /> {busy ? 'Working…' : 'Approve payment'}
                </button>
                <button className="btn btn-ghost" disabled={busy} onClick={() => review(o, 'REQUEST_NEW')}>
                  <RotateCcw size={16} /> Request new
                </button>
                <button className="btn btn-danger" disabled={busy} onClick={() => review(o, 'REJECT')}>
                  <X size={16} /> Reject
                </button>
              </div>
            </div>
          </div>);

      })}
    </div>);

}