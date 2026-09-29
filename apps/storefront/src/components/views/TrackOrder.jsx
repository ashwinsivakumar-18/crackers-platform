import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { useAsync, Loading, ErrorState, SignInRequired } from '../ui';
import { ChevronRight, Truck } from 'lucide-react';
import PageIntro from '../PageIntro';

const LABEL = {
  PENDING_PAYMENT: 'Awaiting payment', PAYMENT_UPLOADED: 'Verifying payment', PAYMENT_APPROVED: 'Confirmed',
  PROCESSING: 'Preparing', PACKED: 'Packed', SHIPPED: 'On the way', AT_HUB: 'At your Delivery Hub', OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};

export default function TrackOrder({ onOpen, onSignIn }) {
  const { user, ready } = useAuth();
  if (!ready) return <Loading />;
  if (!user) return <SignInRequired onSignIn={onSignIn} what="order tracking" />;
  return <TrackingList onOpen={onOpen} />;
}

function TrackingList({ onOpen }) {
  const { data, loading, error, reload } = useAsync(() => api.orders.myOrders({ limit: 50 }), []);
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load orders'} onRetry={reload} />;
  return (
    <div className="cust-page">
      <PageIntro icon={Truck} eyebrow="FOLLOW THE CELEBRATION" title="From our store to your hub.">Select an order to see its latest progress and delivery updates.</PageIntro>
      {data.items.length === 0 && <div className="empty-c"><Truck size={36} /><h3>Your journey starts with an order.</h3><p>Delivery updates will appear here after you place an order.</p></div>}
      <div className="order-list">
        {data.items.map((o) => (
          <button className="order-row" key={o.id} onClick={() => onOpen(o.id)}>
            <div><div className="mono b">{o.orderNumber}</div><div className="muted sm">{new Date(o.placedAt || o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div></div>
            <div style={{ textAlign: 'right' }}><div className="b mono">{rupee(o.total)}</div><span className="o-status">{LABEL[o.status] || o.status}</span></div>
            <ChevronRight size={18} className="muted" />
          </button>
        ))}
      </div>
    </div>
  );
}
