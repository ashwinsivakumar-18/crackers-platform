
import { useRef, useState } from 'react';
import { ChevronLeft, Truck, Store, ArrowRight, Upload, Copy, Check, ShieldCheck, X } from 'lucide-react';

import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { useCart } from '../../lib/cart';
import OtpLogin from '../OtpLogin';

const STORE_UPI = 'srilakshmicrackers@okhdfc';

export default function Checkout({ onBack, onPlaced }) {
  const cart = useCart();
  const [step, setStep] = useState('details');
  const [del, setDel] = useState('DELIVERY');
  const [form, setForm] = useState({ name: '', mobile: '', address: '', pincode: '' });

  const deliveryFee = del === 'STORE_PICKUP' ? 0 : cart.subtotal > 3000 ? 0 : 80;
  const total = cart.subtotal + deliveryFee;

  const detailsOk = form.name && /^[6-9]\d{9}$/.test(form.mobile) && (
  del === 'STORE_PICKUP' || form.address && /^\d{6}$/.test(form.pincode));

  const proceed = () => {
    if (api.client.tokens.getAccess()) setStep('pay');else
    setStep('auth');
  };

  return (
    <section className="checkout">
      <button className="link-back" onClick={onBack}><ChevronLeft size={16} /> Back to shop</button>
      <div className="co-grid">
        <div className="co-main">
          {step === 'details' &&
          <div className="card-pane">
              <h3>Where should we send it?</h3>
              <div className="seg">
                <button className={del === 'DELIVERY' ? 'on' : ''} onClick={() => setDel('DELIVERY')}><Truck size={16} /> Home delivery</button>
                <button className={del === 'STORE_PICKUP' ? 'on' : ''} onClick={() => setDel('STORE_PICKUP')}><Store size={16} /> Store pickup</button>
              </div>
              <div className="fields">
                <label className="fld"><span>Full name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>
                <label className="fld"><span>Mobile</span><input className="mono" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit mobile" /></label>
                {del === 'DELIVERY' && <>
                  <label className="fld wide"><span>Delivery address</span><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House, street, area, city" /></label>
                  <label className="fld"><span>Pincode</span><input className="mono" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="6-digit" /></label>
                </>}
              </div>
              <button className="btn btn-go wide" disabled={!detailsOk} onClick={proceed}>Continue to payment <ArrowRight size={17} /></button>
            </div>
          }

          {step === 'auth' &&
          <div className="card-pane">
              <OtpLogin onAuthed={() => setStep('pay')} />
            </div>
          }

          {step === 'pay' &&
          <PayUpload total={total} deliveryType={del} pincode={form.pincode}
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
          <div className="sum-row"><span>Delivery</span><b>{deliveryFee === 0 ? 'Free' : rupee(deliveryFee)}</b></div>
          <div className="sum-total"><span>Total</span><b>{rupee(total)}</b></div>
        </aside>
      </div>
    </section>);

}

function PayUpload({ total, deliveryType, pincode, onBack, onPlaced


}) {
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
        pincode: deliveryType === 'DELIVERY' ? pincode : undefined
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
          <button className="upi" onClick={() => {navigator.clipboard?.writeText(STORE_UPI);setCopied(true);setTimeout(() => setCopied(false), 1500);}}>
            {STORE_UPI} {copied ? <Check size={13} /> : <Copy size={13} />}
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