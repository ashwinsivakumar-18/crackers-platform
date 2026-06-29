import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { theme, rupee } from '../theme';
import { useCart } from '../state/cart';

export default function CartScreen({ navigation }) {
  const cart = useCart();
  if (cart.count === 0) return <View style={s.center}><Text style={{ color: theme.muted }}>Your cart is empty.</Text></View>;
  return (
    <View style={{ flex: 1, backgroundColor: theme.paper }}>
      <FlatList
        data={cart.lines}
        keyExtractor={(l) => l.product.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const p = item.product; const sell = p.display ? p.display.sellingPrice : p.sellingPrice;
          return (
            <View style={s.row}>
              <Text style={s.name}>{p.name}</Text>
              <View style={s.stepper}>
                <TouchableOpacity onPress={() => cart.remove(p)}><Text style={s.step}>–</Text></TouchableOpacity>
                <Text style={s.qty}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => cart.add(p)}><Text style={s.step}>+</Text></TouchableOpacity>
              </View>
              <Text style={s.line}>{rupee(sell * item.quantity)}</Text>
            </View>
          );
        }}
      />
      <View style={s.footer}>
        <Text style={s.total}>Total {rupee(cart.subtotal)}</Text>
        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Checkout')}><Text style={s.btnTxt}>Checkout</Text></TouchableOpacity>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.paper },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.line },
  name: { flex: 1, fontWeight: '600', color: theme.ink },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 10 },
  step: { fontSize: 18, color: theme.ember, fontWeight: '700', paddingHorizontal: 6 }, qty: { fontWeight: '700' },
  line: { fontWeight: '700', width: 70, textAlign: 'right' },
  footer: { padding: 16, borderTopWidth: 1, borderColor: theme.line, backgroundColor: '#fff' },
  total: { fontSize: 18, fontWeight: '800', marginBottom: 10, color: theme.ink },
  btn: { backgroundColor: theme.ember, borderRadius: 12, padding: 16, alignItems: 'center' }, btnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
