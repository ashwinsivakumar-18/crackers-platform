import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../api';
import { theme, rupee } from '../theme';
import { useAuth } from '../state/auth';

const TIERS = [
  { items: 15, price: 150, code: 'CSE-38' },
  { items: 20, price: 215, code: 'CSE-34' },
  { items: 30, price: 310, code: 'CSE-32' },
  { items: 40, price: 490, code: 'CSE-14' },
  { items: 50, price: 680, code: 'CSE-12' },
];

export default function BulkOrdersScreen() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!name.trim() || !/^[6-9]\d{9}$/.test(mobile)) { setError('Add your name and a valid mobile'); return; }
    if (!message.trim()) { setError('Tell us what you need'); return; }
    setBusy(true); setError(null);
    try { await api.support.create({ type: 'ENQUIRY', subject: 'Bulk order enquiry', name: name.trim(), mobile, message: message.trim() }); setSent(true); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not send'); } finally { setBusy(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>Gift boxes & bulk orders</Text>
      <Text style={s.muted}>Diwali gifting, weddings, corporate hampers, resellers — custom gift boxes and wholesale cartons at special prices.</Text>
      <Text style={s.h}>Sample gift boxes</Text>
      {TIERS.map((t) => (
        <View style={s.tier} key={t.code}>
          <View style={{ flex: 1 }}><Text style={s.tierName}>{t.items}-item Gift Box</Text><Text style={s.muted}>Box code {t.code}</Text></View>
          <Text style={s.tierPrice}>{rupee(t.price)}</Text>
        </View>
      ))}
      <Text style={[s.muted, { marginTop: 6 }]}>Prices are indicative. Send an enquiry for an exact quote.</Text>

      {sent ? (
        <View style={s.done}><Text style={{ fontSize: 40 }}>✅</Text><Text style={s.doneTitle}>Enquiry sent!</Text><Text style={s.muted}>We'll reach out with a custom quote soon.</Text></View>
      ) : (
        <View style={s.form}>
          <Text style={s.formH}>Send a bulk enquiry</Text>
          <TextInput style={s.input} placeholder="Your name" value={name} onChangeText={setName} />
          <TextInput style={s.input} placeholder="Mobile" keyboardType="number-pad" value={mobile} onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))} />
          <TextInput style={[s.input, s.ta]} placeholder="What do you need? (quantity, occasion, budget)" multiline value={message} onChangeText={setMessage} />
          {error ? <Text style={s.err}>{error}</Text> : null}
          <TouchableOpacity style={s.btn} disabled={busy} onPress={submit}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Send enquiry</Text>}</TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: theme.ink }, muted: { color: theme.muted, fontSize: 12.5 },
  h: { fontSize: 16, fontWeight: '700', color: theme.ink, marginTop: 16, marginBottom: 8 },
  tier: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: theme.line, padding: 13, marginBottom: 8 },
  tierName: { fontWeight: '700', color: theme.ink }, tierPrice: { fontWeight: '800', color: theme.ember },
  form: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: theme.line, padding: 16, marginTop: 16 },
  formH: { fontWeight: '700', color: theme.ink, marginBottom: 10, fontSize: 16 },
  input: { backgroundColor: theme.paper, borderRadius: 11, padding: 13, marginBottom: 10 }, ta: { minHeight: 90, textAlignVertical: 'top' },
  btn: { backgroundColor: theme.ember, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 4 }, btnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  err: { color: theme.ember, marginBottom: 8 }, done: { alignItems: 'center', padding: 26 }, doneTitle: { fontSize: 18, fontWeight: '800', color: theme.ink, marginTop: 8 },
});
