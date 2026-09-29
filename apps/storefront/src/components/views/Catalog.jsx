
import { useMemo, useState } from 'react';
import { Sparkles, PartyPopper, ArrowRight, Plus, Minus, ShieldCheck, Truck, Gift, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { GIFT_TIERS } from '../../lib/giftBoxes';

import { api } from '../../lib/api';
import { rupee, hueFor } from '../../lib/format';
import { useCart } from '../../lib/cart';
import { useAsync, Loading, ErrorState } from '../ui';
import WishlistHeart from '../WishlistHeart';

const sellOf = (p) => p.display?.sellingPrice ?? p.sellingPrice ?? 0;

// Keep the default useful for browsing: affordable products lead, a few
// mid-priced products are mixed in, and the highest-priced group stays last.
function relevanceOrder(products) {
  const byPrice = [...products].sort((a, b) => sellOf(a) - sellOf(b));
  if (byPrice.length < 5) return byPrice;

  const lowEnd = Math.ceil(byPrice.length * 0.6);
  const highStart = Math.max(lowEnd, Math.ceil(byPrice.length * 0.85));
  const low = byPrice.slice(0, lowEnd);
  const mid = byPrice.slice(lowEnd, highStart);
  const high = byPrice.slice(highStart);
  const groupSize = Math.max(2, Math.ceil(low.length / (mid.length + 1)));
  const mixed = [];

  low.forEach((product, index) => {
    mixed.push(product);
    if ((index + 1) % groupSize === 0 && mid.length) mixed.push(mid.shift());
  });

  return [...mixed, ...mid, ...high];
}

export default function Catalog({ onCheckout, onNeedSignIn, onBulk }) {
  const [cat, setCat] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState('relevance');
  const [price, setPrice] = useState('all');
  const cats = useAsync(() => api.products.categories(), []);
  const { data, loading, error, reload } = useAsync(
    () => api.products.list({ categoryId: cat === 'all' ? undefined : cat, limit: 100 }),
    [cat]
  );
  const products = useMemo(() => {
    let items = [...(data?.items ?? [])];
    if (price === 'under500') items = items.filter((p) => sellOf(p) < 500);
    if (price === '500to1000') items = items.filter((p) => sellOf(p) >= 500 && sellOf(p) <= 1000);
    if (price === 'over1000') items = items.filter((p) => sellOf(p) > 1000);

    if (sort === 'priceLow') return items.sort((a, b) => sellOf(a) - sellOf(b));
    if (sort === 'priceHigh') return items.sort((a, b) => sellOf(b) - sellOf(a));
    return relevanceOrder(items);
  }, [data, price, sort]);
  const activeFilters = price !== 'all' || sort !== 'relevance';

  return (
    <>
      <section className="hero">
        <div className="sparks">{Array.from({ length: 14 }).map((_, i) =>
          <i key={i} style={{ left: `${i * 53 % 100}%`, top: `${i * 37 % 90}%`, animationDelay: `${i % 6 * 0.4}s` }} />
          )}</div>
        <div className="hero-in">
          <div className="hero-copy">
          <span className="eyebrow"><PartyPopper size={14} /> Diwali season</span>
          <h1>A little sparkle.<br /><em>A lot of joy.</em></h1>
          <p>Your festive favourites from Sivakasi. Discover crackers for your celebration and gift boxes made for sharing.</p>
          <div className="hero-cta"><a className="btn btn-gold" href="#all-products">Shop crackers <ArrowRight size={17} /></a><button className="btn btn-ghost-l" onClick={onBulk}><Gift size={17} /> Explore gift boxes</button></div>
          <div className="trust">
            <span><ShieldCheck size={14} /> UPI & bank transfer</span>
            <span><Truck size={14} /> Delivery hub pickup</span>
          </div>
          </div>
          <div className="hero-gift">
            <span className="gift-kicker">THE GIFTING COLLECTION</span>
            <div className="gift-art" aria-hidden="true"><div className="gift-orbit" /><div className="gift-box box-back"><Gift /></div><div className="gift-box box-front"><Gift /><span>A box full of joy</span></div><Sparkles className="gift-spark" /></div>
            <h2>Big celebrations.<br />Beautifully boxed.</h2>
            <p>From <strong>{rupee(GIFT_TIERS[0].price)}</strong> / box · Minimum 150 boxes</p>
            <button onClick={onBulk} className="btn btn-gold">View bulk gift boxes <ArrowRight size={17} /></button>
          </div>
        </div>
      </section>

      <section className="gift-showcase" aria-labelledby="gift-heading">
        <div className="section-heading"><div><span className="section-kicker">SHARE THE CELEBRATION</span><h2 id="gift-heading">One thoughtful gift. So much joy.</h2><p>For teams, families and festive gatherings. Bulk orders from 150 boxes.</p></div><button className="gift-link" onClick={onBulk}>Explore gifting <ArrowRight size={17} /></button></div>
        <div className="gift-tier-grid">{GIFT_TIERS.map((tier) => <button className="gift-tier-card" key={tier.code} onClick={onBulk}><Gift size={28} /><span className="gift-tier-count">{tier.items}<small>items</small></span><span>Celebration gift box</span><strong>{rupee(tier.price)} <small>/ box</small></strong><span className="gift-tier-foot">{tier.code}<ArrowRight size={16} /></span></button>)}</div>
      </section>

      <section className="catalog" id="all-products">
        <div className="section-heading"><div><span className="section-kicker">PICK YOUR FESTIVE FAVOURITES</span><h2>All products</h2><p>Find a little something for every celebration.</p></div></div>
        <div className="cat-rail">
          <button className={`pill ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>All</button>
          {cats.data?.categories.map((c) =>
          <button key={c.id} className={`pill ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>{c.name}</button>
          )}
        </div>

        {loading ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Could not load products. Is the API running?'} onRetry={reload} /> :
        <>
            <div className="catalog-tools">
              <div className="cat-meta">{products.length} item{products.length !== 1 ? 's' : ''}</div>
              <div className="filter-wrap">
                <button className={`filter-btn ${activeFilters ? 'on' : ''}`} onClick={() => setFiltersOpen((v) => !v)}>
                  <SlidersHorizontal size={16} /> Filter {activeFilters && <span className="filter-dot" />} <ChevronDown size={15} />
                </button>
                {filtersOpen && (
                  <div className="filter-panel">
                    <div className="filter-head"><b>Filter products</b><button onClick={() => setFiltersOpen(false)}><X size={16} /></button></div>
                    <label>Sort by</label>
                    <div className="filter-options">
                      <button className={sort === 'relevance' ? 'on' : ''} onClick={() => setSort('relevance')}>Relevance</button>
                      <button className={sort === 'priceLow' ? 'on' : ''} onClick={() => setSort('priceLow')}>Price: low to high</button>
                      <button className={sort === 'priceHigh' ? 'on' : ''} onClick={() => setSort('priceHigh')}>Price: high to low</button>
                    </div>
                    <label>Price</label>
                    <div className="filter-options">
                      <button className={price === 'all' ? 'on' : ''} onClick={() => setPrice('all')}>All prices</button>
                      <button className={price === 'under500' ? 'on' : ''} onClick={() => setPrice('under500')}>Under ₹500</button>
                      <button className={price === '500to1000' ? 'on' : ''} onClick={() => setPrice('500to1000')}>₹500–₹1,000</button>
                      <button className={price === 'over1000' ? 'on' : ''} onClick={() => setPrice('over1000')}>Above ₹1,000</button>
                    </div>
                    <div className="filter-actions">
                      <button onClick={() => { setSort('relevance'); setPrice('all'); }}>Reset</button>
                      <button className="apply" onClick={() => setFiltersOpen(false)}>Show {products.length} items</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="grid">
              {products.map((p) => <Card key={p.id} p={p} onOpen={() => setSelectedProduct(p)} onNeedSignIn={onNeedSignIn} />)}
            </div>
            {products.length === 0 && <div className="empty-grid">No products match this filter.</div>}
          </>
        }
      </section>

      {selectedProduct && <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      <CartBar onCheckout={onCheckout} />
    </>);

}

function Card({ p, onOpen, onNeedSignIn }) {
  const cart = useCart();
  const qty = cart.quantityOf(p.id);
  const hue = hueFor(p.id);
  const imgUrl = (p.images && (p.images.find((i) => i.isPrimary) || p.images[0]) || {}).url;
  const sell = p.display?.sellingPrice ?? p.sellingPrice;
  const off = p.display?.savedPercent ?? 0;
  return (
    <div className="card" role="button" tabIndex={0} aria-label={`View ${p.name}`} onClick={onOpen} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }}>
      <div className="card-img" style={imgUrl ? undefined : { background: `linear-gradient(150deg, hsl(${hue} 75% 62%), hsl(${(hue + 40) % 360} 80% 48%))` }}>
        {imgUrl ? <img src={imgUrl} alt={p.name} className="card-photo" loading="lazy" /> : <Sparkles size={30} className="card-spark" />}
        {off > 0 && <span className="card-off">{Math.round(off)}% off</span>}
        <WishlistHeart productId={p.id} onNeedSignIn={onNeedSignIn} />
      </div>
      <div className="card-body">
        <h4>{p.name}</h4>
        <div className="price"><b>{rupee(sell)}</b><s>{rupee(p.display?.mrp ?? p.mrp)}</s></div>
        {qty > 0 ?
        <div className="stepper" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => cart.remove(p)}><Minus size={15} /></button>
            <span>{qty}</span>
            <button onClick={() => cart.add(p)}><Plus size={15} /></button>
          </div> :

        <button className="add" onClick={(e) => { e.stopPropagation(); cart.add(p); }}><Plus size={15} /> Add</button>
        }
      </div>
    </div>);

}

