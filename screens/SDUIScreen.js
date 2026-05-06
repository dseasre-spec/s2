// ─────────────────────────────────────────────────────────────
//  SDUIScreen — شاشة جاهزة تأخذ اسم الشاشة وترسمها من Supabase
//  الاستخدام: <SDUIScreen name="home" />
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { ScrollView, View, ActivityIndicator, Text, StyleSheet, RefreshControl } from 'react-native';
import { supabase } from '../lib/supabase';
import { RenderComponent } from '../lib/renderer';

export default function SDUIScreen({ name }) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('ui_screens')
      .select('components')
      .eq('screen', name)
      .single();
    if (data) setComponents(data.components);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();

    // Realtime — يتغير فوراً لما تعدل JSON في Supabase
    const channel = supabase
      .channel(`sdui-${name}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ui_screens', filter: `screen=eq.${name}` },
        (payload) => setComponents(payload.new.components)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [name]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#7c3aed" />
      }
    >
      {components.map((item, i) => (
        <RenderComponent key={i} item={item} />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: '#0d0d0d' },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0d' },
});
