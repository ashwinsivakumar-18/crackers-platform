import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { api } from '../api';
import { theme } from '../theme';

export default function LocationScreen() {
  const [loc, setLoc] = useState({ lat: null, lng: null, line1: '', line2: '', city: '', state: '', pincode: '' });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.auth.me().then((r) => { if (r.user?.location) setLoc((l) => ({ ...l, ...r.user.location })); }).catch(() => {}); }, []);

  const useCurrent = async () => {
    setStatus('Requesting permission…');
    const { status: perm } = await Location.requestForegroundPermissionsAsync();
    if (perm !== 'granted') { setStatus('Permission denied. Enable location to continue.'); return; }
    setStatus('Getting your location…');
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude: lat, longitude: lng } = pos.coords;
      const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const a = places[0] || {};
      setLoc((l) => ({
        ...l, lat, lng,
        line1: [a.streetNumber, a.street || a.name].filter(Boolean).join(' ') || l.line1,
        line2: [a.district, a.subregion].filter(Boolean).join(', ') || l.line2,
        city: a.city || a.subregion || l.city, state: a.region || l.state, pincode: a.postalCode || l.pincode,
      }));
      setStatus('Location captured. Review and save.');
    } catch { setStatus('Could not get location. Try again.'); }
  };

  const set = (k, v) => setLoc({ ...loc, [k]: v });
  const save = async () => { setBusy(true); setSaved(false); try { await api.account.saveLocation(loc); setSaved(true); setStatus('Saved! Your store can see this.'); } finally { setBusy(false); } };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={{ padding: 16 }}>
      <TouchableOpacity style={s.locate} onPress={useCurrent}><Text style={s.locateTxt}>📍 Use my current location</Text></TouchableOpacity>
      {!!status && <Text style={s.muted}>{status}</Text>}
      {loc.lat != null && (
        <TouchableOpacity onPress={() => Linking.openURL(`https://maps.google.com/?q=${loc.lat},${loc.lng}`)}>
          <Text style={s.maplink}>View {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)} on map ›</Text>
        </TouchableOpacity>
      )}
      <TextInput style={s.input} placeholder="Address line 1" value={loc.line1} onChangeText={(t) => set('line1', t)} />
      <TextInput style={s.input} placeholder="Address line 2 (area, landmark)" value={loc.line2} onChangeText={(t) => set('line2', t)} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TextInput style={[s.input, { flex: 1 }]} placeholder="City" value={loc.city} onChangeText={(t) => set('city', t)} />
        <TextInput style={[s.input, { flex: 1 }]} placeholder="State" value={loc.state} onChangeText={(t) => set('state', t)} />
      </View>
      <TextInput style={s.input} placeholder="Pincode" keyboardType="number-pad" value={loc.pincode} onChangeText={(t) => set('pincode', t.replace(/\D/g, '').slice(0, 6))} />
      <TouchableOpacity style={s.save} disabled={busy} onPress={save}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={s.saveTxt}>{saved ? 'Saved ✓' : 'Save location'}</Text>}</TouchableOpacity>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  locate: { backgroundColor: theme.ember, borderRadius: 12, padding: 15, alignItems: 'center' }, locateTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  muted: { color: theme.muted, fontSize: 12.5, marginTop: 8 },
  maplink: { color: theme.ember, fontWeight: '600', marginTop: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.line, borderRadius: 11, padding: 13, marginTop: 10 },
  save: { backgroundColor: theme.ink, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 16 }, saveTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
