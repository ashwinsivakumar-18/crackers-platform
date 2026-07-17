import { useState } from 'react';
import { Gift, PackageCheck, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { rupee } from '../../lib/format';

const TIERS = [
  { items: 15, price: 150, code: 'CSE-38' },
  { items: 20, price: 215, code: 'CSE-34' },
  { items: 30, price: 310, code: 'CSE-32' },
  { items: 40, price: 490, code: 'CSE-14' },
  { items: 50, price: 680, code: 'CSE-12' },
];

export default function BulkOrders() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!name.trim() || !/^[6-9]\d{9}$/.test(mobile)) { setError('Add your name and a valid 10-digit mobile'); return; }
    if (!message.trim()) { setError('Tell us what you need (quantity, occasion, budget)'); return; }
    setBusy(true); setError(null);
    try {
      await api.support.create({ type: 'ENQUIRY', subject: 'Bulk order enquiry', name: name.trim(), mobile, message: message.trim() });
      setSent(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not send'); } finally { setBusy(false); }
  };

  return (
    <div className="cust-page">
      <div className="bulk-hero">
        <span className="about-mark"><Gift size={22} /></span>
        <h2>Gift boxes & bulk orders</h2>
        <p className="muted">Diwali gifting, weddings, corporate hampers, resellers — we do custom gift boxes and wholesale cartons at special prices.</p>
      </div>

      <h3 className="sub-title"><PackageCheck size={16} /> Sample gift boxes</h3>
      <div className="tier-list">
        {TIERS.map((t) => (
          <div className="tier" key={t.code}>
            <div><div className="tier-name">{t.items}-item Gift Box</div><div className="muted sm">Box code {t.code}</div></div>
            <div className="tier-price">{rupee(t.price)}</div>
          </div>
        ))}
      </div>
      <p className="muted sm" style={{ marginTop: 8 }}>Prices are indicative and vary with contents and quantity. Send an enquiry for an exact quote.</p>

      {sent ? (
        <div className="support-done"><CheckCircle2 size={34} /><h3>Enquiry sent!</h3><p className="muted">Our team will reach out with a custom quote soon.</p></div>
      ) : (
        <div className="support-form" style={{ marginTop: 16 }}>
          <div className="sf-head"><Gift size={16} /> Send a bulk enquiry</div>
          <input className="field" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="field mono" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} />
          <textarea className="field ta" rows={4} placeholder="What do you need? (quantity, occasion, budget, delivery date)" value={message} onChange={(e) => setMessage(e.target.value)} />
          {error && <p className="otp-err" style={{ textAlign: 'left' }}>{error}</p>}
          <button className="btn btn-ember wide" disabled={busy} onClick={submit}><Send size={15} /> {busy ? 'Sending…' : 'Send enquiry'}</button>
        </div>
      )}
    </div>
  );
}
