import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { api } from '../api';
import { theme, rupee } from '../theme';

const STORE = 'Sri Lakshmi Crackers';
const FLOW = ['PAYMENT_APPROVED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'];
const FLOW_LABEL = { PAYMENT_APPROVED: 'Confirmed', PROCESSING: 'Preparing', PACKED: 'Packed', SHIPPED: 'On the way', DELIVERED: 'Delivered' };

export default function OrderDetailScreen({ route }) {
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  const [tab, setTab] = useState('invoice');
  useEffect(() => { api.orders.detail(id).then((r) => setOrder(r.order)).catch(() => {}); }, [id]);
  if (!order) return <View style={s.center}><ActivityIndicator color={theme.ember} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={{ padding: 16 }}>
      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, tab === 'invoice' && s.tabOn]} onPress={() => setTab('invoice')}><Text style={[s.tabTxt, tab === 'invoice' && s.tabTxtOn]}>Invoice</Text></TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === 'tracking' && s.tabOn]} onPress={() => setTab('tracking')}><Text style={[s.tabTxt, tab === 'tracking' && s.tabTxtOn]}>Tracking</Text></TouchableOpacity>
      </View>
      {tab === 'invoice' ? <Invoice order={order} /> : <Tracking order={order} />}
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
      <Text style={[s.muted, { marginBottom: 10 }]}>Demo bill for your records.</Text>
      {order.items.map((it, i) => (
        <View style={s.invRow} key={i}>
          <Text style={{ flex: 1, color: theme.ink }}>{it.productName} ×{it.quantity}</Text>
          <Text style={s.mono}>{rupee(it.lineTotal)}</Text>
        </View>
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

// Truck crossing the points the admin adds.
function Tracking({ order }) {
  const reached = FLOW.indexOf(order.status);
  const steps = order.trackingSteps || [];
  return (
    <View style={s.inv}>
      <View style={s.flow}>
        {FLOW.map((st, i) => {
          const done = reached >= i && reached >= 0; const current = reached === i;
          return (
            <View style={s.flowStep} key={st}>
              <View style={[s.dot, done && s.dotDone, current && s.dotCurrent]}><Text style={[s.dotTxt, (done || current) && { color: '#fff' }]}>{current ? '🚚' : done ? '✓' : i + 1}</Text></View>
              <Text style={s.flowLabel}>{FLOW_LABEL[st]}</Text>
            </View>
          );
        })}
      </View>
      <View style={s.hr} />
      <Text style={[s.b, { marginBottom: 10 }]}>Journey</Text>
      {steps.length === 0 ? <Text style={s.muted}>We'll post updates here as your order moves. 🚚</Text> : steps.map((t, i) => (
        <View style={s.tp} key={i}>
          <Text style={{ fontSize: 16 }}>📍</Text>
          <View style={{ flex: 1 }}><Text style={s.b}>{t.label}{t.place ? <Text style={s.muted}> · {t.place}</Text> : null}</Text><Text style={s.muted}>{new Date(t.at).toLocaleString('en-IN')}</Text></View>
        </View>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.paper },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { flex: 1, padding: 11, borderRadius: 11, borderWidth: 1, borderColor: theme.line, backgroundColor: '#fff', alignItems: 'center' },
  tabOn: { backgroundColor: theme.ink, borderColor: theme.ink }, tabTxt: { fontWeight: '700', color: theme.muted }, tabTxtOn: { color: '#fff' },
  inv: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: theme.line, padding: 18 },
  invTop: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderColor: theme.ink, paddingBottom: 12, marginBottom: 6 },
  store: { fontSize: 18, fontWeight: '800', color: theme.ink },
  invRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  b: { fontWeight: '700', color: theme.ink }, muted: { color: theme.muted, fontSize: 12 }, mono: { fontVariant: ['tabular-nums'], color: theme.ink },
  hr: { height: 1, backgroundColor: theme.line, marginVertical: 8 },
  grand: { borderTopWidth: 2, borderColor: theme.ink, marginTop: 6, paddingTop: 10 }, grandT: { fontWeight: '800', fontSize: 17, color: theme.ink },
  paid: { backgroundColor: '#E3F4EA', borderRadius: 10, padding: 10, marginTop: 14 }, paidTxt: { color: theme.green, fontWeight: '600', fontSize: 12.5, textAlign: 'center' },
  flow: { flexDirection: 'row', justifyContent: 'space-between' },
  flowStep: { flex: 1, alignItems: 'center' },
  dot: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#EFEAE1', alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: theme.green }, dotCurrent: { backgroundColor: theme.ember }, dotTxt: { fontWeight: '700', color: theme.muted, fontSize: 12 },
  flowLabel: { fontSize: 10, marginTop: 6, color: theme.ink, fontWeight: '600', textAlign: 'center' },
  tp: { flexDirection: 'row', gap: 10, paddingVertical: 8, alignItems: 'flex-start' },
});