function ProductDetail({ product, onClose }) {
  const cart = useCart();
  const qty = cart.quantityOf(product.id);
  const hue = hueFor(product.id);
  const imgUrl = (product.images && (product.images.find((i) => i.isPrimary) || product.images[0]) || {}).url;
  const sell = sellOf(product);
  const mrp = product.display?.mrp ?? product.mrp;
  const off = product.display?.savedPercent ?? 0;
  const outOfStock = product.stock === 0;
  const atLimit = Number.isFinite(product.stock) && qty >= product.stock;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="pmodal pd-modal" role="dialog" aria-modal="true" aria-label={product.name}>
        <button className="x float" onClick={onClose} aria-label="Close"><X size={19} /></button>
        <div className="pd-layout">
          <div className="pd-image" style={imgUrl ? undefined : { background: `linear-gradient(150deg, hsl(${hue} 75% 62%), hsl(${(hue + 40) % 360} 80% 48%))` }}>
            {imgUrl ? <img src={imgUrl} alt={product.name} /> : <Sparkles size={50} />}
            {off > 0 && <span className="card-off">{Math.round(off)}% off</span>}
          </div>
          <div className="pm-body pd-body">
            <span className="pd-sku">{product.sku}</span>
            <h3>{product.name}</h3>
            <div className="price lg"><b>{rupee(sell)}</b>{mrp > sell && <s>{rupee(mrp)}</s>}{off > 0 && <em>Save {Math.round(off)}%</em>}</div>
            <p className="pd-description">{product.description || 'Premium Sivakasi crackers, carefully packed for a bright and joyful celebration.'}</p>

            {product.safetyInstructions && (
              <div className="safety"><ShieldCheck size={18} /><div><b>Safety instructions</b><p>{product.safetyInstructions}</p></div></div>
            )}

            <div className="pd-quantity">
              <span>Quantity</span>
              <div className="pd-stepper">
                <button disabled={qty === 0} onClick={() => cart.remove(product)}><Minus size={17} /></button>
                <b>{qty}</b>
                <button disabled={outOfStock || atLimit} onClick={() => cart.add(product)}><Plus size={17} /></button>
              </div>
            </div>
            {qty === 0 && <button className="btn btn-go wide" disabled={outOfStock} onClick={() => cart.add(product)}><Plus size={17} /> {outOfStock ? 'Out of stock' : 'Add to cart'}</button>}
            {qty > 0 && <div className="pd-added">{qty} added to your cart · {rupee(sell * qty)}</div>}
          </div>
        </div>
      </div>
    </>
  );
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
