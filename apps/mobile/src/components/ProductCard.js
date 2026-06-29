import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme, rupee } from '../theme';
import { useCart } from '../state/cart';

export default function ProductCard({ product }) {
  const cart = useCart();
  const qty = cart.quantityOf(product.id);
  const sell = product.display ? product.display.sellingPrice : product.sellingPrice;
  const mrp = product.display ? product.display.mrp : product.mrp;
  const off = product.display ? product.display.savedPercent : 0;
  return (
    <View style={s.card}>
      <View style={s.thumb}>{off > 0 && <Text style={s.off}>{off}% off</Text>}</View>
      <Text style={s.name} numberOfLines={2}>{product.name}</Text>
      <View style={s.priceRow}>
        <Text style={s.now}>{rupee(sell)}</Text>
        {off > 0 && <Text style={s.was}>{rupee(mrp)}</Text>}
      </View>
      {qty > 0 ? (
        <View style={s.stepper}>
          <TouchableOpacity style={s.stepBtn} onPress={() => cart.remove(product)}><Text style={s.stepTxt}>–</Text></TouchableOpacity>
          <Text style={s.qty}>{qty}</Text>
          <TouchableOpacity style={s.stepBtn} onPress={() => cart.add(product)}><Text style={s.stepTxt}>+</Text></TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={s.add} onPress={() => cart.add(product)}><Text style={s.addTxt}>Add</Text></TouchableOpacity>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  card: { flex: 1, margin: 6, backgroundColor: theme.white, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: theme.line },
  thumb: { height: 90, borderRadius: 10, backgroundColor: '#F0C24B', marginBottom: 8, justifyContent: 'flex-start', alignItems: 'flex-end', padding: 6 },
  off: { backgroundColor: theme.ember, color: '#fff', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  name: { fontWeight: '600', fontSize: 13, color: theme.ink, minHeight: 34 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  now: { fontSize: 16, fontWeight: '800', color: theme.ink },
  was: { fontSize: 12, color: theme.muted, textDecorationLine: 'line-through' },
  add: { marginTop: 8, backgroundColor: theme.ember, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  addTxt: { color: '#fff', fontWeight: '700' },
  stepper: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: theme.line, borderRadius: 8 },
  stepBtn: { paddingHorizontal: 14, paddingVertical: 6 }, stepTxt: { fontSize: 18, color: theme.ember, fontWeight: '700' }, qty: { fontWeight: '700' },
});
