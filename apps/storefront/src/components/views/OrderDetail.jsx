import { useState } from 'react';
import { ArrowLeft, Truck, FileText, CheckCircle2, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { useAsync, Loading, ErrorState } from '../ui';

const STORE = 'Sri Lakshmi Crackers';
const FLOW = ['PAYMENT_APPROVED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'];
const FLOW_LABEL = { PAYMENT_APPROVED: 'Confirmed', PROCESSING: 'Preparing', PACKED: 'Packed', SHIPPED: 'On the way', DELIVERED: 'Delivered' };

export default function OrderDetail({ id, onBack }) {
  const [tab, setTab] = useState('invoice');
  const { data, loading, error, reload } = useAsync(() => api.orders.detail(id), [id]);
  const order = data?.order;

  return (
    <div className="cust-page">
      <button className="back" onClick={onBack}><ArrowLeft size={16} /> Back to orders</button>
      {loading || !order ? (error ? <ErrorState message={error} onRetry={reload} /> : <Loading />) : (
        <>
          <div className="tabs">
            <button className={`tab ${tab === 'invoice' ? 'on' : ''}`} onClick={() => setTab('invoice')}><FileText size={15} /> Invoice</button>
            <button className={`tab ${tab === 'tracking' ? 'on' : ''}`} onClick={() => setTab('tracking')}><Truck size={15} /> Tracking</button>
          </div>
          {tab === 'invoice' ? <Invoice order={order} /> : <Tracking order={order} />}
        </>
      )}
    </div>
  );
}

// On-screen invoice — view only. No download, no PDF, no GST. Just a clean bill.
function Invoice({ order }) {
  const extras = order.extraCharges || [];
  return (
    <div className="invoice">
      <div className="inv-top">
        <div><div className="inv-store">{STORE}</div><div className="muted sm">Tap to view — this is a demo bill for your records.</div></div>
        <div className="inv-meta"><div className="mono b">{order.orderNumber}</div><div className="muted sm">{new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
      </div>
      <table className="inv-tbl">
        <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
        <tbody>
          {order.items.map((it, i) => (
            <tr key={i}><td>{it.productName}</td><td className="mono">{it.quantity}</td><td className="mono">{rupee(it.unitPrice)}</td><td className="mono">{rupee(it.lineTotal)}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="inv-sums">
        <div className="inv-line"><span>Subtotal</span><span className="mono">{rupee(order.subtotal)}</span></div>
        {order.deliveryFee > 0 && <div className="inv-line"><span>Delivery</span><span className="mono">{rupee(order.deliveryFee)}</span></div>}
        {order.packingFee > 0 && <div className="inv-line"><span>Packing</span><span className="mono">{rupee(order.packingFee)}</span></div>}
        {extras.map((c, i) => <div className="inv-line" key={i}><span>{c.label}</span><span className="mono">{rupee(c.amount)}</span></div>)}
        <div className="inv-line grand"><b>Total</b><b className="mono">{rupee(order.total)}</b></div>
      </div>
      <div className="inv-paid">Paid via UPI / bank transfer · verified by our team</div>
    </div>
  );
}

// Customer tracking — a truck crossing the points the admin adds.
function Tracking({ order }) {
  const reached = FLOW.indexOf(order.status);
  const steps = order.trackingSteps || [];
  return (
    <div className="tracking">
      <div className="track-flow">
        {FLOW.map((s, i) => {
          const done = reached >= i && reached >= 0;
          const current = reached === i;
          return (
            <div className={`tf-step ${done ? 'done' : ''} ${current ? 'current' : ''}`} key={s}>
              <div className="tf-dot">{current ? <Truck size={14} /> : done ? <CheckCircle2 size={14} /> : i + 1}</div>
              <div className="tf-label">{FLOW_LABEL[s]}</div>
              {i < FLOW.length - 1 && <div className={`tf-line ${reached > i ? 'done' : ''}`} />}
            </div>
          );
        })}
      </div>

      {steps.length > 0 && (
        <div className="track-points">
          <div className="tp-title">Journey</div>
          {steps.map((t, i) => (
            <div className="tp-item" key={i}>
              <span className="tp-mark"><MapPin size={13} /></span>
              <div><b>{t.label}</b>{t.place ? <span className="muted"> · {t.place}</span> : null}<div className="muted sm">{new Date(t.at).toLocaleString('en-IN')}</div></div>
            </div>
          ))}
        </div>
      )}
      {steps.length === 0 && <p className="muted" style={{ textAlign: 'center', marginTop: 20 }}>We'll post updates here as your order moves. 🚚</p>}
    </div>
  );
}
