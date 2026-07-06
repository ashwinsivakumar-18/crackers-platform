import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { OTPWidget } from '@msg91comm/sendotp-sdk';
import { api } from '../api';
import { theme } from '../theme';
import { useAuth } from '../state/auth';

export default function LoginScreen({ onDone }) {
  const auth = useAuth();
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [reqId, setReqId] = useState(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Initialise the widget once the screen mounts (config comes from our backend).
  useEffect(() => {
    api.auth.otpConfig()
      .then(({ widgetId, widgetToken }) => {
        if (widgetId && widgetToken) { OTPWidget.initializeWidget(widgetId, widgetToken); setReady(true); }
        else setError('OTP not configured on the server yet.');
      })
      .catch(() => setError('Could not load OTP configuration.'));
  }, []);

  const send = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) return setError('Enter a valid 10-digit mobile');
    if (!ready) return setError('OTP widget still loading…');
    setBusy(true); setError(null);
    try {
      const res = await OTPWidget.sendOTP({ identifier: `91${mobile}` });
      if (res && (res.type === 'success' || res.message)) { setReqId(res.message || res.reqId); setSent(true); }
      else setError((res && res.message) || 'Could not send OTP');
    } catch { setError('Could not send OTP'); } finally { setBusy(false); }
  };
  const verify = async () => {
    if (otp.length < 4) return setError('Enter the OTP');
    setBusy(true); setError(null);
    try {
      const res = await OTPWidget.verifyOTP({ reqId, otp });
      const accessToken = res && (res.message || res.accessToken || res['access-token']);
      if (!accessToken || (res.type && res.type !== 'success')) { setError((res && res.message) || 'Incorrect OTP'); return; }
      await auth.completeMsg91(accessToken, name || undefined);
      onDone && onDone();
    } catch (e) { setError(e instanceof Error ? e.message : 'Verification failed'); } finally { setBusy(false); }
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Sign in</Text>
      <Text style={s.sub}>We'll text you a one-time code.</Text>
      <TextInput style={s.input} placeholder="10-digit mobile" keyboardType="number-pad" value={mobile} editable={!sent}
        onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))} />
      {!sent ? (
        <>
          <TextInput style={s.input} placeholder="Your name (new customers)" value={name} onChangeText={setName} />
          <TouchableOpacity style={s.btn} disabled={busy || !ready} onPress={send}><Text style={s.btnTxt}>{busy ? 'Sending…' : 'Send OTP'}</Text></TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput style={s.input} placeholder="Enter OTP" keyboardType="number-pad" value={otp} onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 8))} />
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
