
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, ShieldCheck, ReceiptText, Boxes, Warehouse, Users, Tags, Megaphone, Sparkles, Settings as SettingsIcon, LogOut, Bell } from
'lucide-react';
import { api } from '../lib/api';
import { LivePill } from './ui';
import Login from './Login';
import Overview from './views/Overview';
import Verify from './views/Verify';
import Orders from './views/Orders';
import Inventory from './views/Inventory';
import Catalog from './views/Catalog';
import Customers from './views/Customers';
import Statuses from './views/Statuses';
import Settings from './views/Settings';
import Campaigns from './views/Campaigns';



const NAV = [
{ k: 'overview', label: 'Overview', icon: LayoutDashboard },
{ k: 'verify', label: 'Verify payments', icon: ShieldCheck },
{ k: 'orders', label: 'Orders', icon: ReceiptText },
{ k: 'inventory', label: 'Inventory', icon: Warehouse },
{ k: 'catalog', label: 'Catalog', icon: Boxes },
{ k: 'customers', label: 'Customers', icon: Users },
{ k: 'statuses', label: 'Statuses', icon: Tags },
{ k: 'campaigns', label: 'Campaigns', icon: Megaphone }];


const SUBTITLE = {
  overview: 'Your store at a glance',
  verify: 'Payments waiting on your confirmation',
  orders: 'Every order, filterable by stage',
  inventory: 'Categories, products, images and pricing',
  catalog: 'Products, pricing and stock',
  customers: 'Your customer book',
  statuses: 'Customizable customer stages',
  campaigns: 'Reach customers on WhatsApp, email and push'
};

export default function AdminApp() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState('verify');
  const [pending, setPending] = useState(null);

  // Resolve auth on the client (token lives in localStorage).
  useEffect(() => {
    setAuthed(!!api.client.tokens.getAccess());
    setReady(true);
  }, []);

  // Keep the "to verify" count fresh.
  const refreshPending = () => {
    if (!api.client.tokens.getAccess()) return;
    api.analytics.overview().then((o) => setPending(o.pendingPayments)).catch(() => setPending(null));
  };
  useEffect(() => {if (authed) refreshPending();}, [authed, view]);

  const logout = async () => {
    await api.auth.logout().catch(() => {});
    setAuthed(false);
  };

  if (!ready) return null;
  if (!authed) return <Login onLoggedIn={() => {setAuthed(true);setView('verify');}} />;

  return (
    <div className="app">
      <aside className="side">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={16} /></div>
          <div><div className="brand-name">Sri Lakshmi</div><div className="brand-sub">Crackers · Ops</div></div>
        </div>
        <nav className="nav">
          {NAV.map((n) => {
            const I = n.icon;
            return (
              <button key={n.k} className={`nav-item ${view === n.k ? 'on' : ''}`} onClick={() => setView(n.k)}>
                <I size={17} /> <span>{n.label}</span>
                {n.k === 'verify' && pending != null && pending > 0 && <span className="nav-count">{pending}</span>}
              </button>);

          })}
        </nav>
        <button className="nav-item logout" onClick={logout}><LogOut size={17} /> <span>Sign out</span></button>
      </aside>

      <main className="main">
        <header className="top">
          <div>
            <h1>{NAV.find((n) => n.k === view).label}</h1>
            <p className="muted sm">{SUBTITLE[view]}</p>
          </div>
          <div className="top-right">
            <LivePill />
            {pending != null && pending > 0 &&
            <button className="pending-pill" onClick={() => setView('verify')}>
                <span className="dot" /> {pending} to verify
              </button>
            }
            <button className="icon-btn"><Bell size={18} /></button>
          </div>
        </header>

        <div className="content">
          {view === 'overview' && <Overview onGoVerify={() => setView('verify')} />}
          {view === 'verify' && <Verify />}
          {view === 'orders' && <Orders />}
          {view === 'inventory' && <Inventory />}
          {view === 'catalog' && <Catalog />}
          {view === 'customers' && <Customers />}
          {view === 'statuses' && <Statuses />}
          {view === 'settings' && <Settings />}
          {view === 'campaigns' && <Campaigns />}
        </div>
      </main>
    </div>);

}