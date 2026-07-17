import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { api } from '../api';
import { theme, rupee } from '../theme';

const STORE = 'Sivakumar Crackers';

export default function OrderDetailScreen({ route }) {
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  useEffect(() => { api.orders.detail(id).then((r) => setOrder(r.order)).catch(() => {}); }, [id]);
  if (!order) return <View style={s.center}><ActivityIndicator color={theme.ember} /></View>;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={{ padding: 16 }}>
      <Invoice order={order} />
    </ScrollView>
  );
}

// View-only bill — no download, no PDF, no GST.
function Invoice({ order }) {
  const extras = order.extraCharges || [];
  return (
    <View style={s.inv}>
      <View style={s.invTop}>
        <Text style={s.store}>{STORE}</Text>
        <View style={{ alignItems: 'flex-end' }}><Text style={s.b}>{order.orderNumber}</Text><Text style={s.muted}>{new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text></View>
      </View>
      <Text style={[s.muted, { marginBottom: 8 }]}>Demo bill for your records.</Text>
      <View style={s.billto}>
        <Text style={s.muted}>Bill to</Text>
        <Text style={s.b}>{order.user?.name || 'Customer'}</Text>
        {order.user?.mobile ? <Text style={s.mono}>{order.user.mobile}</Text> : null}
        {order.address ? <Text style={s.muted}>{order.address}{order.pincode ? ` - ${order.pincode}` : ''}</Text> : null}
      </View>
      {order.items.map((it, i) => (
        <View style={s.invRow} key={i}><Text style={{ flex: 1, color: theme.ink }}>{it.productName} ×{it.quantity}</Text><Text style={s.mono}>{rupee(it.lineTotal)}</Text></View>
      ))}
      <View style={s.hr} />
      <Line k="Subtotal" v={order.subtotal} />
      {order.deliveryFee > 0 && <Line k="Delivery" v={order.deliveryFee} />}
      {order.packingFee > 0 && <Line k="Packing" v={order.packingFee} />}
      {extras.map((c, i) => <Line key={i} k={c.label} v={c.amount} />)}
      <View style={[s.invRow, s.grand]}><Text style={s.grandT}>Total</Text><Text style={s.grandT}>{rupee(order.total)}</Text></View>
      <View style={s.paid}><Text style={s.paidTxt}>Paid via UPI / bank transfer · verified by our team</Text></View>
    </View>
  );
}
const Line = ({ k, v }) => <View style={s.invRow}><Text style={{ color: theme.muted }}>{k}</Text><Text style={s.mono}>{rupee(v)}</Text></View>;

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.paper },
  inv: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: theme.line, padding: 18 },
  invTop: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderColor: theme.ink, paddingBottom: 12, marginBottom: 6 },
  store: { fontSize: 18, fontWeight: '800', color: theme.ink },
  billto: { paddingVertical: 10, borderBottomWidth: 1, borderColor: theme.line, marginBottom: 6 },
  invRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  b: { fontWeight: '700', color: theme.ink }, muted: { color: theme.muted, fontSize: 12 }, mono: { color: theme.ink },
  hr: { height: 1, backgroundColor: theme.line, marginVertical: 8 },
  grand: { borderTopWidth: 2, borderColor: theme.ink, marginTop: 6, paddingTop: 10 }, grandT: { fontWeight: '800', fontSize: 17, color: theme.ink },
  paid: { backgroundColor: '#E3F4EA', borderRadius: 10, padding: 10, marginTop: 14 }, paidTxt: { color: theme.green, fontWeight: '600', fontSize: 12.5, textAlign: 'center' },
});
