import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { api } from '../api';
import { theme, rupee } from '../theme';

const LABEL = {
  PENDING_PAYMENT: 'Awaiting payment', PAYMENT_UPLOADED: 'Verifying payment', PAYMENT_APPROVED: 'Approved',
  PROCESSING: 'Preparing', PACKED: 'Packed', SHIPPED: 'On the way', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    api.orders.myOrders({ limit: 50 }).then((r) => setOrders(r.items)).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);
  useEffect(() => { const unsub = navigation.addListener('focus', load); load(); return unsub; }, [navigation, load]);

  if (loading) return <View style={s.center}><ActivityIndicator color={theme.ember} /></View>;
  if (orders.length === 0) return <View style={s.center}><Text style={{ color: theme.muted }}>No orders yet.</Text></View>;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.paper }}
      contentContainerStyle={{ padding: 16 }}
      data={orders}
      keyExtractor={(o) => o.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      renderItem={({ item }) => (
        <TouchableOpacity style={s.row} onPress={() => navigation.navigate('OrderDetail', { id: item.id })}>
          <View style={{ flex: 1 }}>
            <Text style={s.no}>{item.orderNumber}</Text>
            <Text style={s.sub}>{new Date(item.placedAt || item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {item.items.length} item(s)</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.total}>{rupee(item.total)}</Text>
            <Text style={s.status}>{LABEL[item.status] || item.status}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.paper },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: theme.line },
  no: { fontWeight: '700', color: theme.ink, fontVariant: ['tabular-nums'] }, sub: { color: theme.muted, fontSize: 12, marginTop: 3 },
  total: { fontWeight: '800', color: theme.ink }, status: { color: theme.ember, fontSize: 11.5, fontWeight: '700', marginTop: 3 },
});
