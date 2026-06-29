
import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

/**
 * Customer OTP auth. Tries REGISTER first; if the account already exists the
 * backend returns 409, so we fall back to LOGIN. The purpose used at request
 * time is reused at verify time (the backend matches them).
 */
export default function OtpLogin({ onAuthed }) {
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [purpose, setPurpose] = useState('REGISTER');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {setError('Enter a valid 10-digit mobile');return;}
    setBusy(true);setError(null);
    try {
      try {
        await api.auth.requestOtp(mobile, 'REGISTER');
        setPurpose('REGISTER');
      } catch (e) {
        // 409 → already registered → log in instead
        await api.auth.requestOtp(mobile, 'LOGIN');
        setPurpose('LOGIN');
      }
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP');
    } finally {setBusy(false);}
  };

  const verify = async () => {
    if (code.length < 4) {setError('Enter the OTP');return;}
    setBusy(true);setError(null);
    try {
      await api.auth.verifyOtp(mobile, code, { purpose, name: name || undefined });
      onAuthed();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {setBusy(false);}
  };

  return (
    <div className="otp-card">
      <h3>Sign in to check out</h3>
      <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>We’ll send a one-time code to your mobile.</p>

      <label className="fld"><span>Mobile number</span>
        <input className="mono" value={mobile} disabled={sent}
        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" />
      </label>

      {!sent ?
      <>
          <label className="fld" style={{ marginTop: 12 }}><span>Name (new customers)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </label>
          <button className="btn btn-go wide" style={{ marginTop: 16 }} disabled={busy} onClick={sendOtp}>
            {busy ? 'Sending…' : 'Send OTP'}
          </button>
        </> :

      <>
          <label className="fld" style={{ marginTop: 12 }}><span>Enter OTP</span>
            <input className="mono" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" />
          </label>
          <button className="btn btn-go wide" style={{ marginTop: 16 }} disabled={busy} onClick={verify}>
            {busy ? 'Verifying…' : 'Verify & continue'}
          </button>
          <button className="sample" onClick={() => {setSent(false);setCode('');}}>Change number</button>
        </>
      }

      {error && <p className="err-text">{error}</p>}
      <p className="muted" style={{ fontSize: 11.5, marginTop: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
        <ShieldCheck size={13} /> Uses /auth/otp/request and /auth/otp/verify
      </p>
    </div>);

}