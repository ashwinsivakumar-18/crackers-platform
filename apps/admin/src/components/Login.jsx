
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '../lib/api';

export default function Login({ onLoggedIn }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.auth.staffLogin(mobile, password);
      onLoggedIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <div className="login-card">
        <div className="brand-mark big"><Sparkles size={20} /></div>
        <h2>Sivakumar Crackers</h2>
        <p className="muted">Operations console</p>
        <label>Staff mobile</label>
        <input className="field" type="tel" inputMode="numeric" autoComplete="username" placeholder="Enter staff mobile" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} />
        <label>Password</label>
        <input className="field" type="password" autoComplete="current-password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()} />
        {error && <p style={{ color: 'var(--ember)', fontSize: 13, marginTop: 8 }}>{error}</p>}
        <button className="btn btn-ember wide" disabled={busy} onClick={submit}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </div>
    </div>);

}
