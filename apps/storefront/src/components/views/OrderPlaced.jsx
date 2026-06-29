
import { PartyPopper, ShieldCheck, Check } from 'lucide-react';

import { rupee } from '../../lib/format';

export default function OrderPlaced({ order, onContinue }) {
  const stages = [
  ['Payment under verification', 'We’re checking your screenshot now.', true],
  ['Payment approved', 'We’ll confirm shortly.', false],
  ['Packing', 'Your crackers get boxed safely.', false],
  ['Out for delivery', 'On its way to you.', false]];

  return (
    <section className="done">
      <div className="done-card">
        <div className="done-tick"><PartyPopper size={26} /></div>
        <h2>Order placed!</h2>
        <p>Your celebration is on the way.</p>
        <div className="done-no">Order <b className="mono">{order.orderNumber}</b></div>

        <div className="verify-banner">
          <ShieldCheck size={16} />
          <div><b>We’re verifying your payment</b><span>You’ll get a WhatsApp once it’s approved — usually within a few hours.</span></div>
        </div>

        <div className="track">
          {stages.map(([t, d, active], i) =>
          <div className={`tr ${active ? 'active' : ''}`} key={i}>
              <span className={`tr-dot ${active ? 'pulse' : ''}`}>{active ? <Check size={12} strokeWidth={3} /> : i + 1}</span>
              <div><b>{t}</b><p>{d}</p></div>
            </div>
          )}
        </div>

        <div className="done-items">
          {order.items.map((it, i) => <div key={i} className="di"><span>{it.productName}</span><em>×{it.quantity}</em></div>)}
          <div className="di total"><b>Total</b><b>{rupee(order.total)}</b></div>
        </div>

        <button className="btn btn-go wide" onClick={onContinue}>Continue shopping</button>
      </div>
    </section>);

}