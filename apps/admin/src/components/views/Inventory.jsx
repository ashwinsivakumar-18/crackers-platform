
import { useMemo, useRef, useState } from 'react';
import { Plus, X, Pencil, Boxes, ImagePlus, Package } from 'lucide-react';

import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { useAsync, Loading, ErrorState } from '../ui';

// Selling price after a percentage discount (mirrors the backend pricing util for live preview).
const offerOf = (mrp, pct) => Math.max(0, Math.round(mrp - mrp * pct / 100));
const actualOf = (p) => p.display?.mrp ?? p.mrp;
const sellOf = (p) => p.display?.sellingPrice ?? p.sellingPrice;
const pctOf = (p) => p.display?.savedPercent ?? (p.mrp ? Math.round((p.mrp - p.sellingPrice) / p.mrp * 100) : 0);
const thumbOf = (p) => p.images?.find((i) => i.isPrimary)?.url ?? p.images?.[0]?.url;

export default function Inventory() {
  const cats = useAsync(() => api.products.categories(), []);
  const prods = useAsync(() => api.products.list({ limit: 300 }), []);
  const [selected, setSelected] = useState(null);
  const [addCat, setAddCat] = useState(false);
  const [editProd, setEditProd] = useState(null);

  const reload = () => {cats.reload();prods.reload();};

  const all = prods.data?.items ?? [];
  const categories = cats.data?.categories ?? [];
  const activeCat = selected ?? categories[0]?.id ?? null;
  const inCat = useMemo(() => all.filter((p) => p.categoryId === activeCat), [all, activeCat]);

  const countFor = (id) => all.filter((p) => p.categoryId === id).length;
  const activeCategory = categories.find((c) => c.id === activeCat) ?? null;

  if (cats.loading || prods.loading) return <Loading />;
  if (cats.error || prods.error)
  return <ErrorState message={cats.error ?? prods.error ?? 'Could not load inventory. Is the API running?'} onRetry={reload} />;

  return (
    <div className="stack">

      <div className="inv-layout">
        {/* categories */}
        <div className="inv-cats">
          {categories.map((c) =>
          <button key={c.id} className={`inv-cat ${activeCat === c.id ? 'on' : ''}`} onClick={() => setSelected(c.id)}>
              {c.image ?
            // eslint-disable-next-line @next/next/no-img-element
            <img className="thumb" src={c.image} alt={c.name} /> :
            <span className="thumb"><Boxes size={18} /></span>}
              <div><div className="nm">{c.name}</div><div className="ct">{countFor(c.id)} product{countFor(c.id) !== 1 ? 's' : ''}</div></div>
            </button>
          )}
          <button className="inv-cat add" onClick={() => setAddCat(true)}><Plus size={16} /> Add category</button>
        </div>

        {/* products in the selected category */}
        <div className="panel p0" style={{ padding: 16 }}>
          {!activeCategory ?
          <div className="state"><Boxes size={26} /><h3>No categories yet</h3><p>Create a category (e.g. “Category A”) to start adding products.</p></div> :

          <>
              <div className="inv-head">
                {activeCategory.image ?
              // eslint-disable-next-line @next/next/no-img-element
              <img className="thumb" src={activeCategory.image} alt={activeCategory.name} /> :
              <span className="thumb"><Boxes size={20} /></span>}
                <div style={{ flex: 1 }}><h3>{activeCategory.name}</h3><div className="muted sm">{inCat.length} product{inCat.length !== 1 ? 's' : ''}</div></div>
                <button className="btn btn-ember" onClick={() => setEditProd('new')}><Plus size={16} /> Add product</button>
              </div>

              <table className="tbl">
                <thead><tr><th></th><th>Product</th><th>MRP (actual)</th><th>Discount</th><th>Offer price</th><th>Stock</th><th></th></tr></thead>
                <tbody>
                  {inCat.map((p) =>
                <tr key={p.id}>
                      <td style={{ width: 48 }}>
                        {thumbOf(p) ?
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="thumb-sq" src={thumbOf(p)} alt={p.name} /> :
                    <span className="thumb-sq"><Package size={16} /></span>}
                      </td>
                      <td><div style={{ fontWeight: 600 }}>{p.name}</div><div className="muted mono sm">{p.sku}</div></td>
                      <td className="mono strike">{rupee(actualOf(p))}</td>
                      <td className="mono">{pctOf(p)}%</td>
                      <td className="mono" style={{ fontWeight: 700, color: 'var(--ember)' }}>{rupee(sellOf(p))}</td>
                      <td className="mono">{p.stock === 0 ? <span style={{ color: 'var(--ember)', fontWeight: 600 }}>Out</span> : p.stock}</td>
                      <td><button className="icon-btn sm" onClick={() => setEditProd(p)}><Pencil size={15} /></button></td>
                    </tr>
                )}
                </tbody>
              </table>
              {inCat.length === 0 && <div className="state">No products in this category yet — add your first.</div>}
            </>
          }
        </div>
      </div>

      {addCat && <CategoryModal onClose={() => setAddCat(false)} onSaved={() => {setAddCat(false);reload();}} />}
      {editProd && activeCategory &&
      <ProductModal
        categoryId={activeCategory.id}
        product={editProd === 'new' ? null : editProd}
        onClose={() => setEditProd(null)}
        onSaved={() => {setEditProd(null);reload();}} />

      }
    </div>);

}

