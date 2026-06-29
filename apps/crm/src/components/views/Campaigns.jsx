
import { useEffect, useState } from 'react';
import { Plus, Send, MessageCircle, Mail, Bell, Users, ArrowLeft, Check, Eye, Sparkles } from 'lucide-react';

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
    <>
      <header className="top">
        <div><h1>Campaigns</h1><p className="muted sm">Reach customers on WhatsApp, email and push</p></div>
        <button className="btn btn-ember" onClick={() => setComposing(true)}><Plus size={16} /> New campaign</button>
      </header>
      <div className="content">
        {loading ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Could not load'} onRetry={reload} /> :
        <div className="camp-list">
            {data.items.length === 0 && <div className="state">No campaigns yet.</div>}
            {data.items.map((c) => {
            const I = CH[c.channel]?.icon ?? MessageCircle;
            return (
              <div className="camp" key={c.id}>
                  <span className="camp-ic" style={{ ['--c']: '#E8542A' }}><I size={17} /></span>
                  <div className="camp-mid"><b>{c.name}</b><span className="muted sm">{CH[c.channel]?.label ?? c.channel} · {c.status}</span></div>
                  <span className="sent-badge"><Check size={12} /> {c.status}</span>
                </div>);

          })}
          </div>
        }
      </div>
    </>);

}

function Composer({ onDone, onCancel }) {
  const statuses = useAsync(() => api.crm.statuses(), []);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('WHATSAPP');
  const [body, setBody] = useState('Namaskaram {{name}}! 🪔 Diwali crackers now up to 60% off at Sri Lakshmi. Order early — stock moves fast.');
  const [segStatuses, setSegStatuses] = useState([]);
  const [audience, setAudience] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const segment = { statusIds: segStatuses.length ? segStatuses : undefined };

  useEffect(() => {
    let cancelled = false;
    api.campaigns.previewAudience(segStatuses.length ? segment : undefined).
    then((r) => {if (!cancelled) setAudience(r.audienceSize);}).
    catch(() => setAudience(null));
    return () => {cancelled = true;};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segStatuses.join(',')]);

  const toggle = (id) => setSegStatuses((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const preview = body.replace(/\{\{name\}\}/g, 'Murugan Stores');

  const send = async () => {
    setBusy(true);setError(null);
    try {
      const { campaign } = await api.campaigns.create({
        name, type: 'FESTIVAL_OFFER', channel, body,
        segment: segStatuses.length ? segment : undefined
      });
      await api.campaigns.send(campaign.id);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send');
    } finally {setBusy(false);}
  };

  return (
    <>
      <header className="top">
        <div className="top-back" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="icon-btn" onClick={onCancel}><ArrowLeft size={18} /></button>
          <div><h1>New campaign</h1><p className="muted sm">Build your audience, write once, preview live</p></div>
        </div>
      </header>

      <div className="content composer">
        <div className="comp-main">
          <div className="panel"><input className="field big" value={name} onChange={(e) => setName(e.target.value)} placeholder="Campaign name (internal)" /></div>

          <div className="panel">
            <div className="panel-title"><Users size={15} /> Audience</div>
            <div className="seg-label">By status <span className="muted">— leave empty for everyone</span></div>
            <div className="seg-chips">
              {statuses.data?.statuses.map((s) =>
              <button key={s.id} className={`seg-chip ${segStatuses.includes(s.id) ? 'on' : ''}`} style={{ ['--c']: s.color }} onClick={() => toggle(s.id)}>
                  {segStatuses.includes(s.id) && <Check size={12} />} {s.name}
                </button>
              )}
            </div>
            <div className="audience"><Users size={15} /> <b className="mono">{audience ?? '…'}</b> customers will receive this</div>
          </div>

          <div className="panel">
            <div className="panel-title">Channel</div>
            <div className="ch-pick">
              {Object.keys(CH).map((k) => {const I = CH[k].icon;return (
                  <button key={k} className={`ch-btn ${channel === k ? 'on' : ''}`} onClick={() => setChannel(k)}><I size={16} /> {CH[k].label}</button>);
              })}
            </div>
            <div className="panel-title mt">Message</div>
            <textarea className="field area" rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>

          {error && <p className="err-text">{error}</p>}
          <button className="btn btn-ember wide send" disabled={!name.trim() || busy} onClick={send}>
            <Send size={16} /> {busy ? 'Sending…' : `Send to ${audience ?? 0} customers`}
          </button>
        </div>

        <div className="comp-preview">
          <div className="preview-label"><Eye size={14} /> Live preview</div>
          {channel === 'WHATSAPP' &&
          <div className="phone">
              <div className="wa-top"><span className="wa-av"><Sparkles size={13} /></span><div><b>Sri Lakshmi Crackers</b><span>business account</span></div></div>
              <div className="wa-body"><div className="wa-bubble">{preview}<span className="wa-time">11:24 AM</span></div></div>
            </div>
          }
          {channel === 'EMAIL' &&
          <div className="email">
              <div className="em-head"><b>{name || 'Your subject line'}</b><span className="muted sm">Sri Lakshmi Crackers</span></div>
              <div className="em-body"><div className="em-logo"><Sparkles size={18} /></div><p>{preview}</p><button className="em-cta">Shop now</button></div>
            </div>
          }
          {channel === 'PUSH' &&
          <div className="push-wrap">
              <div className="push"><span className="push-ic"><Sparkles size={15} /></span><div><b>Sri Lakshmi Crackers</b><p>{preview}</p></div></div>
              <span className="muted sm">Lock-screen notification</span>
            </div>
          }
        </div>
      </div>
    </>);

}