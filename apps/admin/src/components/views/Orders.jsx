
import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';

import { api } from '../../lib/api';
import { rupee, STATUS_LABEL, FULFILMENT_NEXT, ORDER_FLOW } from '../../lib/format';
import { useAsync, Loading, ErrorState, StatusBadge } from '../ui';

const FILTERS = [
'ALL', 'PAYMENT_UPLOADED', 'PAYMENT_APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];


export default function Orders() {
  const [filter, setFilter] = useState('ALL');
  const [openId, setOpenId] = useState(null);

  const { data, loading, error, reload } = useAsync(
    () => api.orders.adminList({ status: filter === 'ALL' ? undefined : filter, limit: 50 }),
    [filter]
  );

  return (
    <div className="stack">
      <div className="chips">
        {FILTERS.map((f) =>
        <button key={f} className={`chip ${filter === f ? 'chip-on' : ''}`} onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'All orders' : STATUS_LABEL[f]}
          </button>
        )}
      </div>

      {loading ? <Loading /> : error || !data ? <ErrorState message={error ?? 'No data'} onRetry={reload} /> :
      <div className="panel p0">
          <table className="tbl">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th /></tr></thead>
            <tbody>
              {data.items.map((o) =>
            <tr key={o.id} onClick={() => setOpenId(o.id)}>
                  <td className="mono">{o.orderNumber}</td>
                  <td>{o.user?.name ?? '—'}</td>
                  <td className="mono">{rupee(o.total)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="chev"><ChevronRight size={16} /></td>
                </tr>
            )}
            </tbody>
          </table>
          {data.items.length === 0 && <div className="state">No orders in this stage.</div>}
        </div>
      }

      {openId && <OrderDrawer id={openId} onClose={() => setOpenId(null)} onChanged={reload} />}
    </div>);

}

function OrderDrawer({ id, onClose, onChanged }) {
  const { data, loading, reload } = useAsync(() => api.orders.detail(id), [id]);
  const [busy, setBusy] = useState(false);
  const order = data?.order;

  const advance = async (status) => {
    setBusy(true);
    try {
      await api.orders.updateStatus(id, status);
      await reload();
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const next = order ? FULFILMENT_NEXT[order.status] : undefined;
  const reachedIndex = order ? ORDER_FLOW.indexOf(order.status) : -1;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer">
        {loading || !order ? <Loading /> :
        <>
            <div className="drawer-head">
              <div className="mono ordno">{order.orderNumber}</div>
              <button className="icon-btn" onClick={onClose}><X size={18} /></button>
            </div>
            <div className="drawer-cust">{order.user?.name}<span className="mono muted"> · {order.user?.mobile}</span></div>
            <StatusBadge status={order.status} />

            <div className="drawer-items">
              {order.items.map((it, i) =>
            <div className="item" key={i}><span>{it.productName} ×{it.quantity}</span><span className="mono">{rupee(it.lineTotal)}</span></div>
            )}
              <div className="item total"><b>Total</b><b className="mono">{rupee(order.total)}</b></div>
            </div>

            {next &&
          <button className="btn btn-ember wide" disabled={busy} onClick={() => advance(next)}>
                {busy ? 'Updating…' : `Move to ${STATUS_LABEL[next]}`}
              </button>
          }

            <div className="timeline">
              <div className="tl-title">Status history</div>
              {ORDER_FLOW.filter((_, idx) => idx <= reachedIndex).map((s) =>
            <div className="tl-item done" key={s}><span /> {STATUS_LABEL[s]}</div>
            )}
            </div>
          </>
        }
      </aside>
    </>);

}