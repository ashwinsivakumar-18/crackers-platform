import { useState } from 'react';
import { Heart, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { useAsync, Loading, ErrorState } from '../ui';
import { useCart } from '../../lib/cart';

export default function Wishlists() {
  const { data, loading, error, reload } = useAsync(() => api.account.wishlists(), []);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const cart = useCart();

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try { await api.account.createWishlist(name.trim()); setName(''); await reload(); } finally { setBusy(false); }
  };
  const removeItem = async (index, productId) => { await api.account.toggleWishlistItem(index, productId); await reload(); };

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load wishlists'} onRetry={reload} />;

  return (
    <div className="cust-page">
      <h2 className="page-title">Your wishlists</h2>
      <div className="wl-create">
        <input className="field" placeholder="New list name (e.g. Diwali, Wedding)" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-ember" disabled={busy} onClick={create}><Plus size={16} /> Create</button>
      </div>

      {data.wishlists.length === 0 && <div className="empty-c"><Heart size={32} /><p>No lists yet. Create one above, then tap the heart on any product.</p></div>}

      {data.wishlists.map((w) => (
        <div className="wl-block" key={w.index}>
          <div className="wl-head"><Heart size={16} className="ember" /> <b>{w.name}</b> <span className="muted sm">({w.products.length})</span></div>
          {w.products.length === 0 ? <p className="muted sm">Empty — add products with the heart icon.</p> : (
            <div className="wl-items">
              {w.products.map((p) => {
                const sell = p.sellingPrice ?? p.mrp;
                return (
                  <div className="wl-item" key={p._id || p.id}>
                    <div><div className="b">{p.name}</div><div className="mono">{rupee(sell)}</div></div>
                    <div className="wl-actions">
                      <button className="icon-btn sm" title="Add to cart" onClick={() => cart.add({ id: String(p._id || p.id), name: p.name, sellingPrice: sell, display: { sellingPrice: sell, mrp: p.mrp } })}><ShoppingBag size={15} /></button>
                      <button className="icon-btn sm" title="Remove" onClick={() => removeItem(w.index, String(p._id || p.id))}><Trash2 size={15} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
