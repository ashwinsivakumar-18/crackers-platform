import { useState } from 'react';
import { ShieldCheck, User, Phone, Mail, Lock, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';

// Account auth: login (email/phone + password), register, and forgot-password.
// Kept as OtpLogin so existing imports keep working.
export default function OtpLogin({ onAuthed }) {
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  // shared fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  // forgot
  const [fStep, setFStep] = useState(1);
  const [newPass, setNewPass] = useState('');

  const emailOk = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
  const mobileOk = (v) => /^[6-9]\d{9}$/.test(v);
  const wrap = (fn) => async () => { setBusy(true); setError(null); setInfo(null); try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong'); } finally { setBusy(false); } };

  const doLogin = wrap(async () => {
    if (!identifier.trim() || !password) throw new Error('Enter your email/mobile and password');
    await api.auth.login(identifier.trim(), password);
    onAuthed && onAuthed();
  });
  const doRegister = wrap(async () => {
    if (!name.trim()) throw new Error('Enter your name');
    if (!/^[6-9]\d{9}$/.test(mobile)) throw new Error('Enter a valid 10-digit mobile');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Enter a valid email');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    await api.auth.register({ name: name.trim(), mobile, email: email.trim(), password });
    onAuthed && onAuthed();
  });
  const doForgotVerify = wrap(async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) throw new Error('Enter a valid 10-digit mobile');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Enter the email on your account');
    await api.auth.forgotVerify(mobile, email.trim());
    setFStep(2); setInfo('Verified — set a new password.');
  });
  const doForgotReset = wrap(async () => {
    if (newPass.length < 6) throw new Error('Password must be at least 6 characters');
    await api.auth.forgotReset(mobile, email.trim(), newPass);
    setMode('login'); setFStep(1); setPassword(''); setInfo('Password updated — please log in.');
  });

  const switchMode = (m) => { setMode(m); setError(null); setInfo(null); setFStep(1); };

  return (
    <div className="auth">
      <div className="otp-icon"><ShieldCheck size={22} /></div>

      {mode === 'login' && (
        <>
          <h3 className="otp-title">Welcome back</h3>
          <p className="muted sm">Log in with your email or mobile.</p>
          <Field icon={<User size={15} />}><input className="field" placeholder="Email or mobile" value={identifier} onChange={(e) => setIdentifier(e.target.value)} /></Field>
          <Field icon={<Lock size={15} />}><input className="field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          <button className="btn btn-ember wide" disabled={busy} onClick={doLogin}>{busy ? 'Logging in…' : 'Log in'}</button>
          <div className="auth-links">
            <button className="linktext" onClick={() => switchMode('forgot')}>Forgot password?</button>
            <button className="linktext" onClick={() => switchMode('register')}>Create account</button>
          </div>
        </>
      )}

      {mode === 'register' && (
        <>
          <h3 className="otp-title">Create your account</h3>
          <Field icon={<User size={15} />}><input className="field" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field icon={<Phone size={15} />}><input className="field" placeholder="Mobile" inputMode="numeric" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} /></Field>
          {mobile && !mobileOk(mobile) && <p className="otp-err" style={{ marginTop: 0, textAlign: 'left' }}>Mobile must be 10 digits starting with 6, 7, 8 or 9</p>}
          <Field icon={<Mail size={15} />}><input className="field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          {email && !emailOk(email) && <p className="otp-err" style={{ marginTop: 0, textAlign: 'left' }}>Enter a valid email address</p>}
          <Field icon={<Lock size={15} />}><input className="field" type="password" placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          <button className="btn btn-ember wide" disabled={busy || (!!email && !emailOk(email)) || (!!mobile && !mobileOk(mobile))} onClick={doRegister}>{busy ? 'Creating…' : 'Create account'}</button>
          <div className="auth-links"><button className="linktext" onClick={() => switchMode('login')}><ArrowLeft size={13} /> Back to login</button></div>
        </>
      )}

      {mode === 'forgot' && (
        <>
          <h3 className="otp-title">Reset password</h3>
          <p className="muted sm">Confirm your mobile and email, then set a new password.</p>
          <Field icon={<Phone size={15} />}><input className="field" placeholder="Mobile" inputMode="numeric" value={mobile} disabled={fStep === 2} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} /></Field>
          {mobile && !mobileOk(mobile) && <p className="otp-err" style={{ marginTop: 0, textAlign: 'left' }}>Mobile must be 10 digits starting with 6, 7, 8 or 9</p>}
          <Field icon={<Mail size={15} />}><input className="field" placeholder="Email" value={email} disabled={fStep === 2} onChange={(e) => setEmail(e.target.value)} /></Field>
          {email && !emailOk(email) && <p className="otp-err" style={{ marginTop: 0, textAlign: 'left' }}>Enter a valid email address</p>}
          {fStep === 1 ? (
            <button className="btn btn-ember wide" disabled={busy} onClick={doForgotVerify}>{busy ? 'Checking…' : 'Verify'}</button>
          ) : (
            <>
              <Field icon={<Lock size={15} />}><input className="field" type="password" placeholder="New password (min 6)" value={newPass} onChange={(e) => setNewPass(e.target.value)} /></Field>
              <button className="btn btn-ember wide" disabled={busy} onClick={doForgotReset}>{busy ? 'Saving…' : 'Set new password'}</button>
            </>
          )}
          <div className="auth-links"><button className="linktext" onClick={() => switchMode('login')}><ArrowLeft size={13} /> Back to login</button></div>
        </>
      )}

      {info && <p className="otp-info">{info}</p>}
      {error && <p className="otp-err">{error}</p>}
    </div>
  );
}

function Field({ icon, children }) {
  return <div className="ifield">{icon}{children}</div>;
}
