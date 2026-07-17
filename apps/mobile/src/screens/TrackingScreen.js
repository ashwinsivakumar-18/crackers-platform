import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { api } from '../api';
import { theme } from '../theme';

const FLOW = ['PAYMENT_APPROVED', 'PROCESSING', 'PACKED', 'SHIPPED', 'AT_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const FLOW_LABEL = { PAYMENT_APPROVED: 'Confirmed', PROCESSING: 'Preparing', PACKED: 'Packed', SHIPPED: 'On the way', AT_HUB: 'At Hub', OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered' };

export default function TrackingScreen({ route }) {
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  useEffect(() => { api.orders.detail(id).then((r) => setOrder(r.order)).catch(() => {}); }, [id]);
  if (!order) return <View style={s.center}><ActivityIndicator color={theme.ember} /></View>;
  const reached = FLOW.indexOf(order.status);
  const steps = order.trackingSteps || [];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={{ padding: 16 }}>
      <View style={s.card}>
        {order.trackingId ? <View style={s.tid}><Text style={s.muted}>Tracking ID</Text><Text style={s.b}>{order.trackingId}</Text></View> : null}
        <View style={s.flow}>
          {FLOW.map((st, i) => {
            const done = reached >= i && reached >= 0; const current = reached === i;
            return (
              <View style={s.step} key={st}>
                <View style={[s.dot, done && s.dotDone, current && s.dotCurrent]}><Text style={[s.dotTxt, (done || current) && { color: '#fff' }]}>{current ? '🚚' : done ? '✓' : i + 1}</Text></View>
                <Text style={s.label}>{FLOW_LABEL[st]}</Text>
              </View>
            );
          })}
        </View>
        <View style={s.hr} />
        <Text style={[s.b, { marginBottom: 10 }]}>Journey</Text>
        {steps.length === 0 ? <Text style={s.muted}>We'll post updates here as your order moves. 🚚</Text> : steps.map((t, i) => (
          <View style={s.tp} key={i}><Text style={{ fontSize: 16 }}>📍</Text><View style={{ flex: 1 }}><Text style={s.b}>{t.label}{t.place ? <Text style={s.muted}> · {t.place}</Text> : null}</Text><Text style={s.muted}>{new Date(t.at).toLocaleString('en-IN')}</Text></View></View>
        ))}
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.paper },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: theme.line, padding: 18 },
  tid: { backgroundColor: theme.paper, borderRadius: 10, padding: 10, marginBottom: 12 },
  flow: { flexDirection: 'row', justifyContent: 'space-between' }, step: { flex: 1, alignItems: 'center' },
  dot: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#EFEAE1', alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: theme.green }, dotCurrent: { backgroundColor: theme.ember }, dotTxt: { fontWeight: '700', color: theme.muted, fontSize: 12 },
  label: { fontSize: 10, marginTop: 6, color: theme.ink, fontWeight: '600', textAlign: 'center' },
  hr: { height: 1, backgroundColor: theme.line, marginVertical: 14 },
  tp: { flexDirection: 'row', gap: 10, paddingVertical: 8, alignItems: 'flex-start' },
  b: { fontWeight: '700', color: theme.ink }, muted: { color: theme.muted, fontSize: 12 },
});
