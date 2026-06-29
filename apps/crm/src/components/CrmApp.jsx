
import { useEffect, useState } from 'react';
import { Users, Tags, Megaphone, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import Login from './Login';
import Customers from './views/Customers';
import Statuses from './views/Statuses';
import Campaigns from './views/Campaigns';


const NAV = [
{ k: 'customers', label: 'Customers', icon: Users },
{ k: 'statuses', label: 'Statuses', icon: Tags },
{ k: 'campaigns', label: 'Campaigns', icon: Megaphone }];


export default function CrmApp() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState('customers');

  useEffect(() => {
    setAuthed(!!api.client.tokens.getAccess());
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!authed) return <Login onLoggedIn={() => setAuthed(true)} />;

  return (
    <div className="app">
      <aside className="side">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={16} /></div>
          <div><div className="brand-name">Sri Lakshmi</div><div className="brand-sub">CRM · Marketing</div></div>
        </div>
        <nav className="nav">
          {NAV.map((n) => {
            const I = n.icon;
            return (
              <button key={n.k} className={`nav-item ${view === n.k ? 'on' : ''}`} onClick={() => setView(n.k)}>
                <I size={17} /> <span>{n.label}</span>
              </button>);

          })}
        </nav>
        <button className="nav-item logout" onClick={async () => {await api.auth.logout().catch(() => {});setAuthed(false);}}>
          <span>Sign out</span>
        </button>
      </aside>

      <main className="main">
        {view === 'customers' && <Customers />}
        {view === 'statuses' && <Statuses />}
        {view === 'campaigns' && <Campaigns />}
      </main>
    </div>);

}