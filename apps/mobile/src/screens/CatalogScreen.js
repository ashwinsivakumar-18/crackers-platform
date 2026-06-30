import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, StyleSheet } from 'react-native';
import { api } from '../api';
import { theme, rupee } from '../theme';
import { useCart } from '../state/cart';
import { useAuth } from '../state/auth';
import ProductCard from '../components/ProductCard';

export default function CatalogScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wlProduct, setWlProduct] = useState(null);
  const [lists, setLists] = useState([]);
  const [newName, setNewName] = useState('');
  const cart = useCart();
  const auth = useAuth();

  useEffect(() => {
    api.products.list({ limit: 50 })
      .then((r) => setProducts(r.items))
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const onWishlist = async (product) => {
    if (!auth.authed) { Alert.alert('Sign in first', 'Open the Account tab to sign in, then save wishlists.'); return; }
    const r = await api.account.wishlists();
    setLists(r.wishlists); setWlProduct(product);
  };
  const toggle = async (index) => { const r = await api.account.toggleWishlistItem(index, wlProduct.id); setLists(r.wishlists); };
  const create = async () => { if (!newName.trim()) return; const r = await api.account.createWishlist(newName.trim()); setLists(r.wishlists); setNewName(''); };
  const inList = (w) => w.products.some((p) => String(p._id || p.id) === String(wlProduct?.id));

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
        renderItem={({ item }) => <ProductCard product={item} onWishlist={onWishlist} />}
      />
      {cart.count > 0 && (
        <TouchableOpacity style={s.bar} onPress={() => navigation.navigate('Cart')}>
          <Text style={s.barTxt}>Checkout {cart.count} item{cart.count !== 1 ? 's' : ''} · {rupee(cart.subtotal)}</Text>
        </TouchableOpacity>
      )}

      <Modal visible={!!wlProduct} transparent animationType="slide" onRequestClose={() => setWlProduct(null)}>
        <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setWlProduct(null)}>
          <TouchableOpacity activeOpacity={1} style={s.sheet}>
            <Text style={s.sheetTitle}>Save “{wlProduct?.name}” to…</Text>
            {lists.length === 0 && <Text style={{ color: theme.muted, marginBottom: 8 }}>No lists yet — create one below.</Text>}
            {lists.map((w) => (
              <TouchableOpacity key={w.index} style={[s.pick, inList(w) && s.pickOn]} onPress={() => toggle(w.index)}>
                <Text style={[s.pickTxt, inList(w) && { color: theme.ember }]}>{inList(w) ? '❤️' : '🤍'}  {w.name}</Text>
              </TouchableOpacity>
            ))}
            <View style={s.newRow}>
              <TextInput style={s.newInput} placeholder="New list" value={newName} onChangeText={setNewName} />
              <TouchableOpacity style={s.newBtn} onPress={create}><Text style={{ color: '#fff', fontWeight: '700' }}>Add</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={s.done} onPress={() => setWlProduct(null)}><Text style={s.doneTxt}>Done</Text></TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.paper },
  h1: { fontSize: 22, fontWeight: '800', color: theme.ink, padding: 10 },
  bar: { position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: theme.ember, borderRadius: 14, padding: 16, alignItems: 'center' },
  barTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  sheetTitle: { fontWeight: '800', fontSize: 16, color: theme.ink, marginBottom: 12 },
  pick: { backgroundColor: theme.paper, borderRadius: 10, padding: 13, marginBottom: 8 }, pickOn: { backgroundColor: theme.emberSoft },
  pickTxt: { fontWeight: '600', color: theme.ink },
  newRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  newInput: { flex: 1, backgroundColor: theme.paper, borderRadius: 10, padding: 12 },
  newBtn: { backgroundColor: theme.ink, borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  done: { marginTop: 14, alignItems: 'center', padding: 8 }, doneTxt: { color: theme.ember, fontWeight: '700' },
});
