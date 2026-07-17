import { useEffect, useState } from 'react';
import { LifeBuoy, Phone, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

export default function Support() {
  const [cfg, setCfg] = useState({ supportPhone: '' });
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { api.settings.getPublic().then((r) => setCfg((c) => ({ ...c, ...r }))).catch(() => {}); }, []);

  const wa = () => { const d = String(cfg.supportPhone || '').replace(/\D/g, ''); const n = d.length === 10 ? `91${d}` : d; return `https://wa.me/${n}`; };

  const submit = async () => {
    if (!subject.trim() || !message.trim()) { setError('Add a subject and describe your problem'); return; }
    setBusy(true); setError(null);
    try { await api.support.create({ type: 'SUPPORT', subject: subject.trim(), message: message.trim() }); setSent(true); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not send'); } finally { setBusy(false); }
  };

  return (
    <div className="cust-page">
      <h2 className="page-title">Help &amp; Support</h2>
      <p className="muted" style={{ marginTop: -8, marginBottom: 16 }}>We're here to help. Call or WhatsApp us, or send a message below — we usually reply within a few hours.</p>

      {cfg.supportPhone ? (
        <div className="support-contact">
          <div className="muted sm">Reach us directly</div>
          <div className="sc-actions">
            <a className="sc-btn call" href={`tel:${cfg.supportPhone}`}><Phone size={16} /> Call {cfg.supportPhone}</a>
            <a className="sc-btn wa" href={wa()} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp chat</a>
          </div>
        </div>
      ) : null}

      {sent ? (
        <div className="support-done"><CheckCircle2 size={34} /><h3>We got your message</h3><p className="muted">Our team will get back to you soon. You can also reach us on the numbers above.</p><button className="btn btn-go" onClick={() => { setSent(false); setSubject(''); setMessage(''); }}>Raise another query</button></div>
      ) : (
        <div className="support-form">
          <div className="sf-head"><LifeBuoy size={16} /> Tell us your problem</div>
          <div className="topic-chips">
            {['Order not confirmed', 'Payment issue', 'Delivery / tracking', 'Wrong or missing items', 'Other'].map((t) => (
              <button key={t} type="button" className={`tchip ${subject === t ? 'on' : ''}`} onClick={() => setSubject(t)}>{t}</button>
            ))}
          </div>
          <input className="field" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <textarea className="field ta" placeholder="Describe your problem…" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
          {error && <p className="otp-err" style={{ textAlign: 'left' }}>{error}</p>}
          <button className="btn btn-ember wide" disabled={busy} onClick={submit}><Send size={15} /> {busy ? 'Sending…' : 'Send to support'}</button>
        </div>
      )}
    </div>
  );
}
