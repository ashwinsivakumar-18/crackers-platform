import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { api } from '../api';
import { theme } from '../theme';
import { useAuth } from '../state/auth';

const EMPTY = { label: '', line1: '', line2: '', line3: '', city: '', state: '', pincode: '', lat: null, lng: null };

export default function LocationScreen() {
  const { user } = useAuth();
  const [locations, setLocations] = useState(null);
  const [adding, setAdding] = useState(false);
  const [nl, setNl] = useState(EMPTY);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = () => api.account.locations().then((r) => { setLocations(r.locations); setAdding(r.locations.length === 0); }).catch(() => setLocations([]));
  useEffect(() => { load(); }, []);
  const setL = (k, v) => setNl((l) => ({ ...l, [k]: v }));

  const useCurrent = async () => {
    setStatus('Getting your location…');
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') { setStatus('Permission denied — enter manually.'); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude: lat, longitude: lng } = pos.coords;
      let a = {};
      try { a = (await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng }))[0] || {}; } catch { a = {}; }
      setNl((l) => ({
        ...l, lat, lng,
        line1: [a.streetNumber, a.street || a.name].filter(Boolean).join(' ') || l.line1,
        line2: [a.district, a.subregion].filter(Boolean).join(', ') || l.line2,
        city: a.city || a.subregion || l.city, state: a.region || l.state, pincode: a.postalCode || l.pincode,
      }));
      setStatus('Location captured ✓ — check and save.');
    } catch { setStatus('Could not get location — enter manually.'); }
  };
  const save = async () => {
    if (!nl.line1.trim() || !nl.city.trim() || !/^\d{6}$/.test(nl.pincode)) { setError('Add address line 1, city and a 6-digit pincode'); return; }
    setBusy(true); setError(null);
    try { const r = await api.account.addLocation({ ...nl, lat: nl.lat ?? undefined, lng: nl.lng ?? undefined }); setLocations(r.locations); setAdding(false); setNl(EMPTY); setStatus(''); }
    catch (e) { setError(e.message || 'Could not save'); } finally { setBusy(false); }
  };
  const remove = async (id) => { const r = await api.account.removeLocation(id); setLocations(r.locations); if (r.locations.length === 0) setAdding(true); };
  const makeDefault = async (id) => { const r = await api.account.setDefaultLocation(id); setLocations(r.locations); };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={{ padding: 16 }}>
      <View style={s.card}>
        <View style={s.row}><Text style={s.muted}>Name</Text><Text style={s.b}>{user?.name || '—'}</Text></View>
        <View style={s.row}><Text style={s.muted}>Mobile</Text><Text style={s.b}>{user?.mobile}</Text></View>
        {user?.email ? <View style={s.row}><Text style={s.muted}>Email</Text><Text style={s.b}>{user.email}</Text></View> : null}
      </View>

      <Text style={s.h}>Delivery locations {locations ? `(${locations.length}/5)` : ''}</Text>
      {locations === null ? <ActivityIndicator color={theme.ember} /> : (
        <>
          {locations.map((l) => (
            <View key={l.id} style={[s.locCard, l.isDefault && s.locOn]}>
              <View style={{ flex: 1 }}>
                <Text style={s.locLabel}>{l.label || 'Address'}{l.isDefault ? '  · Default' : ''}</Text>
                <Text style={s.muted}>{[l.line1, l.line2, l.line3].filter(Boolean).join(', ')}</Text>
                <Text style={s.muted}>{[l.city, l.state, l.pincode].filter(Boolean).join(', ')}</Text>
              </View>
              <View style={{ gap: 8, alignItems: 'flex-end' }}>
                {!l.isDefault ? <TouchableOpacity onPress={() => makeDefault(l.id)}><Text style={{ fontSize: 16 }}>⭐</Text></TouchableOpacity> : null}
                <TouchableOpacity onPress={() => remove(l.id)}><Text style={{ fontSize: 16 }}>🗑</Text></TouchableOpacity>
              </View>
            </View>
          ))}
          {!adding && locations.length < 5 && <TouchableOpacity style={s.addBtn} onPress={() => setAdding(true)}><Text style={s.addTxt}>＋ Add location</Text></TouchableOpacity>}
          {adding && (
            <View style={s.form}>
              <TouchableOpacity style={s.locBtn} onPress={useCurrent}><Text style={s.locBtnTxt}>📍 Use my current location</Text></TouchableOpacity>
              {status ? <Text style={s.muted}>{status}</Text> : null}
              <TextInput style={s.input} placeholder="Address line 1" value={nl.line1} onChangeText={(t) => setL('line1', t)} />
              <TextInput style={s.input} placeholder="Address line 2" value={nl.line2} onChangeText={(t) => setL('line2', t)} />
              <TextInput style={s.input} placeholder="Address line 3 (optional)" value={nl.line3} onChangeText={(t) => setL('line3', t)} />
              <TextInput style={s.input} placeholder="City" value={nl.city} onChangeText={(t) => setL('city', t)} />
              <TextInput style={s.input} placeholder="State" value={nl.state} onChangeText={(t) => setL('state', t)} />
              <TextInput style={s.input} placeholder="Pincode" keyboardType="number-pad" value={nl.pincode} onChangeText={(t) => setL('pincode', t.replace(/\D/g, '').slice(0, 6))} />
              <TextInput style={s.input} placeholder="Label (Home, Shop…)" value={nl.label} onChangeText={(t) => setL('label', t)} />
              {error ? <Text style={s.err}>{error}</Text> : null}
              <TouchableOpacity style={s.saveBtn} disabled={busy} onPress={save}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Save location</Text>}</TouchableOpacity>
              {locations.length > 0 && <TouchableOpacity onPress={() => { setAdding(false); setNl(EMPTY); }}><Text style={[s.muted, { textAlign: 'center', marginTop: 8 }]}>Cancel</Text></TouchableOpacity>}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: theme.line, padding: 14, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  h: { fontSize: 16, fontWeight: '700', color: theme.ink, marginBottom: 10 },
  b: { fontWeight: '700', color: theme.ink }, muted: { color: theme.muted, fontSize: 13 },
  input: { backgroundColor: theme.paper, borderRadius: 11, padding: 12, marginBottom: 9 },
  locCard: { flexDirection: 'row', backgroundColor: '#fff', borderWidth: 1.5, borderColor: theme.line, borderRadius: 12, padding: 13, marginBottom: 10, gap: 10 },
  locOn: { borderColor: theme.green }, locLabel: { fontWeight: '700', color: theme.ink, marginBottom: 2 },
  addBtn: { borderWidth: 1.5, borderColor: theme.line, borderStyle: 'dashed', borderRadius: 12, padding: 13, alignItems: 'center', marginBottom: 10 }, addTxt: { color: theme.ember, fontWeight: '700' },
  form: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.line, borderRadius: 12, padding: 14 },
  locBtn: { backgroundColor: theme.ember, borderRadius: 11, padding: 13, alignItems: 'center', marginBottom: 10 }, locBtnTxt: { color: '#fff', fontWeight: '700' },
  saveBtn: { backgroundColor: theme.ink, borderRadius: 11, padding: 14, alignItems: 'center', marginTop: 4 }, btnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  err: { color: theme.ember, marginBottom: 8 },
});
