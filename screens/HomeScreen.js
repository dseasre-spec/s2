// ─────────────────────────────────────────────────────────────
//  App.js — كل شي من Supabase: Tabs + Screens
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './lib/supabase';
import SDUIScreen from './screens/SDUIScreen';

// ─── Tab Bar ─────────────────────────────────────────────────
function TabBar({ tabs, active, onSelect }) {
  return (
    <View style={s.tabBar}>
      {tabs.map(tab => (
        <TouchableOpacity key={tab.key} style={s.tab} onPress={() => onSelect(tab)} activeOpacity={0.7}>
          <Text style={s.tabIcon}>{tab.icon}</Text>
          <Text style={[s.tabLabel, active.key === tab.key && s.tabActive]}>
            {tab.label}
          </Text>
          {active.key === tab.key && <View style={s.tabBar_indicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  const [tabs, setTabs]     = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('ui_navigation')
      .select('tabs')
      .single()
      .then(({ data }) => {
        if (data?.tabs?.length) {
          setTabs(data.tabs);
          setActive(data.tabs[0]);
        }
        setLoading(false);
      });

    // Realtime على الـ Tabs
    const channel = supabase
      .channel('sdui-nav')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ui_navigation' },
        (payload) => {
          const newTabs = payload.new.tabs;
          setTabs(newTabs);
          setActive(prev =>
            newTabs.find(t => t.key === prev?.key) || newTabs[0]
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        {/* الشاشة — كل tab يفتح شاشة SDUI بناءً على screen name */}
        <View style={{ flex: 1 }}>
          {active && <SDUIScreen name={active.screen} />}
        </View>

        {/* Tabs من Supabase */}
        <TabBar tabs={tabs} active={active} onSelect={setActive} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#0d0d0d' },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0d' },
  tabBar:         { flexDirection: 'row', backgroundColor: '#111', borderTopWidth: 1, borderTopColor: '#1e1e1e', paddingBottom: 8 },
  tab:            { flex: 1, alignItems: 'center', paddingTop: 10, position: 'relative' },
  tabIcon:        { fontSize: 20 },
  tabLabel:       { fontSize: 11, color: '#444', marginTop: 2 },
  tabActive:      { color: '#7c3aed', fontWeight: '700' },
  tabBar_indicator: { position: 'absolute', top: 0, width: 20, height: 2, backgroundColor: '#7c3aed', borderRadius: 2 },
});
