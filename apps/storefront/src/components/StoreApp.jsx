import { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag, X, Home, Info } from 'lucide-react';
import { CartProvider, useCart } from '../lib/cart';
import { AuthProvider, useAuth } from '../lib/auth';
import { api } from '../lib/api';
import Catalog from './views/Catalog';
import Checkout from './views/Checkout';
import OrderPlaced from './views/OrderPlaced';
import Orders from './views/Orders';
import OrderDetail from './views/OrderDetail';
import Wishlists from './views/Wishlists';
import Details from './views/Details';
import TrackOrder from './views/TrackOrder';
import TrackDetail from './views/TrackDetail';
import About from './views/About';
import Support from './views/Support';
import BulkOrders from './views/BulkOrders';
import HowToOrder from './views/HowToOrder';
import UserMenu from './UserMenu';
import OtpLogin from './OtpLogin';

function Shell() {
  const cart = useCart();
  const auth = useAuth();
  const [view, setView] = useState('shop');
  const [order, setOrder] = useState(null);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [trackId, setTrackId] = useState(null);
  const [signIn, setSignIn] = useState(false);
  const [logo, setLogo] = useState('');

  useEffect(() => { api.settings.getPublic().then((r) => setLogo(r.logoUrl || '')).catch(() => {}); }, []);

  const go = (v) => { setView(v); window.scrollTo(0, 0); };
  const openOrder = (id) => { setOpenOrderId(id); go('order-detail'); };
  const openTrack = (id) => { setTrackId(id); go('track-detail'); };

  return (
    <div className="shop">
      <header className="hdr">
        <button className="hdr-home" title="Home — products" onClick={() => go('shop')}><Home size={18} /></button>
        <button className="logo" onClick={() => go('shop')}>
          <span className="logo-mark">{logo ? <img src={logo} alt="Sivakumar Crackers" className="logo-img" /> : <Sparkles size={16} />}</span>
          <span className="logo-name">Sivakumar<small>Crackers</small></span>
        </button>
        <div style={{ flex: 1 }} />
        <button className="hdr-about" onClick={() => go('about')}>About</button>
        <button className="bag" onClick={() => go('checkout')}>
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
      {view === 'tracking' && <TrackOrder onOpen={openTrack} />}
      {view === 'track-detail' && trackId && <TrackDetail id={trackId} onBack={() => go('tracking')} />}
      {view === 'about' && <About onBack={() => go('shop')} />}
      {view === 'support' && <Support />}
      {view === 'bulk' && <BulkOrders />}
      {view === 'howto' && <HowToOrder />}

      {view === 'shop' && (
        <footer className="shop-footer">
          <div className="sf-top">
            <div className="sf-brandcol">
              <div className="sf-brand">{logo ? <img src={logo} alt="" className="sf-logo-img" /> : <Sparkles size={17} />} Sivakumar Crackers</div>
              <p className="sf-tag">Safe, joyful celebrations — delivered to your nearby Delivery Hub, all across India. 🇮🇳</p>
              <div className="sf-badges">
                <span>🔒 UPI / bank transfer</span>
                <span>✅ Hand-verified orders</span>
              </div>
            </div>
            <div className="sf-col">
              <h5>Explore</h5>
              <button onClick={() => go('shop')}>Shop</button>
              <button onClick={() => go('howto')}>How to order</button>
              <button onClick={() => go('bulk')}>Bulk &amp; gift boxes</button>
            </div>
            <div className="sf-col">
              <h5>Orders</h5>
              <button onClick={() => go('orders')}>My orders</button>
              <button onClick={() => go('tracking')}>Track order</button>
              <button onClick={() => go('wishlists')}>Wishlists</button>
            </div>
            <div className="sf-col">
              <h5>Help</h5>
              <button onClick={() => go('about')}>About us</button>
              <button onClick={() => go('support')}>Help &amp; Support</button>
            </div>
          </div>
          <div className="sf-bottom">
            <span>© {new Date().getFullYear()} Sivakumar Crackers · All rights reserved</span>
            <span className="sf-note">Pay by UPI · we verify every order by hand · celebrate safely 🪔</span>
          </div>
        </footer>
      )}

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
