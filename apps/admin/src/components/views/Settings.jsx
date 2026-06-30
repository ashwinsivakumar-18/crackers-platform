import { useEffect, useState } from 'react';
import { Plus, Trash2, ReceiptText, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { Loading } from '../ui';

// The reusable billing template — defaults the admin fills once and applies on any order.
export default function Settings() {
  const [billing, setBilling] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.settings.getBilling().then((r) => setBilling({ deliveryFee: r.billing.deliveryFee || 0, packingFee: r.billing.packingFee || 0, charges: r.billing.charges || [] })); }, []);
  if (!billing) return <Loading />;

  const set = (k, v) => setBilling({ ...billing, [k]: v });
  const total = (Number(billing.deliveryFee) || 0) + (Number(billing.packingFee) || 0) + billing.charges.reduce((s, c) => s + (Number(c.amount) || 0), 0);

  const save = async () => {
    setBusy(true); setSaved(false);
    try {
      await api.settings.updateBilling({
        deliveryFee: Number(billing.deliveryFee) || 0,
        packingFee: Number(billing.packingFee) || 0,
        charges: billing.charges.map((c) => ({ label: c.label, amount: Number(c.amount) || 0 })).filter((c) => c.label),
      });
      setSaved(true);
    } finally { setBusy(false); }
  };

  return (
    <div className="stack" style={{ maxWidth: 520 }}>
      <div className="panel">
        <div className="tl-title"><ReceiptText size={15} /> Billing template</div>
        <p className="muted sm">These defaults show up on every order's bill with one tap on "Apply template". You can still tweak charges per order.</p>

        <div className="bill-row"><span>Delivery charge (₹)</span><input className="field mono" style={{ width: 110, padding: 8 }} value={billing.deliveryFee} onChange={(e) => set('deliveryFee', e.target.value.replace(/\D/g, ''))} /></div>
        <div className="bill-row"><span>Packing charge (₹)</span><input className="field mono" style={{ width: 110, padding: 8 }} value={billing.packingFee} onChange={(e) => set('packingFee', e.target.value.replace(/\D/g, ''))} /></div>

        <div className="field-label" style={{ marginTop: 12 }}>Other named charges (optional)</div>
        {billing.charges.map((c, i) => (
          <div className="bill-row" key={i}>
            <input className="field" style={{ flex: 1, padding: 8, marginRight: 8 }} placeholder="e.g. Gift wrap" value={c.label} onChange={(e) => set('charges', billing.charges.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
            <input className="field mono" style={{ width: 100, padding: 8 }} value={c.amount} onChange={(e) => set('charges', billing.charges.map((x, j) => j === i ? { ...x, amount: e.target.value.replace(/\D/g, '') } : x))} />
            <button className="icon-btn sm" onClick={() => set('charges', billing.charges.filter((_, j) => j !== i))}><Trash2 size={14} /></button>
          </div>
        ))}
        <button className="linkbtn" onClick={() => set('charges', [...billing.charges, { label: '', amount: '' }])}><Plus size={14} /> Add a charge</button>

        <div className="bill-row total"><b>Template total</b><b className="mono">{rupee(total)}</b></div>
        <button className="btn btn-ember wide" disabled={busy} onClick={save}><Save size={15} /> {busy ? 'Saving…' : saved ? 'Saved ✓' : 'Save template'}</button>
      </div>
    </div>
  );
}
