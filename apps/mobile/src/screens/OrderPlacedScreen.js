import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme, rupee } from '../theme';

export default function OrderPlacedScreen({ route, navigation }) {
  const order = route.params?.order || {};
  return (
    <View style={s.wrap}>
      <Text style={s.emoji}>🎉</Text>
      <Text style={s.h}>Order placed!</Text>
      <Text style={s.no}>Order {order.orderNumber}</Text>
      <View style={s.banner}>
        <Text style={s.bTitle}>We're verifying your payment</Text>
        <Text style={s.bSub}>You'll get a WhatsApp once it's approved — usually within a few hours.</Text>
      </View>
      <Text style={s.total}>Total {rupee(order.total)}</Text>
      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Shop')}><Text style={s.btnTxt}>Continue shopping</Text></TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.paper, padding: 24, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 56 }, h: { fontSize: 24, fontWeight: '800', color: theme.ink, marginTop: 8 },
  no: { color: theme.muted, marginTop: 4, marginBottom: 20 },
  banner: { backgroundColor: theme.emberSoft, borderRadius: 14, padding: 16, marginBottom: 20 },
  bTitle: { fontWeight: '700', color: theme.ember }, bSub: { color: theme.ink, marginTop: 4, textAlign: 'center' },
  total: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  btn: { backgroundColor: theme.ember, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28 }, btnTxt: { color: '#fff', fontWeight: '700' },
});
