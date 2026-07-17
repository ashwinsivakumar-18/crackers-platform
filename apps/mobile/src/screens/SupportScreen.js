import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Linking, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../api';
import { theme } from '../theme';

export default function SupportScreen() {
  const [cfg, setCfg] = useState({ supportPhone: '' });
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { api.settings.getPublic().then((r) => setCfg((c) => ({ ...c, ...r }))).catch(() => {}); }, []);
  const waNum = () => { const d = String(cfg.supportPhone || '').replace(/\D/g, ''); return d.length === 10 ? `91${d}` : d; };

  const submit = async () => {
    if (!subject.trim() || !message.trim()) { setError('Add a subject and describe your problem'); return; }
    setBusy(true); setError(null);
    try { await api.support.create({ type: 'SUPPORT', subject: subject.trim(), message: message.trim() }); setSent(true); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not send'); } finally { setBusy(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={{ padding: 16 }}>
      {cfg.supportPhone ? (
        <View style={s.contact}>
          <Text style={s.muted}>Reach us directly</Text>
          <View style={s.row}>
            <TouchableOpacity style={[s.cbtn, { backgroundColor: theme.ink }]} onPress={() => Linking.openURL(`tel:${cfg.supportPhone}`)}><Text style={s.cbtnTxt}>📞 Call</Text></TouchableOpacity>
            <TouchableOpacity style={[s.cbtn, { backgroundColor: '#25D366' }]} onPress={() => Linking.openURL(`https://wa.me/${waNum()}`)}><Text style={s.cbtnTxt}>💬 WhatsApp</Text></TouchableOpacity>
          </View>
        </View>
      ) : null}

      {sent ? (
        <View style={s.done}>
          <Text style={{ fontSize: 40 }}>✅</Text>
          <Text style={s.doneTitle}>We got your message</Text>
          <Text style={s.muted}>Our team will get back to you soon.</Text>
          <TouchableOpacity style={s.btn} onPress={() => { setSent(false); setSubject(''); setMessage(''); }}><Text style={s.btnTxt}>Raise another</Text></TouchableOpacity>
        </View>
      ) : (
        <View style={s.form}>
          <Text style={s.h}>Tell us your problem</Text>
          <View style={s.chips}>
            {['Order not confirmed', 'Payment issue', 'Delivery / tracking', 'Wrong or missing items', 'Other'].map((t) => (
              <TouchableOpacity key={t} style={[s.chip, subject === t && s.chipOn]} onPress={() => setSubject(t)}>
                <Text style={[s.chipTxt, subject === t && { color: '#fff' }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={s.input} placeholder="Subject" value={subject} onChangeText={setSubject} />
          <TextInput style={[s.input, s.ta]} placeholder="Describe your problem…" multiline value={message} onChangeText={setMessage} />
          {error ? <Text style={s.err}>{error}</Text> : null}
          <TouchableOpacity style={s.btn} disabled={busy} onPress={submit}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Send to support</Text>}</TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  contact: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: theme.line, padding: 14, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cbtn: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' }, cbtnTxt: { color: '#fff', fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 10 }, chip: { borderWidth: 1, borderColor: theme.line, borderRadius: 18, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: '#fff' }, chipOn: { backgroundColor: theme.ember, borderColor: theme.ember }, chipTxt: { fontSize: 12.5, fontWeight: '600', color: theme.ink },
  form: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: theme.line, padding: 16 },
  h: { fontWeight: '700', color: theme.ink, marginBottom: 10, fontSize: 16 },
  input: { backgroundColor: theme.paper, borderRadius: 11, padding: 13, marginBottom: 10 }, ta: { minHeight: 110, textAlignVertical: 'top' },
  btn: { backgroundColor: theme.ember, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 4 }, btnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  muted: { color: theme.muted, fontSize: 12.5 }, err: { color: theme.ember, marginBottom: 8 },
  done: { alignItems: 'center', padding: 30 }, doneTitle: { fontSize: 18, fontWeight: '800', color: theme.ink, marginTop: 8 },
});
