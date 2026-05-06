import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './lib/supabase';

// ─── Screens ──────────────────────────────────────────────
import HomeScreen         from './screens/HomeScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen      from './screens/ProfileScreen';

// ربط كل key بالشاشة المناسبة
const SCREEN_MAP = {
  home:          HomeScreen,
  notifications: NotificationsScreen,
  profile:       ProfileScreen,
};

// ─── Custom Tab Bar ───────────────────────────────────────
function TabBar({ tabs, activeKey, onSelect }) {
  return (
    <View style={s.tabBar}>
      {tabs.map(tab => {
        const isActive = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            style={s.tabItem}
            onPress={() => onSelect(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={s.tabIcon}>{tab.icon}</Text>
            <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={s.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── App ──────────────────────────────────────────────────
export default function App() {
  const [tabs, setTabs]         = useState([]);
  const [activeKey, setActiveKey] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // 1. جلب الـ tabs من Supabase
    supabase
      .from('ui_navigation')
      .select('tabs')
      .single()
      .then(({ data }) => {
        if (data?.tabs?.length) {
          setTabs(data.tabs);
          setActiveKey(data.tabs[0].key);
        }
        setLoading(false);
      });

    // 2. Realtime: الـ tabs تتغير فوراً من Supabase
    const channel = supabase
      .channel('sdui-nav')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ui_navigation' },
        (payload) => {
          const newTabs = payload.new.tabs;
          setTabs(newTabs);
          // إذا الـ tab النشط اتحذف، روح للأول
          setActiveKey(prev =>
            newTabs.find(t => t.key === prev) ? prev : newTabs[0]?.key
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={s.loadingText}>جاري تحميل التطبيق...</Text>
      </View>
    );
  }

  // الشاشة النشطة
  const ActiveScreen = SCREEN_MAP[activeKey] || HomeScreen;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        {/* الشاشة الحالية */}
        <View style={{ flex: 1 }}>
          <ActiveScreen />
        </View>

        {/* Tab Bar من Supabase */}
        <TabBar tabs={tabs} activeKey={activeKey} onSelect={setActiveKey} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#111' },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
  loadingText:  { color: '#555', marginTop: 12, fontSize: 14 },

  tabBar:       { flexDirection: 'row', backgroundColor: '#1a1a1a', borderTopWidth: 1, borderTopColor: '#2a2a2a', paddingBottom: 8 },
  tabItem:      { flex: 1, alignItems: 'center', paddingTop: 10, position: 'relative' },
  tabIcon:      { fontSize: 22 },
  tabLabel:     { fontSize: 11, color: '#555', marginTop: 3 },
  tabLabelActive: { color: '#7c3aed', fontWeight: '700' },
  tabIndicator: { position: 'absolute', top: 0, width: 24, height: 3, backgroundColor: '#7c3aed', borderRadius: 2 },
});
