import { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { supabase } from '../lib/supabase';

// ─── Renderer: كل type يرسم component مختلف ──────────────
function RenderComponent({ item }) {
  switch (item.type) {

    case 'banner':
      return (
        <View style={[s.banner, { backgroundColor: item.color || '#7c3aed' }]}>
          <Text style={s.bannerTitle}>{item.title}</Text>
          {item.subtitle && <Text style={s.bannerSub}>{item.subtitle}</Text>}
        </View>
      );

    case 'card':
      return (
        <View style={s.card}>
          {item.image_url && (
            <Image source={{ uri: item.image_url }} style={s.cardImage} resizeMode="cover" />
          )}
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>{item.title}</Text>
            {item.body && <Text style={s.cardText}>{item.body}</Text>}
          </View>
        </View>
      );

    case 'button':
      return (
        <TouchableOpacity
          style={[s.btn, { backgroundColor: item.color || '#7c3aed' }]}
          onPress={() => Alert.alert(item.label)}
          activeOpacity={0.8}
        >
          <Text style={s.btnText}>{item.label}</Text>
        </TouchableOpacity>
      );

    case 'text':
      return <Text style={s.plainText}>{item.content}</Text>;

    case 'divider':
      return <View style={s.divider} />;

    default:
      return null;
  }
}

// ─── الشاشة الرئيسية ──────────────────────────────────────
export default function HomeScreen() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    // 1. جلب الـ UI من Supabase
    supabase
      .from('ui_screens')
      .select('components')
      .eq('screen', 'home')
      .single()
      .then(({ data }) => {
        if (data) setComponents(data.components);
        setLoading(false);
      });

    // 2. Realtime: لما تعدل في Supabase يتغير التطبيق فوراً
    const channel = supabase
      .channel('sdui-home')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ui_screens', filter: 'screen=eq.home' },
        (payload) => {
          setComponents(payload.new.components);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={s.loadingText}>جاري تحميل الـ UI...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ gap: 14, paddingBottom: 32 }}>
      {components.map((item, index) => (
        <RenderComponent key={index} item={item} />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#111', padding: 16 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
  loadingText: { color: '#555', marginTop: 12 },

  // Banner
  banner:      { borderRadius: 16, padding: 24 },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  bannerSub:   { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6 },

  // Card
  card:        { backgroundColor: '#1e1e1e', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a2a' },
  cardImage:   { width: '100%', height: 160 },
  cardBody:    { padding: 16 },
  cardTitle:   { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  cardText:    { fontSize: 13, color: '#888', lineHeight: 20 },

  // Button
  btn:         { borderRadius: 14, padding: 16, alignItems: 'center' },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 16 },

  // Text
  plainText:   { fontSize: 14, color: '#aaa', lineHeight: 22 },

  // Divider
  divider:     { height: 1, backgroundColor: '#2a2a2a' },
});
