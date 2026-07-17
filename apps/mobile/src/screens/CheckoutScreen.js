import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { api, tokenStore } from '../api';
import { theme, rupee } from '../theme';
import { useCart } from '../state/cart';
import LoginScreen from './LoginScreen';

const STORE_UPI = 'sivakumarcrackers@okhdfc';
const EMPTY = { label: '', line1: '', line2: '', line3: '', city: '', state: '', pincode: '', lat: null, lng: null };

export default function CheckoutScreen({ navigation }) {
  const cart = useCart();
  const [authed, setAuthed] = useState(!!tokenStore.getAccess());
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [cfg, setCfg] = useState({ minOrderAmount: 3500, packTransportPct: 5, storeUpiId: STORE_UPI });

  // locations
  const [locations, setLocations] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [nl, setNl] = useState(EMPTY);
  const [locStatus, setLocStatus] = useState('');
  const [savingLoc, setSavingLoc] = useState(false);

  useEffect(() => { api.settings.getPublic().then((r) => setCfg((c) => ({ ...c, ...r }))).catch(() => {}); }, []);
  useEffect(() => { if (authed) loadLocations(); }, [authed]);
  const loadLocations = () => api.account.locations().then((r) => {
    setLocations(r.locations);
    const def = r.locations.find((x) => x.isDefault) || r.locations[0];
    setSelectedId(def ? def.id : null);
    setAdding(r.locations.length === 0);
  }).catch(() => setLocations([]));

  const pct = cfg.packTransportPct;
  const packTransport = Math.round((cart.subtotal * pct) / 100);
  const total = cart.subtotal + packTransport;
  const belowMin = cart.subtotal < cfg.minOrderAmount;
  const shortBy = cfg.minOrderAmount - cart.subtotal;
  const selected = locations && locations.find((l) => l.id === selectedId);
  const composedAddress = selected ? [selected.line1, selected.line2, selected.line3, selected.city, selected.state].filter(Boolean).join(', ') : '';

  if (!authed) return <LoginScreen onDone={() => setAuthed(true)} />;

  const setL = (k, v) => setNl((l) => ({ ...l, [k]: v }));
  const useCurrent = async () => {
    setLocStatus('Getting your location…');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocStatus('Permission denied — enter the address manually.'); return; }
      const pos = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lng } = pos.coords;
      let g = {};
      try { g = (await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng }))[0] || {}; } catch { g = {}; }
      setNl((l) => ({
        ...l, lat, lng,
        line1: [g.name, g.street].filter(Boolean).join(' ') || l.line1,
        line2: [g.district, g.subregion].filter(Boolean).join(', ') || l.line2,
        city: g.city || g.subregion || l.city,
        state: g.region || l.state,
        pincode: g.postalCode || l.pincode,
      }));
      setLocStatus('Location captured ✓ — check the address and save.');
    } catch { setLocStatus('Could not get location — enter the address manually.'); }
  };
  const saveLoc = async () => {
    if (!nl.line1.trim() || !nl.city.trim() || !/^\d{6}$/.test(nl.pincode)) { setError('Add address line 1, city and a 6-digit pincode'); return; }
    setSavingLoc(true); setError(null);
    try {
      const r = await api.account.addLocation({ ...nl, lat: nl.lat ?? undefined, lng: nl.lng ?? undefined });
      setLocations(r.locations); const latest = r.locations[r.locations.length - 1]; if (latest) setSelectedId(latest.id);
      setAdding(false); setNl(EMPTY); setLocStatus('');
    } catch (e) { setError(e.message || 'Could not save location'); } finally { setSavingLoc(false); }
  };
  const removeLoc = async (id) => { const r = await api.account.removeLocation(id); setLocations(r.locations); if (selectedId === id) { const d = r.locations.find((x) => x.isDefault) || r.locations[0]; setSelectedId(d ? d.id : null); } if (r.locations.length === 0) setAdding(true); };

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) setImage(res.assets[0]);
  };
  const placeOrder = async () => {
    if (!selected) return setError('Select or add a delivery location');
    if (belowMin) return setError(`Minimum order is ₹${cfg.minOrderAmount}. Add ₹${shortBy} more.`);
    if (!image) return setError('Upload your payment screenshot');
    setBusy(true); setError(null);
    try {
      const { order } = await api.orders.place({
        items: cart.lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        deliveryType: 'DELIVERY', address: composedAddress, pincode: selected.pincode,
      });
      const file = { uri: image.uri, name: 'payment.jpg', type: 'image/jpeg' };
      const { url } = await api.uploads.image(file);
      await api.orders.uploadPayment(order.id, { method: 'UPI', amount: total, screenshotUrl: url });
      cart.clear();
      navigation.replace('OrderPlaced', { order });
    } catch (e) { setError(e.message || 'Could not place order'); } finally { setBusy(false); }
  };

  const canPlace = !!selected && !belowMin && !!image;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.h}>Where should we send it?</Text>
      <View style={s.hubNote}><Text style={s.hubTxt}>🇮🇳 We deliver all over India — your order reaches your nearby Delivery Hub.</Text></View>

      {locations === null ? <ActivityIndicator color={theme.ember} style={{ marginVertical: 16 }} /> : (
        <>
          {locations.map((l) => (
            <TouchableOpacity key={l.id} style={[s.locCard, selectedId === l.id && s.locOn]} onPress={() => setSelectedId(l.id)}>
              <View style={[s.radio, selectedId === l.id && s.radioOn]} />
              <View style={{ flex: 1 }}>
                <Text style={s.locLabel}>{l.label || 'Address'}{l.isDefault ? '  · Default' : ''}</Text>
                <Text style={s.muted}>{[l.line1, l.line2, l.line3].filter(Boolean).join(', ')}</Text>
                <Text style={s.muted}>{[l.city, l.state, l.pincode].filter(Boolean).join(', ')}</Text>
              </View>
              <TouchableOpacity onPress={() => removeLoc(l.id)}><Text style={{ color: theme.muted, fontSize: 18 }}>🗑</Text></TouchableOpacity>
            </TouchableOpacity>
          ))}

          {!adding && locations.length > 0 && <TouchableOpacity style={s.addBtn} onPress={() => setAdding(true)}><Text style={s.addTxt}>＋ Add another location</Text></TouchableOpacity>}

          {adding && (
            <View style={s.form}>
              <TouchableOpacity style={s.locBtn} onPress={useCurrent}><Text style={s.locBtnTxt}>📍 Use my current location</Text></TouchableOpacity>
              {locStatus ? <Text style={s.muted}>{locStatus}</Text> : null}
              <TextInput style={s.input} placeholder="Address line 1 (house no, street)" value={nl.line1} onChangeText={(t) => setL('line1', t)} />
              <TextInput style={s.input} placeholder="Address line 2 (area, landmark)" value={nl.line2} onChangeText={(t) => setL('line2', t)} />
              <TextInput style={s.input} placeholder="Address line 3 (optional)" value={nl.line3} onChangeText={(t) => setL('line3', t)} />
              <TextInput style={s.input} placeholder="City" value={nl.city} onChangeText={(t) => setL('city', t)} />
              <TextInput style={s.input} placeholder="State" value={nl.state} onChangeText={(t) => setL('state', t)} />
              <TextInput style={s.input} placeholder="Pincode" keyboardType="number-pad" value={nl.pincode} onChangeText={(t) => setL('pincode', t.replace(/\D/g, '').slice(0, 6))} />
              <TextInput style={s.input} placeholder="Label (Home, Shop…)" value={nl.label} onChangeText={(t) => setL('label', t)} />
              <TouchableOpacity style={s.saveBtn} disabled={savingLoc} onPress={saveLoc}>{savingLoc ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Save location</Text>}</TouchableOpacity>
              {locations.length > 0 && <TouchableOpacity onPress={() => { setAdding(false); setNl(EMPTY); }}><Text style={[s.muted, { textAlign: 'center', marginTop: 8 }]}>Cancel</Text></TouchableOpacity>}
            </View>
          )}
        </>
      )}

      {belowMin ? <View style={s.minNote}><Text style={s.minTxt}>Minimum order ₹{cfg.minOrderAmount}. Add ₹{shortBy} more.</Text></View> : null}
      <View style={s.sumRow}><Text style={s.muted}>Subtotal</Text><Text style={s.mono}>{rupee(cart.subtotal)}</Text></View>
      <View style={s.sumRow}><Text style={s.muted}>Packaging & transportation ({pct}%)</Text><Text style={s.mono}>{rupee(packTransport)}</Text></View>

      <Text style={s.h}>Pay {rupee(total)} by UPI</Text>
      <Text style={s.upi}>{cfg.storeUpiId}</Text>
      <Text style={s.note}>Pay the exact amount, screenshot the success page, and upload it below. We verify by hand and confirm.</Text>

      <TouchableOpacity style={s.upload} onPress={pick}>
        {image ? <Image source={{ uri: image.uri }} style={s.preview} /> : <Text style={{ color: theme.muted }}>＋ Upload payment screenshot</Text>}
      </TouchableOpacity>

      {error && <Text style={s.err}>{error}</Text>}
      <TouchableOpacity style={[s.btn, !canPlace && { opacity: 0.5 }]} disabled={busy || !canPlace} onPress={placeOrder}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Place order · {rupee(total)}</Text>}
      </TouchableOpacity>
      {!selected && locations && locations.length > 0 ? <Text style={[s.muted, { textAlign: 'center', marginTop: 8 }]}>Select a delivery location above.</Text> : null}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 17, fontWeight: '700', color: theme.ink, marginTop: 14, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.line, borderRadius: 12, padding: 13, marginBottom: 10 },
  upi: { fontSize: 18, fontWeight: '800', color: theme.ember }, note: { color: theme.muted, marginTop: 6, marginBottom: 10 },
  upload: { borderWidth: 1.5, borderColor: theme.line, borderStyle: 'dashed', borderRadius: 12, padding: 20, alignItems: 'center', backgroundColor: '#fff' },
  preview: { width: 160, height: 200, borderRadius: 10, resizeMode: 'cover' },
  btn: { backgroundColor: theme.ember, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 }, btnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  err: { color: theme.ember, marginTop: 12 },
  hubNote: { backgroundColor: '#FFF6EE', borderRadius: 10, padding: 11, marginBottom: 10 }, hubTxt: { color: theme.ink, fontWeight: '600', fontSize: 12.5 },
  minNote: { backgroundColor: '#FDECEA', borderRadius: 10, padding: 11, marginTop: 10 }, minTxt: { color: theme.ember, fontWeight: '700' },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }, mono: { color: theme.ink }, muted: { color: theme.muted, fontSize: 13 },
  locCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#fff', borderWidth: 1.5, borderColor: theme.line, borderRadius: 12, padding: 13, marginBottom: 10 },
  locOn: { borderColor: theme.ember, backgroundColor: '#FBE6DD' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: theme.line, marginTop: 2 }, radioOn: { borderColor: theme.ember, backgroundColor: theme.ember },
  locLabel: { fontWeight: '700', color: theme.ink, marginBottom: 2 },
  addBtn: { borderWidth: 1.5, borderColor: theme.line, borderStyle: 'dashed', borderRadius: 12, padding: 13, alignItems: 'center', marginBottom: 10 }, addTxt: { color: theme.ember, fontWeight: '700' },
  form: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.line, borderRadius: 12, padding: 14, marginBottom: 10 },
  locBtn: { backgroundColor: theme.ember, borderRadius: 11, padding: 13, alignItems: 'center', marginBottom: 10 }, locBtnTxt: { color: '#fff', fontWeight: '700' },
  saveBtn: { backgroundColor: theme.ink, borderRadius: 11, padding: 14, alignItems: 'center', marginTop: 4 },
});
