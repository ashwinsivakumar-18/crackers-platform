import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../state/auth';

export default function LoginScreen({ onDone }) {
  const auth = useAuth();
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [fStep, setFStep] = useState(1);
  const [newPass, setNewPass] = useState('');

  const run = (fn) => async () => { setBusy(true); setError(null); setInfo(null); try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong'); } finally { setBusy(false); } };
  const emailOk = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
  const mobileOk = (v) => /^[6-9]\d{9}$/.test(v);

  const login = run(async () => { if (!identifier.trim() || !password) throw new Error('Enter email/mobile and password'); await auth.signIn(identifier.trim(), password); onDone && onDone(); });
  const register = run(async () => {
    if (!name.trim()) throw new Error('Enter your name');
    if (!/^[6-9]\d{9}$/.test(mobile)) throw new Error('Enter a valid 10-digit mobile');
    if (!emailOk(email)) throw new Error('Enter a valid email');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    await auth.signUp({ name: name.trim(), mobile, email: email.trim(), password }); onDone && onDone();
  });
  const fVerify = run(async () => { if (!/^[6-9]\d{9}$/.test(mobile)) throw new Error('Enter a valid mobile'); if (!emailOk(email)) throw new Error('Enter the account email'); await auth.forgotVerify(mobile, email.trim()); setFStep(2); setInfo('Verified — set a new password.'); });
  const fReset = run(async () => { if (newPass.length < 6) throw new Error('Min 6 characters'); await auth.forgotReset(mobile, email.trim(), newPass); setMode('login'); setFStep(1); setPassword(''); setInfo('Password updated — please log in.'); });

  const swap = (m) => { setMode(m); setError(null); setInfo(null); setFStep(1); };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={s.wrap}>
      {mode === 'login' && (<>
        <Text style={s.title}>Welcome back</Text>
        <Text style={s.sub}>Log in with your email or mobile.</Text>
        <TextInput style={s.input} placeholder="Email or mobile" autoCapitalize="none" value={identifier} onChangeText={setIdentifier} />
        <TextInput style={s.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={s.btn} disabled={busy} onPress={login}><Text style={s.btnTxt}>{busy ? 'Logging in…' : 'Log in'}</Text></TouchableOpacity>
        <View style={s.links}>
          <TouchableOpacity onPress={() => swap('forgot')}><Text style={s.link}>Forgot password?</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => swap('register')}><Text style={s.link}>Create account</Text></TouchableOpacity>
        </View>
      </>)}

      {mode === 'register' && (<>
        <Text style={s.title}>Create account</Text>
        <TextInput style={s.input} placeholder="Full name" value={name} onChangeText={setName} />
        <TextInput style={s.input} placeholder="Mobile" keyboardType="number-pad" value={mobile} onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))} />
        {mobile.length > 0 && !mobileOk(mobile) ? <Text style={s.err}>Mobile must be 10 digits starting with 6, 7, 8 or 9</Text> : null}
        <TextInput style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        {email.length > 0 && !emailOk(email) ? <Text style={s.err}>Enter a valid email address</Text> : null}
        <TextInput style={s.input} placeholder="Password (min 6)" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={s.btn} disabled={busy} onPress={register}><Text style={s.btnTxt}>{busy ? 'Creating…' : 'Create account'}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => swap('login')}><Text style={[s.link, { textAlign: 'center', marginTop: 12 }]}>← Back to login</Text></TouchableOpacity>
      </>)}

      {mode === 'forgot' && (<>
        <Text style={s.title}>Reset password</Text>
        <Text style={s.sub}>Confirm your mobile and email, then set a new password.</Text>
        <TextInput style={s.input} placeholder="Mobile" keyboardType="number-pad" editable={fStep === 1} value={mobile} onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))} />
        <TextInput style={s.input} placeholder="Email" autoCapitalize="none" editable={fStep === 1} value={email} onChangeText={setEmail} />
        {fStep === 1 ? (
          <TouchableOpacity style={s.btn} disabled={busy} onPress={fVerify}><Text style={s.btnTxt}>{busy ? 'Checking…' : 'Verify'}</Text></TouchableOpacity>
        ) : (<>
          <TextInput style={s.input} placeholder="New password (min 6)" secureTextEntry value={newPass} onChangeText={setNewPass} />
          <TouchableOpacity style={s.btn} disabled={busy} onPress={fReset}><Text style={s.btnTxt}>{busy ? 'Saving…' : 'Set new password'}</Text></TouchableOpacity>
        </>)}
        <TouchableOpacity onPress={() => swap('login')}><Text style={[s.link, { textAlign: 'center', marginTop: 12 }]}>← Back to login</Text></TouchableOpacity>
      </>)}

      {info ? <Text style={s.info}>{info}</Text> : null}
      {error ? <Text style={s.err}>{error}</Text> : null}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  wrap: { padding: 24, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: '800', color: theme.ink }, sub: { color: theme.muted, marginBottom: 16, marginTop: 2 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.line, borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16 },
  btn: { backgroundColor: theme.ember, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 }, btnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }, link: { color: theme.ember, fontWeight: '600' },
  info: { color: theme.green, marginTop: 12 }, err: { color: theme.ember, marginTop: 12 },
});
