
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { useAsync, Loading, ErrorState } from '../ui';

export default function Catalog() {
  const { data, loading, error, reload } = useAsync(() => api.products.list({ limit: 100 }), []);
  const [creating, setCreating] = useState(false);

  return (
    <div className="stack">
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-ink" onClick={() => setCreating(true)}><Plus size={16} /> New product</button>
      </div>

      {loading ? <Loading /> : error || !data ? <ErrorState message={error ?? 'No data'} onRetry={reload} /> :
      <div className="panel p0">
          <table className="tbl">
            <thead><tr><th>Product</th><th>SKU</th><th>MRP</th><th>Selling</th><th>Stock</th></tr></thead>
            <tbody>
              {data.items.map((p) =>
            <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="mono">{p.sku}</td>
                  <td className="mono strike">{rupee(p.display?.mrp ?? p.mrp)}</td>
                  <td className="mono">{rupee(p.display?.sellingPrice ?? p.sellingPrice)}</td>
                  <td className="mono">{p.stock === 0 ? <span style={{ color: 'var(--ember)', fontWeight: 600 }}>Out</span> : p.stock}</td>
                </tr>
            )}
            </tbody>
          </table>
          {data.items.length === 0 && <div className="state">No products yet.</div>}
        </div>
      }

      {creating && <CreateProduct onClose={() => setCreating(false)} onCreated={() => {setCreating(false);reload();}} />}
    </div>);

}

function CreateProduct({ onClose, onCreated }) {
  const cats = useAsync(() => api.products.categories(), []);
  const [form, setForm] = useState({ name: '', sku: '', categoryId: '', mrp: '', discountPercent: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const set = (k, v) => setForm({ ...form, [k]: v });
  const valid = form.name && form.sku && form.categoryId && Number(form.mrp) > 0;

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.products.create({
        name: form.name,
        sku: form.sku,
        categoryId: form.categoryId,
        mrp: Number(form.mrp),
        // backend computes sellingPrice from discount
        ...(form.discountPercent ?
        { discountType: 'PERCENT', discountPercent: Number(form.discountPercent) } :
        { discountType: 'NONE' })
      });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <div className="modal-head"><span>New product</span><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <div className="modal-body">
          <div className="field-label">Name</div>
          <input className="field" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Sparkler Mega Box" />
          <div className="row-fields">
            <div>
              <div className="field-label">SKU</div>
              <input className="field mono" value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="SPK-100" />
            </div>
            <div>
              <div className="field-label">Category</div>
              <div className="sel" style={{ width: '100%' }}>
                <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select…</option>
                  {cats.data?.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="row-fields">
            <div>
              <div className="field-label">MRP (₹)</div>
              <input className="field mono" value={form.mrp} onChange={(e) => set('mrp', e.target.value.replace(/\D/g, ''))} placeholder="250" />
            </div>
            <div>
              <div className="field-label">Discount %</div>
              <input className="field mono" value={form.discountPercent} onChange={(e) => set('discountPercent', e.target.value.replace(/\D/g, ''))} placeholder="50" />
            </div>
          </div>
          {err && <p style={{ color: 'var(--ember)', fontSize: 13 }}>{err}</p>}
          <button className="btn btn-ember wide" disabled={!valid || busy} onClick={submit}>
            {busy ? 'Creating…' : 'Create product'}
          </button>
        </div>
      </div>
    </>);

}