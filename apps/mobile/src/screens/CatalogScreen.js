import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { api } from '../api';
import { theme, rupee } from '../theme';
import { useCart } from '../state/cart';
import ProductCard from '../components/ProductCard';

export default function CatalogScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cart = useCart();

  useEffect(() => {
    api.products.list({ limit: 50 })
      .then((r) => setProducts(r.items))
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={s.center}><ActivityIndicator color={theme.ember} /></View>;
  if (error) return <View style={s.center}><Text style={{ color: theme.ember }}>{error}</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: theme.paper }}>
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={2}
        contentContainerStyle={{ padding: 6, paddingBottom: 90 }}
        ListHeaderComponent={<Text style={s.h1}>Light up Diwali 🪔</Text>}
        renderItem={({ item }) => <ProductCard product={item} />}
      />
      {cart.count > 0 && (
        <TouchableOpacity style={s.bar} onPress={() => navigation.navigate('Cart')}>
          <Text style={s.barTxt}>Checkout {cart.count} item{cart.count !== 1 ? 's' : ''} · {rupee(cart.subtotal)}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.paper },
  h1: { fontSize: 22, fontWeight: '800', color: theme.ink, padding: 10 },
  bar: { position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: theme.ember, borderRadius: 14, padding: 16, alignItems: 'center' },
  barTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
