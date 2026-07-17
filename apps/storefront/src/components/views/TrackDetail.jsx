import { ArrowLeft, Truck, CheckCircle2, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, Loading, ErrorState } from '../ui';

const FLOW = ['PAYMENT_APPROVED', 'PROCESSING', 'PACKED', 'SHIPPED', 'AT_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const FLOW_LABEL = { PAYMENT_APPROVED: 'Confirmed', PROCESSING: 'Preparing', PACKED: 'Packed', SHIPPED: 'On the way', AT_HUB: 'At Hub', OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered' };

export default function TrackDetail({ id, onBack }) {
  const { data, loading, error, reload } = useAsync(() => api.orders.detail(id), [id]);
  const order = data?.order;
  return (
    <div className="cust-page">
      <button className="back" onClick={onBack}><ArrowLeft size={16} /> Back</button>
      {loading || !order ? (error ? <ErrorState message={error} onRetry={reload} /> : <Loading />) : (
        <>
          <h2 className="page-title">Track {order.orderNumber}</h2>
          <Tracking order={order} />
        </>
      )}
    </div>
  );
}

function Tracking({ order }) {
  const reached = FLOW.indexOf(order.status);
  const steps = order.trackingSteps || [];
  return (
    <div className="tracking">
      {order.trackingId ? <div className="track-id">Tracking ID: <b className="mono">{order.trackingId}</b></div> : null}
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
      {steps.length > 0 ? (
        <div className="track-points">
          <div className="tp-title">Journey</div>
          {steps.map((t, i) => (
            <div className="tp-item" key={i}>
              <span className="tp-mark"><MapPin size={13} /></span>
              <div><b>{t.label}</b>{t.place ? <span className="muted"> · {t.place}</span> : null}<div className="muted sm">{new Date(t.at).toLocaleString('en-IN')}</div></div>
            </div>
          ))}
        </div>
      ) : <p className="muted" style={{ textAlign: 'center', marginTop: 20 }}>We'll post updates here as your order moves. 🚚</p>}
    </div>
  );
}
