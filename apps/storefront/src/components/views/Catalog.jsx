
import { useState } from 'react';
import { Sparkles, PartyPopper, ArrowRight, Plus, Minus, ShieldCheck, Truck, Star } from 'lucide-react';

import { api } from '../../lib/api';
import { rupee, hueFor } from '../../lib/format';
import { useCart } from '../../lib/cart';
import { useAsync, Loading, ErrorState } from '../ui';

export default function Catalog({ onCheckout }) {
  const [cat, setCat] = useState('all');
  const cats = useAsync(() => api.products.categories(), []);
  const { data, loading, error, reload } = useAsync(
    () => api.products.list({ categoryId: cat === 'all' ? undefined : cat, limit: 60 }),
    [cat]
  );

  return (
    <>
      <section className="hero">
        <div className="sparks">{Array.from({ length: 14 }).map((_, i) =>
          <i key={i} style={{ left: `${i * 53 % 100}%`, top: `${i * 37 % 90}%`, animationDelay: `${i % 6 * 0.4}s` }} />
          )}</div>
        <div className="hero-in">
          <span className="eyebrow"><PartyPopper size={14} /> Diwali season</span>
          <h1>Light up<br /><em>Diwali night.</em></h1>
          <p>Sivakasi crackers at up to 60% off MRP. Pay by UPI, upload your screenshot, and we’ll pack your celebration.</p>
          <div className="trust">
            <span><ShieldCheck size={14} /> Licensed seller</span>
            <span><Truck size={14} /> Safe delivery</span>
            <span><Star size={14} /> 4.8 · 2,400+ orders</span>
          </div>
        </div>
      </section>

      <section className="catalog">
        <div className="cat-rail">
          <button className={`pill ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>All</button>
          {cats.data?.categories.map((c) =>
          <button key={c.id} className={`pill ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>{c.name}</button>
          )}
        </div>

        {loading ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Could not load products. Is the API running?'} onRetry={reload} /> :
        <>
            <div className="cat-meta">{data.items.length} item{data.items.length !== 1 ? 's' : ''}</div>
            <div className="grid">
              {data.items.map((p) => <Card key={p.id} p={p} />)}
            </div>
          </>
        }
      </section>

      <CartBar onCheckout={onCheckout} />
    </>);

}

function Card({ p }) {
  const cart = useCart();
  const qty = cart.quantityOf(p.id);
  const hue = hueFor(p.id);
  const sell = p.display?.sellingPrice ?? p.sellingPrice;
  const off = p.display?.savedPercent ?? 0;
  return (
    <div className="card">
      <div className="card-img" style={{ background: `linear-gradient(150deg, hsl(${hue} 75% 62%), hsl(${(hue + 40) % 360} 80% 48%))` }}>
        <Sparkles size={30} className="card-spark" />
        {off > 0 && <span className="card-off">{Math.round(off)}% off</span>}
      </div>
      <div className="card-body">
        <h4>{p.name}</h4>
        <div className="price"><b>{rupee(sell)}</b><s>{rupee(p.display?.mrp ?? p.mrp)}</s></div>
        {qty > 0 ?
        <div className="stepper">
            <button onClick={() => cart.remove(p)}><Minus size={15} /></button>
            <span>{qty}</span>
            <button onClick={() => cart.add(p)}><Plus size={15} /></button>
          </div> :

        <button className="add" onClick={() => cart.add(p)}><Plus size={15} /> Add</button>
        }
      </div>
    </div>);

}

function CartBar({ onCheckout }) {
  const cart = useCart();
  if (cart.count === 0) return null;
  return (
    <div style={{ position: 'sticky', bottom: 0, padding: 16, display: 'flex', justifyContent: 'center', zIndex: 20 }}>
      <button className="btn btn-go" style={{ boxShadow: '0 10px 30px -8px rgba(232,84,42,.6)' }} onClick={onCheckout}>
        Checkout {cart.count} item{cart.count !== 1 ? 's' : ''} · {rupee(cart.subtotal)} <ArrowRight size={17} />
      </button>
    </div>);

}