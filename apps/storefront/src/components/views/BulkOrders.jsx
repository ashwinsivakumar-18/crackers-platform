import { useState } from 'react';
import { Gift, PackageCheck, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { rupee } from '../../lib/format';
import { GIFT_TIERS as TIERS } from '../../lib/giftBoxes';
import PageIntro from '../PageIntro';

const MIN_BOXES = 150;

export default function BulkOrders() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [tierCode, setTierCode] = useState(TIERS[0].code);
  const [quantity, setQuantity] = useState(String(MIN_BOXES));
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!name.trim() || !/^[6-9]\d{9}$/.test(mobile)) { setError('Add your name and a valid 10-digit mobile'); return; }
    const boxes = Number(quantity);
    if (!Number.isInteger(boxes) || boxes < MIN_BOXES) { setError(`Minimum bulk order is ${MIN_BOXES} boxes`); return; }
    if (!message.trim()) { setError('Tell us what you need (quantity, occasion, budget)'); return; }
    const tier = TIERS.find((item) => item.code === tierCode) || TIERS[0];
    setBusy(true); setError(null);
    try {
      await api.support.create({
        type: 'ENQUIRY',
        subject: `Bulk order: ${tier.items}-item Gift Box`,
        name: name.trim(),
        mobile,
        message: `${tier.items}-item Gift Box (${tier.code}) at ${rupee(tier.price)} per box; Quantity: ${boxes} boxes. Customer note: ${message.trim()}`,
      });
      setSent(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not send'); } finally { setBusy(false); }
  };

  return (
    <div className="cust-page">
      <PageIntro icon={Gift} eyebrow="A GIFT FOR EVERY CELEBRATION" title="Small boxes. Big smiles.">For your team, your family or your next big occasion. Choose a gift box below and tell us what you have in mind.</PageIntro>
      <div className="page-facts"><span>Starting at <b>₹185 / box</b></span><span>Minimum order <b>{MIN_BOXES} boxes</b></span><span>Choose from <b>5 gift boxes</b></span></div>

      <h3 className="sub-title"><PackageCheck size={16} /> Choose your celebration box</h3>
      <div className="tier-list selectable-tiers">
        {TIERS.map((t) => (
          <button type="button" aria-pressed={tierCode === t.code} className={`tier ${tierCode === t.code ? 'selected' : ''}`} key={t.code} onClick={() => setTierCode(t.code)}>
            <Gift size={24} aria-hidden="true" />
            <div><div className="tier-name">{t.items}-item Gift Box</div><div className="muted sm">Case {t.code}</div></div>
            <div className="tier-price">{rupee(t.price)}<small> per box</small></div>
          </button>
        ))}
      </div>
      <div className="bulk-min"><PackageCheck size={16} /> Orders are accepted from a minimum of {MIN_BOXES} boxes.</div>

      {sent ? (
        <div className="support-done"><CheckCircle2 size={34} /><h3>Enquiry sent!</h3><p className="muted">Our team will reach out with a custom quote soon.</p></div>
      ) : (
        <div className="support-form" style={{ marginTop: 16 }}>
          <div className="sf-head"><Gift size={16} /> Send a bulk enquiry</div>
          <label className="form-label" htmlFor="bulk-name">Your name</label>
          <input id="bulk-name" className="field" autoComplete="name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="form-label" htmlFor="bulk-mobile">Mobile number</label>
          <input id="bulk-mobile" className="field" type="tel" autoComplete="tel" placeholder="10-digit mobile" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} />
          <label className="form-label" htmlFor="bulk-tier">Your gift box</label>
          <select id="bulk-tier" className="field" value={tierCode} onChange={(e) => setTierCode(e.target.value)}>
            {TIERS.map((t) => <option key={t.code} value={t.code}>{t.items}-item Gift Box · {rupee(t.price)} · {t.code}</option>)}
          </select>
          <label className="form-label" htmlFor="bulk-quantity">Number of boxes · minimum {MIN_BOXES}</label>
          <input id="bulk-quantity" className="field" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))} />
          <label className="form-label" htmlFor="bulk-message">Tell us about your celebration</label>
          <textarea id="bulk-message" className="field ta" rows={4} placeholder="Occasion, delivery date and other requirements" value={message} onChange={(e) => setMessage(e.target.value)} />
          {error && <p className="otp-err" style={{ textAlign: 'left' }}>{error}</p>}
          <button className="btn btn-ember wide" disabled={busy} onClick={submit}><Send size={15} /> {busy ? 'Sending…' : 'Send enquiry'}</button>
        </div>
      )}
    </div>
  );
}
