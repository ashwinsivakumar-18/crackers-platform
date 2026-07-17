import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { api } from '../api';
import { theme, rupee } from '../theme';

const LABEL = { PENDING_PAYMENT: 'Awaiting payment', PAYMENT_UPLOADED: 'Verifying', PAYMENT_APPROVED: 'Confirmed', PROCESSING: 'Preparing', PACKED: 'Packed', SHIPPED: 'On the way', AT_HUB: 'At your Delivery Hub', OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' };

export default function TrackOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState(null);
  const load = useCallback(() => { api.orders.myOrders({ limit: 50 }).then((r) => setOrders(r.items)).catch(() => setOrders([])); }, []);
  useEffect(() => { const unsub = navigation.addListener('focus', load); load(); return unsub; }, [navigation, load]);
  if (!orders) return <View style={s.center}><ActivityIndicator color={theme.ember} /></View>;
  if (orders.length === 0) return <View style={s.center}><Text style={{ color: theme.muted }}>No orders to track yet.</Text></View>;
  return (
    <FlatList style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={{ padding: 16 }} data={orders} keyExtractor={(o) => o.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={s.row} onPress={() => navigation.navigate('Tracking', { id: item.id })}>
          <View style={{ flex: 1 }}><Text style={s.no}>{item.orderNumber}</Text><Text style={s.sub}>{LABEL[item.status] || item.status}</Text></View>
          <Text style={s.total}>{rupee(item.total)}</Text>
        </TouchableOpacity>
      )} />
  );
}
const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.paper },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: theme.line },
  no: { fontWeight: '700', color: theme.ink }, sub: { color: theme.ember, fontSize: 12, marginTop: 3, fontWeight: '600' }, total: { fontWeight: '800', color: theme.ink },
});
