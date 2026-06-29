
import { useEffect, useState } from 'react';
import { Plus, Send, MessageCircle, Mail, Bell, Users, ArrowLeft, Check } from 'lucide-react';

import { api } from '../../lib/api';
import { useAsync, Loading, ErrorState } from '../ui';

const CH = {
  WHATSAPP: { label: 'WhatsApp', icon: MessageCircle },
  EMAIL: { label: 'Email', icon: Mail },
  PUSH: { label: 'Push', icon: Bell }
};


export default function Campaigns() {
  const [composing, setComposing] = useState(false);
  const { data, loading, error, reload } = useAsync(() => api.campaigns.list(), []);

  if (composing) return <Composer onDone={() => {setComposing(false);reload();}} onCancel={() => setComposing(false)} />;

  return (
    <div className="stack">
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-ember" onClick={() => setComposing(true)}><Plus size={16} /> New campaign</button>
      </div>
      {loading ? <Loading /> : error || !data ? <ErrorState message={error ?? 'No data'} onRetry={reload} /> :
      <div className="stack">
          {data.items.length === 0 && <div className="state">No campaigns yet.</div>}
          {data.items.map((c) => {
          const I = CH[c.channel]?.icon ?? MessageCircle;
          return (
            <div className="panel" key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--ember-soft)', color: 'var(--ember)', display: 'grid', placeItems: 'center' }}><I size={17} /></span>
                <div style={{ flex: 1 }}>
                  <b>{c.name}</b>
                  <div className="muted sm">{CH[c.channel]?.label ?? c.channel} · {c.status}</div>
                </div>
                <span className={`badge t-${c.status === 'SENT' ? 'green' : c.status === 'SENDING' ? 'gold' : 'muted'}`}>{c.status}</span>
              </div>);

        })}
        </div>
      }
    </div>);

}

function Composer({ onDone, onCancel }) {
  const statuses = useAsync(() => api.crm.statuses(), []);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('WHATSAPP');
  const [body, setBody] = useState('Namaskaram {{name}}! 🪔 Diwali crackers now up to 60% off. Order early — stock moves fast.');
  const [segStatuses, setSegStatuses] = useState([]);
  const [audience, setAudience] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const segment = { statusIds: segStatuses.length ? segStatuses : undefined };

  // Live audience preview whenever the segment changes.
  useEffect(() => {
    let cancelled = false;
    api.campaigns.previewAudience(segment).then((r) => {if (!cancelled) setAudience(r.audienceSize);}).catch(() => setAudience(null));
    return () => {cancelled = true;};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segStatuses.join(',')]);

  const toggle = (id) => setSegStatuses((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const send = async () => {
    setBusy(true);
    setErr(null);
    try {
      const { campaign } = await api.campaigns.create({
        name, type: 'FESTIVAL_OFFER', channel, body,
        segment: segStatuses.length ? segment : undefined
      });
      await api.campaigns.send(campaign.id);
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to send');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack">
      <button className="linkbtn" onClick={onCancel} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><ArrowLeft size={15} /> Back to campaigns</button>

      <div className="panel">
        <input className="field" style={{ fontSize: 16, fontWeight: 600 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Campaign name (internal)" />
      </div>

      <div className="panel">
        <div className="field-label">Audience by status — leave empty for everyone</div>
        <div className="seg-chips" style={{ marginTop: 8 }}>
          {statuses.data?.statuses.map((s) =>
          <button key={s.id} className={`seg-chip ${segStatuses.includes(s.id) ? 'on' : ''}`} onClick={() => toggle(s.id)}>
              {segStatuses.includes(s.id) && <Check size={12} />} {s.name}
            </button>
          )}
        </div>
        <div className="audience"><Users size={15} /> <b className="mono">{audience ?? '…'}</b> customers will receive this</div>
      </div>

      <div className="panel">
        <div className="field-label">Channel</div>
        <div className="ch-pick">
          {Object.keys(CH).map((k) => {
            const I = CH[k].icon;
            return <button key={k} className={`ch-btn ${channel === k ? 'on' : ''}`} onClick={() => setChannel(k)}><I size={16} /> {CH[k].label}</button>;
          })}
        </div>
        <div className="field-label">Message</div>
        <textarea className="field" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>

      {err && <p style={{ color: 'var(--ember)', fontSize: 13 }}>{err}</p>}
      <button className="btn btn-ember wide" disabled={!name.trim() || busy} onClick={send}>
        <Send size={16} /> {busy ? 'Sending…' : `Send to ${audience ?? 0} customers`}
      </button>
    </div>);

}