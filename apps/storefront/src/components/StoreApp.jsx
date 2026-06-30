import { useState } from 'react';
import { Sparkles, ShoppingBag, X } from 'lucide-react';
import { CartProvider, useCart } from '../lib/cart';
import { AuthProvider, useAuth } from '../lib/auth';
import Catalog from './views/Catalog';
import Checkout from './views/Checkout';
import OrderPlaced from './views/OrderPlaced';
import Orders from './views/Orders';
import OrderDetail from './views/OrderDetail';
import Wishlists from './views/Wishlists';
import Details from './views/Details';
import UserMenu from './UserMenu';
import OtpLogin from './OtpLogin';

function Shell() {
  const cart = useCart();
  const auth = useAuth();
  const [view, setView] = useState('shop');
  const [order, setOrder] = useState(null);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [signIn, setSignIn] = useState(false);

  const go = (v) => { setView(v); window.scrollTo(0, 0); };
  const openOrder = (id) => { setOpenOrderId(id); go('order-detail'); };

  return (
    <div className="shop">
      <header className="hdr">
        <button className="logo" onClick={() => go('shop')}>
          <span className="logo-mark"><Sparkles size={16} /></span>
          <span className="logo-name">Sri Lakshmi<small>Crackers</small></span>
        </button>
        <div style={{ flex: 1 }} />
        <button className="bag" onClick={() => cart.count > 0 && go('checkout')}>
          <ShoppingBag size={19} />{cart.count > 0 && <span>{cart.count}</span>}
        </button>
        <UserMenu onNavigate={go} onSignIn={() => setSignIn(true)} />
      </header>

      {view === 'shop' && <Catalog onCheckout={() => go('checkout')} onNeedSignIn={() => setSignIn(true)} />}
      {view === 'checkout' && (
        <Checkout onBack={() => go('shop')} onPlaced={(o) => { setOrder(o); go('done'); }} />
      )}
      {view === 'done' && order && <OrderPlaced order={order} onContinue={() => { setOrder(null); go('shop'); }} />}
      {view === 'orders' && <Orders onOpen={openOrder} />}
      {view === 'order-detail' && openOrderId && <OrderDetail id={openOrderId} onBack={() => go('orders')} />}
      {view === 'wishlists' && <Wishlists />}
      {view === 'details' && <Details />}

      {signIn && (
        <>
          <div className="scrim" onClick={() => setSignIn(false)} />
          <div className="modal">
            <div className="modal-head"><span>Sign in</span><button className="icon-btn" onClick={() => setSignIn(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <OtpLogin onAuthed={async () => { await auth.refresh(); setSignIn(false); }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function StoreApp() {
  return (
    <AuthProvider>
      <CartProvider>
        <Shell />
      </CartProvider>
    </AuthProvider>
  );
}
