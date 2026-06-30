import { useState } from 'react';
import { Heart, Plus, X } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

// Heart on a product card -> pick which wishlist(s) to save it to, or create a new one.
export default function WishlistHeart({ productId, onNeedSignIn }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState([]);
  const [newName, setNewName] = useState('');

  const openPicker = async (e) => {
    e.stopPropagation();
    if (!user) return onNeedSignIn && onNeedSignIn();
    const r = await api.account.wishlists();
    setLists(r.wishlists); setOpen(true);
  };
  const toggle = async (index) => { const r = await api.account.toggleWishlistItem(index, productId); setLists(r.wishlists); };
  const create = async () => { if (!newName.trim()) return; const r = await api.account.createWishlist(newName.trim()); setLists(r.wishlists); setNewName(''); };
  const inList = (w) => w.products.some((p) => String(p._id || p.id) === String(productId));
  const saved = lists.some(inList);

  return (
    <>
      <button className={`heart-btn ${saved ? 'on' : ''}`} onClick={openPicker} title="Save to wishlist"><Heart size={16} /></button>
      {open && (
        <>
          <div className="um-scrim" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="wl-pop" onClick={(e) => e.stopPropagation()}>
            <div className="wl-pop-head"><b>Save to…</b><button className="icon-btn" onClick={() => setOpen(false)}><X size={15} /></button></div>
            {lists.length === 0 && <p className="muted sm">No lists yet — create one below.</p>}
            {lists.map((w) => (
              <button key={w.index} className={`wl-pick ${inList(w) ? 'on' : ''}`} onClick={() => toggle(w.index)}><Heart size={13} /> {w.name}</button>
            ))}
            <div className="wl-new"><input className="field" placeholder="New list" value={newName} onChange={(e) => setNewName(e.target.value)} /><button className="icon-btn" onClick={create}><Plus size={16} /></button></div>
          </div>
        </>
      )}
    </>
  );
}
