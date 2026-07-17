
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, Truck, ArrowRight, Upload, Copy, Check, ShieldCheck, X, ShoppingBag, MapPin, Plus, Trash2 } from 'lucide-react';

import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { useCart } from '../../lib/cart';
import OtpLogin from '../OtpLogin';
import LocationForm from '../LocationForm';
import { Loading } from '../ui';

const STORE_UPI = 'sivakumarcrackers@okhdfc';

export default function Checkout({ onBack, onPlaced }) {
  const cart = useCart();
  const del = 'DELIVERY';
  const [step, setStep] = useState(api.client.tokens.getAccess() ? 'details' : 'auth');
  const [cfg, setCfg] = useState({ minOrderAmount: 3500, packTransportPct: 5, storeUpiId: STORE_UPI });
  const [me, setMe] = useState({ name: '', mobile: '' });
  const [locations, setLocations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [loadingLocs, setLoadingLocs] = useState(false);

  useEffect(() => { api.settings.getPublic().then((r) => setCfg((c) => ({ ...c, ...r }))).catch(() => {}); }, []);

  // On the details step (logged in), load the account + saved locations.
  useEffect(() => {
    if (step !== 'details') return;
    setLoadingLocs(true);
    Promise.all([api.auth.me().catch(() => null), api.account.locations().catch(() => ({ locations: [] }))])
      .then(([m, l]) => {
        if (m && m.user) setMe({ name: m.user.name || '', mobile: m.user.mobile || '' });
        const locs = l.locations || [];
        setLocations(locs);
        setSelectedId((prev) => prev || (locs.find((x) => x.isDefault) || {}).id || (locs[0] || {}).id || null);
        setAdding(locs.length === 0);
      })
      .finally(() => setLoadingLocs(false));
  }, [step]);

  const selected = locations.find((l) => l.id === selectedId);
  const pct = cfg.packTransportPct;
  const packTransport = Math.round((cart.subtotal * pct) / 100);
  const total = cart.subtotal + packTransport;
  const belowMin = cart.subtotal < cfg.minOrderAmount;
  const shortBy = cfg.minOrderAmount - cart.subtotal;

  // Can only order with a saved delivery location (details + location) and above the minimum.
  const detailsOk = !belowMin && !!selected;

  const composedAddress = selected ? [selected.line1, selected.line2, selected.line3, selected.city, selected.state].filter(Boolean).join(', ') : '';
  const onLocationsSaved = (locs) => { setLocations(locs); setAdding(false); const latest = locs[locs.length - 1]; if (latest) setSelectedId(latest.id); };
  const removeLoc = async (id) => { const r = await api.account.removeLocation(id); setLocations(r.locations); if (selectedId === id) setSelectedId((r.locations.find((x) => x.isDefault) || r.locations[0] || {}).id || null); if (r.locations.length === 0) setAdding(true); };
  const proceed = () => setStep('pay');

  if (cart.count === 0) {
    return (
      <section className="checkout">
        <button className="link-back" onClick={onBack}><ChevronLeft size={16} /> Back to shop</button>
        <div className="cust-empty"><ShoppingBag size={40} /><h3>Your cart is empty</h3><p>Add some crackers to get started.</p><button className="btn btn-go" onClick={onBack}>Browse products</button></div>
      </section>
    );
  }

  return (
    <section className="checkout">
      <button className="link-back" onClick={onBack}><ChevronLeft size={16} /> Back to shop</button>
      <div className="co-grid">
        <div className="co-main">
          {step === 'details' &&
          <div className="card-pane">
              <h3>Where should we send it?</h3>
              {belowMin && <div className="min-note">Minimum order is {rupee(cfg.minOrderAmount)}. Add {rupee(shortBy)} more to continue.</div>}
              <div className="deliver-note"><Truck size={16} /> {me.name || 'Your account'}{me.mobile ? ` · ${me.mobile}` : ''} — home delivery</div>
              <div className="hub-note">🇮🇳 We deliver all over India — your order reaches your nearby Delivery Hub.</div>

              {loadingLocs ? <Loading /> : (
                <div className="loc-pick">
                  {locations.map((l) => (
                    <button key={l.id} className={`loc-card ${selectedId === l.id ? 'on' : ''}`} onClick={() => setSelectedId(l.id)}>
                      <span className="loc-radio" />
                      <span className="lc-body">
                        <span className="lc-label"><MapPin size={13} /> {l.label || 'Address'} {l.isDefault && <span className="tag-default">Default</span>}</span>
                        <span className="lc-addr">{[l.line1, l.line2, l.line3].filter(Boolean).join(', ')}<br />{[l.city, l.state, l.pincode].filter(Boolean).join(', ')}</span>
                      </span>
                      <span className="lc-del" onClick={(e) => { e.stopPropagation(); removeLoc(l.id); }}><Trash2 size={15} /></span>
                    </button>
                  ))}
                  {!adding && locations.length > 0 && <button className="add-loc-btn" onClick={() => setAdding(true)}><Plus size={16} /> Add another location</button>}
                  {adding && <LocationForm onSaved={onLocationsSaved} onCancel={locations.length ? () => setAdding(false) : undefined} />}
                  {locations.length === 0 && !adding && <p className="muted sm">Add a delivery location to continue.</p>}
                </div>
              )}

              <button className="btn btn-go wide" disabled={!detailsOk} onClick={proceed}>Confirm &amp; continue <ArrowRight size={17} /></button>
              {!selected && !loadingLocs && locations.length > 0 && <p className="muted sm" style={{ textAlign: 'center' }}>Select a delivery location above.</p>}
            </div>
          }

          {step === 'auth' &&
          <div className="card-pane">
              <OtpLogin onAuthed={() => setStep('details')} />
            </div>
          }

          {step === 'pay' &&
          <PayUpload total={total} deliveryType={del} pincode={selected ? selected.pincode : ''} storeUpi={cfg.storeUpiId} address={composedAddress}
          onBack={() => setStep('details')} onPlaced={onPlaced} />
          }
        </div>

        <aside className="co-summary">
          <h4>Order summary</h4>
          <div className="sum-items">
            {cart.lines.map((l) =>
            <div className="sum-line" key={l.product.id}>
                <span>{l.product.name} <em>×{l.quantity}</em></span>
                <b>{rupee((l.product.display?.sellingPrice ?? l.product.sellingPrice) * l.quantity)}</b>
              </div>
            )}
          </div>
          <div className="sum-row"><span>Subtotal</span><b>{rupee(cart.subtotal)}</b></div>
          <div className="sum-row"><span>Packaging &amp; transportation ({pct}%)</span><b>{packTransport === 0 ? '—' : rupee(packTransport)}</b></div>
          <div className="sum-total"><span>Total</span><b>{rupee(total)}</b></div>
          {belowMin && <div className="min-note sm">Min order {rupee(cfg.minOrderAmount)} · add {rupee(shortBy)} more</div>}
        </aside>
      </div>
    </section>);

}

function PayUpload({ total, deliveryType, pincode, storeUpi, address, onBack, onPlaced }) {
  const cart = useCart();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ref, setRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const pick = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const place = async () => {
    if (!file) return;
    setBusy(true);setError(null);
    try {
      // 1) place the order (PENDING_PAYMENT)
      const { order } = await api.orders.place({
        items: cart.lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        deliveryType,
        address: deliveryType === 'DELIVERY' ? address : undefined,
        pincode: deliveryType === 'DELIVERY' ? pincode : undefined,
      });
      // 2) upload the screenshot, 3) attach the payment proof
      const { url } = await api.uploads.image(file);
      await api.orders.uploadPayment(order.id, { method: 'UPI', amount: total, screenshotUrl: url, referenceNo: ref || undefined });
      cart.clear();
      onPlaced(order);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not place the order');
    } finally {setBusy(false);}
  };

  return (
    <div className="card-pane">
      <button className="link-back sm" onClick={onBack}><ChevronLeft size={15} /> Edit details</button>
      <h3>Pay {rupee(total)} & upload your screenshot</h3>

      <div className="pay-steps" style={{ margin: '14px 0' }}>
        <div className="pay-step"><b>1</b><div>Pay <strong>{rupee(total)}</strong> to our UPI ID
          <button className="upi" onClick={() => {navigator.clipboard?.writeText(storeUpi);setCopied(true);setTimeout(() => setCopied(false), 1500);}}>
            {storeUpi} {copied ? <Check size={13} /> : <Copy size={13} />}
          </button></div></div>
        <div className="pay-step"><b>2</b><div>Screenshot the success page</div></div>
        <div className="pay-step"><b>3</b><div>Upload it — we verify by hand and confirm</div></div>
      </div>

      <div className="uploader">
        {!preview ?
        <div className="drop" onClick={() => inputRef.current?.click()}>
            <Upload size={22} /><b>Upload payment screenshot</b><span>PNG or JPG</span>
          </div> :

        <div className="preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="payment" />
            <div className="preview-meta"><Check size={15} /> <span>{file?.name}</span>
              <button onClick={() => {setFile(null);setPreview(null);}}><X size={15} /></button>
            </div>
          </div>
        }
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      </div>

      <label className="fld" style={{ marginTop: 14 }}><span>UPI reference no. (optional)</span>
        <input className="mono" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. 4281938475" />
      </label>

      {error && <p className="err-text">{error}</p>}
      <button className="btn btn-go wide" style={{ marginTop: 14 }} disabled={!file || busy} onClick={place}>
        {busy ? 'Placing your order…' : <>Place order · {rupee(total)} <ArrowRight size={17} /></>}
      </button>
      <p className="hint" style={{ marginTop: 10 }}><ShieldCheck size={13} /> No gateway. Confirmed once we verify your screenshot.</p>
    </div>);

}