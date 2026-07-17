import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function AboutScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.paper }} contentContainerStyle={{ padding: 20 }}>
      <Text style={s.title}>Sivakumar Crackers</Text>
      <Text style={s.tag}>Bringing safe, joyful celebrations to every home this festive season.</Text>
      <Text style={s.p}>We're a family-run crackers business bringing you quality sparklers, flower pots, gift boxes and festival combos at honest prices, straight from the manufacturers.</Text>
      <Text style={s.p}>🇮🇳 We deliver all over India — your order reaches your nearby Delivery Hub. Every order is verified by hand by real people.</Text>
      <Text style={s.note}>Please celebrate responsibly. Follow local safety guidelines and keep children supervised around fireworks.</Text>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: theme.ink }, tag: { color: theme.muted, marginTop: 4, marginBottom: 14 },
  p: { color: theme.ink, lineHeight: 23, marginBottom: 12 }, h: { fontSize: 17, fontWeight: '700', color: theme.ink, marginTop: 6, marginBottom: 6 },
  note: { color: theme.muted, fontSize: 12.5, marginTop: 18 },
});
