import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { useAsync, Loading, ErrorState } from '../ui';
import { ChevronRight, Package } from 'lucide-react';

const LABEL = {
  PENDING_PAYMENT: 'Awaiting payment', PAYMENT_UPLOADED: 'Verifying payment', PAYMENT_APPROVED: 'Payment approved',
  PROCESSING: 'Preparing', PACKED: 'Packed', SHIPPED: 'On the way', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};

export default function Orders({ onOpen }) {
  const { data, loading, error, reload } = useAsync(() => api.orders.myOrders({ limit: 50 }), []);
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load orders'} onRetry={reload} />;
  if (data.items.length === 0) return <div className="cust-page"><div className="empty-c"><Package size={32} /><p>No orders yet.</p></div></div>;

  return (
    <div className="cust-page">
      <h2 className="page-title">Your orders</h2>
      <div className="order-list">
        {data.items.map((o) => (
          <button className="order-row" key={o.id} onClick={() => onOpen(o.id)}>
            <div>
              <div className="mono b">{o.orderNumber}</div>
              <div className="muted sm">{new Date(o.placedAt || o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.items.length} item{o.items.length !== 1 ? 's' : ''}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="b mono">{rupee(o.total)}</div>
              <span className="o-status">{LABEL[o.status] || o.status}</span>
            </div>
            <ChevronRight size={18} className="muted" />
          </button>
        ))}
      </div>
    </div>
  );
}
