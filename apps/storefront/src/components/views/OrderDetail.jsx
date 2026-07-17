import { ArrowLeft, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { useAsync, Loading, ErrorState } from '../ui';

const STORE = 'Sivakumar Crackers';

export default function OrderDetail({ id, onBack }) {
  const { data, loading, error, reload } = useAsync(() => api.orders.detail(id), [id]);
  const order = data?.order;
  return (
    <div className="cust-page">
      <button className="back" onClick={onBack}><ArrowLeft size={16} /> Back to orders</button>
      {loading || !order ? (error ? <ErrorState message={error} onRetry={reload} /> : <Loading />) : (
        <>
          <div className="inv-tag"><FileText size={15} /> Invoice</div>
          <Invoice order={order} />
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
      <div className="inv-billto">
        <div className="muted sm">Bill to</div>
        <div className="b">{order.user?.name || 'Customer'}</div>
        {order.user?.mobile && <div className="mono sm">{order.user.mobile}</div>}
        {order.address ? <div className="muted sm">{order.address}{order.pincode ? ` - ${order.pincode}` : ''}</div> : <div className="muted sm">{order.deliveryType === 'STORE_PICKUP' ? 'Store pickup' : ''}</div>}
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
