
import { useState } from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';

import { CartProvider, useCart } from '../lib/cart';
import Catalog from './views/Catalog';
import Checkout from './views/Checkout';
import OrderPlaced from './views/OrderPlaced';



function Shell() {
  const cart = useCart();
  const [view, setView] = useState('shop');
  const [order, setOrder] = useState(null);

  return (
    <div className="shop">
      <header className="hdr">
        <button className="logo" onClick={() => setView('shop')}>
          <span className="logo-mark"><Sparkles size={16} /></span>
          <span className="logo-name">Sri Lakshmi<small>Crackers</small></span>
        </button>
        <div style={{ flex: 1 }} />
        <span className="live-pill" style={{ marginRight: 10 }}>Live API</span>
        <button className="bag" onClick={() => cart.count > 0 && setView('checkout')}>
          <ShoppingBag size={19} />{cart.count > 0 && <span>{cart.count}</span>}
        </button>
      </header>

      {view === 'shop' && <Catalog onCheckout={() => setView('checkout')} />}
      {view === 'checkout' &&
      <Checkout onBack={() => setView('shop')} onPlaced={(o) => {setOrder(o);setView('done');window.scrollTo(0, 0);}} />
      }
      {view === 'done' && order && <OrderPlaced order={order} onContinue={() => {setOrder(null);setView('shop');}} />}
    </div>);

}

export default function StoreApp() {
  return (
    <CartProvider>
      <Shell />
    </CartProvider>);

}