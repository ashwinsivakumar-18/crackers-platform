import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { useAsync, Loading, ErrorState, SignInRequired } from '../ui';
import { useAuth } from '../../lib/auth';
import { ChevronRight, Package } from 'lucide-react';
import PageIntro from '../PageIntro';

const LABEL = {
  PENDING_PAYMENT: 'Awaiting payment', PAYMENT_UPLOADED: 'Verifying payment', PAYMENT_APPROVED: 'Payment approved',
  PROCESSING: 'Preparing', PACKED: 'Packed', SHIPPED: 'On the way', AT_HUB: 'At your Delivery Hub', OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};

export default function Orders({ onOpen, onSignIn }) {
  const { user, ready } = useAuth();
  if (!ready) return <Loading />;
  if (!user) return <SignInRequired onSignIn={onSignIn} what="your orders" />;
  return <OrderList onOpen={onOpen} />;
}

function OrderList({ onOpen }) {
  const { data, loading, error, reload } = useAsync(() => api.orders.myOrders({ limit: 50 }), []);
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load orders'} onRetry={reload} />;

  return (
    <div className="cust-page">
      <PageIntro icon={Package} eyebrow="YOUR FESTIVE COLLECTION" title="Your orders, all together.">View your purchases, payment status and order details in one place.</PageIntro>
      {data.items.length === 0 && <div className="empty-c"><Package size={36} /><h3>Your first celebration awaits.</h3><p>Once you place an order, you’ll find its details here.</p></div>}
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
