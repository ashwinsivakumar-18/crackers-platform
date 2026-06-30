import { useState } from 'react';
import { ChevronRight, X, Plus, MessageCircle, Check, Trash2, ReceiptText } from 'lucide-react';
import { api } from '../../lib/api';
import { rupee, STATUS_LABEL, FULFILMENT_NEXT, ORDER_FLOW } from '../../lib/format';
import { useAsync, Loading, ErrorState, StatusBadge } from '../ui';

const FILTERS = ['ALL', 'PAYMENT_UPLOADED', 'PAYMENT_APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const waLink = (mobile, text) => {
  const d = String(mobile || '').replace(/\D/g, '');
  const n = d.length === 10 ? `91${d}` : d;
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};
const WaBtn = ({ mobile, text, label }) => (
  <a className="wa-btn" href={waLink(mobile, text)} target="_blank" rel="noreferrer" title="Message on WhatsApp">
    <MessageCircle size={14} /> {label || 'WhatsApp'}
  </a>
);

export default function Orders() {
  const [filter, setFilter] = useState('ALL');
  const [openId, setOpenId] = useState(null);
  const { data, loading, error, reload } = useAsync(
    () => api.orders.adminList({ status: filter === 'ALL' ? undefined : filter, limit: 50 }),
    [filter],
  );

  return (
    <div className="stack">
      <div className="chips">
        {FILTERS.map((f) => (
          <button key={f} className={`chip ${filter === f ? 'chip-on' : ''}`} onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'All orders' : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : error || !data ? <ErrorState message={error ?? 'No data'} onRetry={reload} /> : (
        <div className="panel p0">
          <table className="tbl">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Profit</th><th>Status</th><th /></tr></thead>
            <tbody>
              {data.items.map((o) => (
                <tr key={o.id} onClick={() => setOpenId(o.id)}>
                  <td className="mono">{o.orderNumber}</td>
                  <td>{o.user?.name ?? '—'}</td>
                  <td className="mono">{rupee(o.total)}</td>
                  <td className="mono" style={{ color: 'var(--green)' }}>{rupee(o.profit)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="chev"><ChevronRight size={16} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.items.length === 0 && <div className="state">No orders in this stage.</div>}
        </div>
      )}

      {openId && <OrderDrawer id={openId} onClose={() => setOpenId(null)} onChanged={reload} />}
    </div>
  );
}

function OrderDrawer({ id, onClose, onChanged }) {
  const { data, loading, reload } = useAsync(() => api.orders.detail(id), [id]);
  const [busy, setBusy] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [priceVal, setPriceVal] = useState('');
  const [tLabel, setTLabel] = useState('');
  const [tPlace, setTPlace] = useState('');
  const order = data?.order;

  const refresh = async () => { await reload(); onChanged(); };
  const advance = async (status) => { setBusy(true); try { await api.orders.updateStatus(id, status); await refresh(); } finally { setBusy(false); } };
  const savePrice = async (i) => { setBusy(true); try { await api.orders.updateItemPrice(id, i, Number(priceVal) || 0); setEditIdx(null); await refresh(); } finally { setBusy(false); } };
  const addStep = async () => {
    if (!tLabel.trim()) return;
    setBusy(true);
    try { await api.orders.addTracking(id, { label: tLabel.trim(), place: tPlace.trim() || undefined }); setTLabel(''); setTPlace(''); await refresh(); }
    finally { setBusy(false); }
  };

  const next = order ? FULFILMENT_NEXT[order.status] : undefined;
  const reachedIndex = order ? ORDER_FLOW.indexOf(order.status) : -1;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer">
        {loading || !order ? <Loading /> : (
          <>
            <div className="drawer-head">
              <div className="mono ordno">{order.orderNumber}</div>
              <button className="icon-btn" onClick={onClose}><X size={18} /></button>
            </div>
            <div className="drawer-cust">
              {order.user?.name}<span className="mono muted"> · {order.user?.mobile}</span>
              {order.user?.mobile && <WaBtn mobile={order.user.mobile} text={`Hi ${order.user?.name || ''}, about your order ${order.orderNumber}:`} />}
            </div>
            <StatusBadge status={order.status} />

            <div className="drawer-items">
              {order.items.map((it, i) => (
                <div className="item" key={i}>
                  <span>{it.productName} ×{it.quantity}</span>
                  {editIdx === i ? (
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input className="field mono" style={{ width: 80, padding: 6 }} value={priceVal} onChange={(e) => setPriceVal(e.target.value.replace(/\D/g, ''))} />
                      <button className="icon-btn sm" disabled={busy} onClick={() => savePrice(i)}><Check size={14} /></button>
                    </span>
                  ) : (
                    <span className="mono" onClick={() => { setEditIdx(i); setPriceVal(String(it.unitPrice)); }} style={{ cursor: 'pointer' }} title="Tap to edit billed price">
                      {rupee(it.lineTotal)} <span className="muted">edit</span>
                    </span>
                  )}
                </div>
              ))}
              <div className="item total"><b>Total</b><b className="mono">{rupee(order.total)}</b></div>
              <div className="item"><span className="muted">Profit (from this bill)</span><b className="mono" style={{ color: 'var(--green)' }}>{rupee(order.profit)}</b></div>
            </div>

            <Billing order={order} onSaved={refresh} />

            {next && (
              <button className="btn btn-ember wide" disabled={busy} onClick={() => advance(next)}>
                {busy ? 'Updating…' : `Move to ${STATUS_LABEL[next]}`}
              </button>
            )}

            <div className="track-admin">
              <div className="tl-title">Tracking the customer sees</div>
              {(order.trackingSteps || []).map((t, i) => (
                <div className="tl-item done" key={i}>
                  <span /> <div><b>{t.label}</b>{t.place ? <span className="muted"> · {t.place}</span> : null}<div className="muted sm">{new Date(t.at).toLocaleString('en-IN')}</div></div>
                </div>
              ))}
              <div className="track-add">
                <input className="field" placeholder="Step (e.g. Out for delivery)" value={tLabel} onChange={(e) => setTLabel(e.target.value)} />
                <input className="field" placeholder="Place / checkpoint (optional)" value={tPlace} onChange={(e) => setTPlace(e.target.value)} />
                <button className="btn btn-ink" disabled={busy} onClick={addStep}><Plus size={15} /> Add point</button>
              </div>
            </div>

            <div className="timeline">
              <div className="tl-title">Status history</div>
              {ORDER_FLOW.filter((_, idx) => idx <= reachedIndex).map((s) => (
                <div className="tl-item done" key={s}><span /> {STATUS_LABEL[s]}</div>
              ))}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// Final-bill charges: delivery + packing + any extras, with the saved template as a one-tap fill.
function Billing({ order, onSaved }) {
  const [del, setDel] = useState(String(order.deliveryFee ?? 0));
  const [pack, setPack] = useState(String(order.packingFee ?? 0));
  const [extras, setExtras] = useState(order.extraCharges || []);
  const [busy, setBusy] = useState(false);

  const extrasTotal = extras.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const grand = (order.subtotal || 0) + (Number(del) || 0) + (Number(pack) || 0) + extrasTotal;

  const applyTemplate = async () => {
    const { billing } = await api.settings.getBilling();
    setDel(String(billing.deliveryFee || 0));
    setPack(String(billing.packingFee || 0));
    setExtras(billing.charges || []);
  };
  const save = async () => {
    setBusy(true);
    try {
      await api.orders.setCharges(order.id, { deliveryFee: Number(del) || 0, packingFee: Number(pack) || 0, extraCharges: extras.map((c) => ({ label: c.label, amount: Number(c.amount) || 0 })) });
      await onSaved();
    } finally { setBusy(false); }
  };

  return (
    <div className="billing">
      <div className="tl-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span><ReceiptText size={14} /> Final bill</span>
        <button className="linkbtn" onClick={applyTemplate}>Apply template</button>
      </div>
      <div className="bill-row"><span>Items subtotal</span><b className="mono">{rupee(order.subtotal)}</b></div>
      <div className="bill-row"><span>Delivery</span><input className="field mono" style={{ width: 90, padding: 7 }} value={del} onChange={(e) => setDel(e.target.value.replace(/\D/g, ''))} /></div>
      <div className="bill-row"><span>Packing</span><input className="field mono" style={{ width: 90, padding: 7 }} value={pack} onChange={(e) => setPack(e.target.value.replace(/\D/g, ''))} /></div>
      {extras.map((c, i) => (
        <div className="bill-row" key={i}>
          <input className="field" style={{ flex: 1, padding: 7, marginRight: 8 }} placeholder="Charge label" value={c.label} onChange={(e) => setExtras(extras.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
          <input className="field mono" style={{ width: 90, padding: 7 }} value={c.amount} onChange={(e) => setExtras(extras.map((x, j) => j === i ? { ...x, amount: e.target.value.replace(/\D/g, '') } : x))} />
          <button className="icon-btn sm" onClick={() => setExtras(extras.filter((_, j) => j !== i))}><Trash2 size={13} /></button>
        </div>
      ))}
      <button className="linkbtn" onClick={() => setExtras([...extras, { label: '', amount: '' }])}><Plus size={13} /> Add charge</button>
      <div className="bill-row total"><b>Grand total</b><b className="mono">{rupee(grand)}</b></div>
      <button className="btn btn-ember wide" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save bill'}</button>
    </div>
  );
}
