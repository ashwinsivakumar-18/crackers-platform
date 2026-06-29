import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../state/auth';

export default function LoginScreen({ onDone }) {
  const auth = useAuth();
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [purpose, setPurpose] = useState('REGISTER');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const send = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) return setError('Enter a valid 10-digit mobile');
    setBusy(true); setError(null);
    try { setPurpose(await auth.requestOtp(mobile)); setSent(true); }
    catch (e) { setError(e.message || 'Could not send OTP'); } finally { setBusy(false); }
  };
  const verify = async () => {
    setBusy(true); setError(null);
    try { await auth.verifyOtp(mobile, code, purpose, name); onDone && onDone(); }
    catch (e) { setError(e.message || 'Verification failed'); } finally { setBusy(false); }
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Sign in</Text>
      <Text style={s.sub}>We'll text you a one-time code.</Text>
      <TextInput style={s.input} placeholder="10-digit mobile" keyboardType="number-pad" value={mobile} onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))} editable={!sent} />
      {!sent ? (
        <>
          <TextInput style={s.input} placeholder="Your name (new customers)" value={name} onChangeText={setName} />
          <TouchableOpacity style={s.btn} disabled={busy} onPress={send}><Text style={s.btnTxt}>{busy ? 'Sending…' : 'Send OTP'}</Text></TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput style={s.input} placeholder="6-digit OTP" keyboardType="number-pad" value={code} onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))} />
          <TouchableOpacity style={s.btn} disabled={busy} onPress={verify}><Text style={s.btnTxt}>{busy ? 'Verifying…' : 'Verify & continue'}</Text></TouchableOpacity>
        </>
      )}
      {error && <Text style={s.err}>{error}</Text>}
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.paper, padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: theme.ink }, sub: { color: theme.muted, marginBottom: 20 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.line, borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16 },
  btn: { backgroundColor: theme.ember, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 }, btnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  err: { color: theme.ember, marginTop: 12 },
});
