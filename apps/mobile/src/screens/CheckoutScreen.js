import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api, tokenStore } from '../api';
import { theme, rupee } from '../theme';
import { useCart } from '../state/cart';
import LoginScreen from './LoginScreen';

const STORE_UPI = 'srilakshmicrackers@okhdfc';

export default function CheckoutScreen({ navigation }) {
  const cart = useCart();
  const [authed, setAuthed] = useState(!!tokenStore.getAccess());
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const deliveryFee = cart.subtotal > 3000 ? 0 : 80;
  const total = cart.subtotal + deliveryFee;

  if (!authed) return <LoginScreen onDone={() => setAuthed(true)} />;

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) setImage(res.assets[0]);
  };
  const placeOrder = async () => {
    if (!image) return setError('Upload your payment screenshot');
    setBusy(true); setError(null);
    try {
      const { order } = await api.orders.place({
        items: cart.lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        deliveryType: 'DELIVERY', address, pincode,
      });
      const file = { uri: image.uri, name: 'payment.jpg', type: 'image/jpeg' };
      const { url } = await api.uploads.image(file);
      await api.orders.uploadPayment(order.id, { method: 'UPI', amount: total, screenshotUrl: url });
      cart.clear();
      navigation.replace('OrderPlaced', { order });
    } catch (e) { setError(e.message || 'Could not place order'); } finally { setBusy(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.h}>Delivery details</Text>
      <TextInput style={s.input} placeholder="Full name" value={name} onChangeText={setName} />
      <TextInput style={s.input} placeholder="Mobile" keyboardType="number-pad" value={mobile} onChangeText={setMobile} />
      <TextInput style={s.input} placeholder="Address" value={address} onChangeText={setAddress} />
      <TextInput style={s.input} placeholder="Pincode" keyboardType="number-pad" value={pincode} onChangeText={setPincode} />

      <Text style={s.h}>Pay {rupee(total)} by UPI</Text>
      <Text style={s.upi}>{STORE_UPI}</Text>
      <Text style={s.note}>Pay the exact amount, screenshot the success page, and upload it below. We verify by hand and confirm.</Text>

      <TouchableOpacity style={s.upload} onPress={pick}>
        {image ? <Image source={{ uri: image.uri }} style={s.preview} /> : <Text style={{ color: theme.muted }}>＋ Upload payment screenshot</Text>}
      </TouchableOpacity>

      {error && <Text style={s.err}>{error}</Text>}
      <TouchableOpacity style={s.btn} disabled={busy} onPress={placeOrder}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Place order · {rupee(total)}</Text>}
      </TouchableOpacity>
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
});
