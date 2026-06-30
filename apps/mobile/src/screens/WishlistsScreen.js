import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { api } from '../api';
import { theme, rupee } from '../theme';
import { useCart } from '../state/cart';

export default function WishlistsScreen({ navigation }) {
  const [lists, setLists] = useState(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const cart = useCart();

  const load = useCallback(() => { api.account.wishlists().then((r) => setLists(r.wishlists)).catch(() => setLists([])); }, []);
  useEffect(() => { const unsub = navigation.addListener('focus', load); load(); return unsub; }, [navigation, load]);

  const create = async () => { if (!name.trim()) return; setBusy(true); try { const r = await api.account.createWishlist(name.trim()); setLists(r.wishlists); setName(''); } finally { setBusy(false); } };
  const remove = async (index, productId) => { const r = await api.account.toggleWishlistItem(index, productId); setLists(r.wishlists); };

  if (!lists) return <View style={s.center}><ActivityIndicator color={theme.ember} /></View>;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={{ padding: 16 }}>
      <View style={s.create}>
        <TextInput style={s.input} placeholder="New list (Diwali, Wedding…)" value={name} onChangeText={setName} />
        <TouchableOpacity style={s.add} disabled={busy} onPress={create}><Text style={s.addTxt}>Create</Text></TouchableOpacity>
      </View>
      {lists.length === 0 && <Text style={[s.muted, { textAlign: 'center', marginTop: 30 }]}>No lists yet. Create one, then tap the heart on a product.</Text>}
      {lists.map((w) => (
        <View style={s.block} key={w.index}>
          <Text style={s.blockTitle}>❤  {w.name} <Text style={s.muted}>({w.products.length})</Text></Text>
          {w.products.length === 0 ? <Text style={s.muted}>Empty.</Text> : w.products.map((p) => {
            const sell = p.sellingPrice ?? p.mrp;
            return (
              <View style={s.item} key={p._id || p.id}>
                <View style={{ flex: 1 }}><Text style={s.b}>{p.name}</Text><Text style={s.mono}>{rupee(sell)}</Text></View>
                <TouchableOpacity onPress={() => cart.add({ id: String(p._id || p.id), name: p.name, sellingPrice: sell, display: { sellingPrice: sell, mrp: p.mrp } })}><Text style={s.act}>＋ Cart</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => remove(w.index, String(p._id || p.id))}><Text style={[s.act, { color: theme.ember }]}>Remove</Text></TouchableOpacity>
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.paper },
  create: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.line, borderRadius: 11, padding: 12 },
  add: { backgroundColor: theme.ember, borderRadius: 11, paddingHorizontal: 18, justifyContent: 'center' }, addTxt: { color: '#fff', fontWeight: '700' },
  block: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: theme.line, padding: 14, marginBottom: 12 },
  blockTitle: { fontWeight: '700', color: theme.ink, marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.paper, borderRadius: 10, padding: 10, marginTop: 8 },
  b: { fontWeight: '700', color: theme.ink }, mono: { color: theme.ink }, muted: { color: theme.muted, fontSize: 12.5 }, act: { fontWeight: '700', color: theme.ink, fontSize: 12.5 },
});
