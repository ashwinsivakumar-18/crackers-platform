
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '../lib/api';

export default function Login({ onLoggedIn }) {
  const [mobile, setMobile] = useState('9000000000');
  const [password, setPassword] = useState('ChangeMe@123');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setBusy(true);setError(null);
    try {await api.auth.staffLogin(mobile, password);onLoggedIn();}
    catch (e) {setError(e instanceof Error ? e.message : 'Sign in failed');} finally
    {setBusy(false);}
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--paper)' }}>
      <div className="modal" style={{ position: 'static', transform: 'none', width: 360 }}>
        <div className="modal-body" style={{ alignItems: 'stretch', textAlign: 'center' }}>
          <div className="brand-mark" style={{ margin: '0 auto 8px' }}><Sparkles size={18} /></div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 20, margin: 0 }}>Sri Lakshmi Crackers</h2>
          <p className="muted" style={{ fontSize: 13 }}>CRM &amp; Marketing</p>
          <div className="field-label" style={{ textAlign: 'left' }}>Staff mobile</div>
          <input className="field mono" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          <div className="field-label" style={{ textAlign: 'left' }}>Password</div>
          <input className="field mono" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          {error && <p className="err-text">{error}</p>}
          <button className="btn btn-ember wide" disabled={busy} onClick={submit} style={{ marginTop: 8 }}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>);

}