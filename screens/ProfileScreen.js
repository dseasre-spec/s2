import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={s.container}>
      <Text style={s.emoji}>👤</Text>
      <Text style={s.title}>حسابي</Text>
      <Text style={s.sub}>هذه الشاشة جاءت من Supabase!</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  emoji:     { fontSize: 60, marginBottom: 16 },
  title:     { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8 },
  sub:       { fontSize: 14, color: '#555' },
});
