import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../state/auth';
import LoginScreen from './LoginScreen';

export default function AccountScreen({ navigation }) {
  const auth = useAuth();
  if (!auth.authed) return <LoginScreen onDone={() => {}} />;

  const Item = ({ icon, label, to }) => (
    <TouchableOpacity style={s.item} onPress={() => navigation.navigate(to)}>
      <Text style={s.icon}>{icon}</Text><Text style={s.label}>{label}</Text><Text style={s.chev}>›</Text>
    </TouchableOpacity>
  );
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <View style={s.avatar}><Text style={s.avatarTxt}>{(auth.user?.name || auth.user?.mobile || 'U').charAt(0).toUpperCase()}</Text></View>
        <View><Text style={s.name}>{auth.user?.name || 'Welcome'}</Text>{auth.user?.mobile ? <Text style={s.sub}>{auth.user.mobile}</Text> : null}</View>
      </View>
      <View style={s.card}>
        <Item icon="📦" label="Orders" to="Orders" />
        <Item icon="📍" label="Details & location" to="Location" />
        <Item icon="❤️" label="Wishlists" to="Wishlists" />
      </View>
      <TouchableOpacity style={s.signout} onPress={auth.logout}><Text style={s.signoutTxt}>Sign out</Text></TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.paper, padding: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 18 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.ember, alignItems: 'center', justifyContent: 'center' }, avatarTxt: { color: '#fff', fontWeight: '800', fontSize: 22 },
  name: { fontWeight: '800', fontSize: 18, color: theme.ink }, sub: { color: theme.muted, marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: theme.line, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: theme.line },
  icon: { fontSize: 18, width: 30 }, label: { flex: 1, fontWeight: '600', color: theme.ink, fontSize: 15 }, chev: { color: theme.muted, fontSize: 22 },
  signout: { marginTop: 18, padding: 14, alignItems: 'center' }, signoutTxt: { color: theme.ember, fontWeight: '700' },
});