/* ---------- image picker (uploads to /uploads, returns URL) ---------- */
function ImagePicker({ url, onUrl }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const pick = async (f) => {
    if (!f) return;
    setBusy(true);
    try {const r = await api.uploads.image(f, 'catalog');onUrl(r.url);} finally
    {setBusy(false);}
  };
  return (
    <div className="dropimg" onClick={() => ref.current?.click()}>
      {url ?
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="upload" /> :
      <><ImagePlus size={22} /><b>{busy ? 'Uploading…' : 'Upload image'}</b><span>PNG or JPG</span></>}
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>);

}

/* ---------- create / rename a category (with image) ---------- */
function CategoryModal({ onClose, onSaved }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const save = async () => {
    setBusy(true);setErr(null);
    try {await api.products.createCategory({ name: name.trim(), image: image ?? undefined });onSaved();}
    catch (e) {setErr(e instanceof Error ? e.message : 'Failed');} finally
    {setBusy(false);}
  };

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <div className="modal-head"><span>New category</span><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <div className="modal-body">
          <div className="field-label">Category name</div>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Category A" autoFocus />
          <div className="field-label">Category image</div>
          <ImagePicker url={image} onUrl={setImage} />
          {err && <p style={{ color: 'var(--ember)', fontSize: 13 }}>{err}</p>}
          <button className="btn btn-ember wide" disabled={!name.trim() || busy} onClick={save}>{busy ? 'Saving…' : 'Create category'}</button>
        </div>
      </div>
    </>);

}

/* ---------- create / edit a product (MRP, discount %, live offer price, image) ---------- */
function ProductModal({ categoryId, product, onClose, onSaved

}) {
  const editing = !!product;
  const [name, setName] = useState(product?.name ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [mrp, setMrp] = useState(String(product?.mrp ?? ''));
  const [pct, setPct] = useState(String(product ? pctOf(product) : ''));
  const [cost, setCost] = useState(String(product?.costPrice ?? ''));
  const [stock, setStock] = useState(String(product?.stock ?? ''));
  const [image, setImage] = useState(thumbOf(product ?? {}) ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const mrpN = Number(mrp) || 0;
  const pctN = Math.min(100, Number(pct) || 0);
  const offer = offerOf(mrpN, pctN);
  const costN = Number(cost) || 0;
  const profitEach = offer - costN;
  const valid = name.trim() && sku.trim() && mrpN > 0;

  const save = async () => {
    setBusy(true);setErr(null);
    const body = {
      name: name.trim(),
      sku: sku.trim(),
      categoryId,
      mrp: mrpN,
      costPrice: costN,
      stock: Number(stock) || 0,
      discountType: pctN > 0 ? 'PERCENT' : 'NONE',
      discountPercent: pctN > 0 ? pctN : 0,
      images: image ? [{ url: image, isPrimary: true }] : undefined
    };
    try {
      if (editing && product) await api.products.update(product.id, body);else
      await api.products.create(body);
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to save');
    } finally {setBusy(false);}
  };

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <div className="modal-head"><span>{editing ? 'Edit product' : 'New product'}</span><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <div className="modal-body">
          <div className="field-label">Product image</div>
          <ImagePicker url={image} onUrl={setImage} />

          <div className="row-fields">
            <div><div className="field-label">Name</div><input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Product 1" /></div>
            <div><div className="field-label">SKU</div><input className="field mono" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="A-001" /></div>
          </div>

          <div className="row-fields">
            <div><div className="field-label">MRP / actual price (₹)</div><input className="field mono" value={mrp} onChange={(e) => setMrp(e.target.value.replace(/\D/g, ''))} placeholder="250" /></div>
            <div><div className="field-label">Discount %</div><input className="field mono" value={pct} onChange={(e) => setPct(e.target.value.replace(/\D/g, ''))} placeholder="40" /></div>
          </div>

          <div className="row-fields">
            <div><div className="field-label">Cost price (₹) — for profit</div><input className="field mono" value={cost} onChange={(e) => setCost(e.target.value.replace(/\D/g, ''))} placeholder="120" /></div>
            <div><div className="field-label">Stock</div><input className="field mono" value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ''))} placeholder="100" /></div>
          </div>

          {/* live actual vs offer price */}
          <div className="offer-live">
            <span className="now">{rupee(offer)}</span>
            {pctN > 0 && <span className="was">{rupee(mrpN)}</span>}
            {pctN > 0 && <span className="pct">Save {rupee(mrpN - offer)} ({pctN}%)</span>}
          </div>
          {costN > 0 && <p className="muted sm" style={{ marginTop: 6 }}>Est. margin at this price: {rupee(profitEach)}/unit. Actual profit is taken from each order's bill.</p>}

          {err && <p style={{ color: 'var(--ember)', fontSize: 13 }}>{err}</p>}
          <button className="btn btn-ember wide" disabled={!valid || busy} onClick={save}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </div>
    </>);

}