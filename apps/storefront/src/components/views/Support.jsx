import { useEffect, useState } from 'react';
import { LifeBuoy, Phone, MessageCircle, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import PageIntro from '../PageIntro';

export default function Support() {
  const [cfg, setCfg] = useState({ supportPhone: '', supportEmail: '' });
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.settings.getPublic()
      .then((r) => setCfg((c) => ({ ...c, ...r })))
      .catch(() => {});
  }, []);

  const wa = () => {
    const d = String(cfg.supportPhone || '').replace(/\D/g, '');
    const n = d.length === 10 ? `91${d}` : d;
    return `https://wa.me/${n}`;
  };

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Please add a subject and describe your problem');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.support.create({ 
        type: 'SUPPORT', 
        subject: subject.trim(), 
        message: message.trim() 
      });
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send message');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setSent(false);
    setSubject('');
    setMessage('');
    setError(null);
  };

  const topics = [
    'Order not confirmed',
    'Payment issue',
    'Delivery / tracking',
    'Wrong or missing items',
    'Other'
  ];

  return (
    <div className="cust-page">
      <PageIntro icon={LifeBuoy} eyebrow="A LITTLE HELP, WHEN YOU NEED IT" title="Let’s make things simple.">Questions about your order, payment or delivery? Reach out to our team or leave a message below.</PageIntro>

      {cfg.supportPhone && (
        <div className="support-contact" style={{ marginBottom: 32 }}>
          <div className="muted sm" style={{ marginBottom: 12 }}>
            Reach us directly
          </div>
          <div className="sc-actions" style={{ display: 'flex', gap: 12 }}>
            <a 
              className="sc-btn call" 
              href={`tel:${cfg.supportPhone}`}
              style={{ padding: '10px 20px' }}
            >
              <Phone size={16} /> Call {cfg.supportPhone}
            </a>
            <a 
              className="sc-btn wa" 
              href={wa()} 
              target="_blank" 
              rel="noreferrer"
              style={{ padding: '10px 20px' }}
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      )}

      {sent ? (
        <div className="support-done" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <CheckCircle2 size={48} style={{ marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>We got your message!</h3>
          <p className="muted" style={{ marginBottom: 24 }}>
            Our team will get back to you soon.
          </p>
          <button className="btn btn-go" onClick={reset}>
            Ask another question
          </button>
        </div>
      ) : (
        <div className="support-form">
          <div className="sf-head" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            marginBottom: 20,
            fontWeight: 600
          }}>
            <LifeBuoy size={16} /> Tell us your problem
          </div>

          <div className="topic-chips" style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 10,
            marginBottom: 20 
          }}>
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                className={`tchip ${subject === t ? 'on' : ''}`}
                onClick={() => setSubject(t)}
                aria-pressed={subject === t}
              >
                {t}
              </button>
            ))}
          </div>

          <label className="form-label" htmlFor="support-subject">What can we help with?</label>
          <input
            id="support-subject"
            className="field"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ 
              width: '100%',
              padding: '12px 16px',
              marginBottom: 16,
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 14
            }}
          />

          <label className="form-label" htmlFor="support-message">Your message</label>
          <textarea
            id="support-message"
            className="field ta"
            placeholder="Describe your problem…"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ 
              width: '100%',
              padding: '12px 16px',
              marginBottom: 16,
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 14,
              resize: 'vertical',
              minHeight: 120
            }}
          />

          {error && (
            <p className="otp-err" style={{ 
              textAlign: 'left',
              color: '#dc3545',
              marginBottom: 16,
              padding: '8px 12px',
              background: '#f8d7da',
              borderRadius: 6
            }}>
              {error}
            </p>
          )}

          <button
            className="btn btn-ember wide"
            disabled={busy}
            onClick={submit}
            style={{ 
              width: '100%',
              padding: '14px',
              background: 'var(--ember)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10
            }}
          >
            {busy ? (
              <>
                <Loader2 size={18} className="spinning" />
                Sending…
              </>
            ) : (
              <>
                <Send size={16} />
                Send to support
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
