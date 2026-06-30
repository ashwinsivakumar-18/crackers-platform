import { useState } from 'react';
import { User, Package, MapPin, Heart, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function UserMenu({ onNavigate, onSignIn }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return <button className="btn btn-ink sm" onClick={onSignIn}>Sign in</button>;
  const initial = (user.name || user.mobile || 'U').trim().charAt(0).toUpperCase();
  const go = (v) => { setOpen(false); onNavigate(v); };

  return (
    <div className="usermenu">
      <button className="avatar-btn" onClick={() => setOpen((o) => !o)}>
        <span className="avatar">{initial}</span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <>
          <div className="um-scrim" onClick={() => setOpen(false)} />
          <div className="um-pop">
            <div className="um-head"><span className="avatar lg">{initial}</span><div><b>{user.name || 'Welcome'}</b><div className="muted sm mono">{user.mobile}</div></div></div>
            <button className="um-item" onClick={() => go('orders')}><Package size={16} /> Orders</button>
            <button className="um-item" onClick={() => go('details')}><MapPin size={16} /> Details & location</button>
            <button className="um-item" onClick={() => go('wishlists')}><Heart size={16} /> Wishlists</button>
            <button className="um-item danger" onClick={() => { setOpen(false); logout(); }}><LogOut size={16} /> Sign out</button>
          </div>
        </>
      )}
    </div>
  );
}
