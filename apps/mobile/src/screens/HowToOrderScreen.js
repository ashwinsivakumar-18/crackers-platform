import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../theme';

const STEPS = [
  { title: 'Add to cart', text: 'Browse crackers and add what you like. Minimum order is ₹3,500.' },
  { title: 'Add your location', text: 'Sign in and save your delivery address (up to 5).' },
  { title: 'Place the order', text: 'Confirm your location and review your order summary.' },
  { title: 'Pay & upload', text: 'Pay the exact amount by UPI, then upload the payment screenshot.' },
  { title: 'We verify', text: 'Our team checks your payment by hand and confirms the order.' },
  { title: 'Track it', text: 'Follow your order to your nearby Delivery Hub — delivered all over India.' },
];

export default function HowToOrderScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.sub}>Ordering is simple — here's the whole flow.</Text>
      {STEPS.map((st, i) => (
        <View style={s.step} key={st.title}>
          <View style={s.num}><Text style={s.numTxt}>{i + 1}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{st.title}</Text>
            <Text style={s.text}>{st.text}</Text>
          </View>
        </View>
      ))}
      <Text style={s.note}>Payments are manual (UPI / bank transfer) and verified by our team — no online payment gateway, so your money always goes straight to us.</Text>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  sub: { color: theme.muted, marginBottom: 16 },
  step: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
  num: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.ember, alignItems: 'center', justifyContent: 'center' }, numTxt: { color: '#fff', fontWeight: '800' },
  title: { fontWeight: '700', color: theme.ink, marginBottom: 2 }, text: { color: theme.muted, fontSize: 13, lineHeight: 19 },
  note: { color: theme.muted, fontSize: 12.5, marginTop: 14, lineHeight: 18 },
});
