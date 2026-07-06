import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { OTPWidget } from '@msg91comm/sendotp-sdk';
import { api } from '../lib/api';

// Customer auth via MSG91 OTP widget. The widget returns a JWT access-token on
// successful verification; we hand that to our backend, which confirms it with
// MSG91 (using the secret AuthKey) and logs the user in.
export default function OtpLogin({ onAuthed }) {
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [reqId, setReqId] = useState(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.auth.otpConfig()
      .then(({ widgetId, widgetToken }) => {
        if (widgetId && widgetToken) { OTPWidget.initializeWidget(widgetId, widgetToken); setReady(true); }
        else setError('OTP is not configured yet. Add MSG91 keys on the server.');
      })
      .catch(() => setError('Could not load OTP configuration.'));
  }, []);

  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) { setError('Enter a valid 10-digit mobile'); return; }
    if (!ready) { setError('OTP widget still loading — try again in a moment'); return; }
    setBusy(true); setError(null);
    try {
      const res = await OTPWidget.sendOTP({ identifier: `91${mobile}` });
      if (res && (res.type === 'success' || res.message)) { setReqId(res.message || res.reqId); setSent(true); }
      else setError((res && res.message) || 'Could not send OTP');
    } catch (e) { setError('Could not send OTP. Please try again.'); } finally { setBusy(false); }
  };

  const resend = async () => {
    setError(null);
    try { const res = await OTPWidget.retryOTP({ reqId }); if (res && res.message) setReqId(res.message); } catch { /* ignore */ }
  };

  const verify = async () => {
    if (otp.length < 4) { setError('Enter the OTP'); return; }
    setBusy(true); setError(null);
    try {
      const res = await OTPWidget.verifyOTP({ reqId, otp });
      const accessToken = res && (res.message || res.accessToken || res['access-token']);
      if (!accessToken || (res.type && res.type !== 'success')) { setError((res && res.message) || 'Incorrect OTP'); return; }
      await api.auth.verifyMsg91(accessToken, name || undefined);
      onAuthed && onAuthed();
    } catch (e) { setError(e instanceof Error ? e.message : 'Verification failed'); } finally { setBusy(false); }
  };

  return (
    <div className="otp">
      <div className="otp-icon"><ShieldCheck size={22} /></div>
      <h3 className="otp-title">Sign in with OTP</h3>
      <p className="muted sm">We'll text a one-time code to your mobile.</p>

      <input className="field" placeholder="10-digit mobile" inputMode="numeric" value={mobile} disabled={sent}
        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} />

      {!sent ? (
        <>
          <input className="field" placeholder="Your name (new customers)" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn btn-ember wide" disabled={busy || !ready} onClick={sendOtp}>{busy ? 'Sending…' : 'Send OTP'}</button>
        </>
      ) : (
        <>
          <input className="field" placeholder="Enter OTP" inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))} />
          <button className="btn btn-ember wide" disabled={busy} onClick={verify}>{busy ? 'Verifying…' : 'Verify & continue'}</button>
          <button className="linktext" onClick={resend}>Resend code</button>
        </>
      )}
      {error && <p className="otp-err">{error}</p>}
    </div>
  );
}
