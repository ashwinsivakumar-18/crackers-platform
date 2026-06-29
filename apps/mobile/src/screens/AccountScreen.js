import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../state/auth';

export default function AccountScreen() {
  const auth = useAuth();
  return (
    <View style={s.wrap}>
      <Text style={s.h}>Account</Text>
      <Text style={s.sub}>{auth.authed ? (auth.user?.name || auth.user?.mobile || 'Signed in') : 'Not signed in'}</Text>
      {auth.authed && <TouchableOpacity style={s.btn} onPress={auth.logout}><Text style={s.btnTxt}>Sign out</Text></TouchableOpacity>}
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.paper, padding: 24 },
  h: { fontSize: 24, fontWeight: '800', color: theme.ink, marginTop: 20 }, sub: { color: theme.muted, marginTop: 8 },
  btn: { backgroundColor: theme.ember, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 24 }, btnTxt: { color: '#fff', fontWeight: '700' },
});
