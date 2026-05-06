import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

// ─── 1. نظام معالجة الـ Styles من الـ JSON ──────────────
// هذه الدالة تسمح لك بإرسال ألوان، حواف، أو هوامش مباشرة من قاعدة البيانات
const getDynamicStyles = (item) => ({
  backgroundColor: item.bg_color || item.color || 'transparent',
  borderRadius: item.radius || 0,
  padding: item.padding || 0,
  marginTop: item.mt || 0,
  marginBottom: item.mb || 0,
  flexDirection: item.direction || 'column',
  justifyContent: item.justify || 'flex-start',
  alignItems: item.align || 'stretch',
  gap: item.gap || 0,
  flex: item.flex || 0,
});

// ─── 2. المكون الشامل (The Universal Renderer) ──────────────
function DynamicRenderer({ item }) {
  if (!item) return null;

  // دالة لمعالجة الضغط على الأزرار أو الكروت
  const handlePress = () => {
    if (item.action === 'alert') Alert.alert(item.title || "تنبيه", item.body || item.label);
    // يمكنك إضافة شروط أخرى هنا مثل التنقل (Navigation)
  };

  switch (item.type) {
    // حاوية عامة (يمكن أن تكون صف، عمود، أو شبكة)
    case 'container':
    case 'stats_row':
    case 'row':
      return (
        <View style={[getDynamicStyles(item), { flexDirection: item.type === 'row' || item.type === 'stats_row' ? 'row' : 'column' }]}>
          {item.items?.map((child, idx) => (
            <DynamicRenderer key={idx} item={child} />
          ))}
        </View>
      );

    case 'banner':
      return (
        <View style={[s.banner, getDynamicStyles(item)]}>
          <Text style={[s.bannerTitle, { color: item.text_color || '#fff' }]}>{item.title}</Text>
          {item.subtitle && <Text style={s.bannerSub}>{item.subtitle}</Text>}
        </View>
      );

    case 'card':
      return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={[s.card, getDynamicStyles(item)]}>
          {item.image_url && <Image source={{ uri: item.image_url }} style={s.cardImage} />}
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>{item.title}</Text>
            {item.body && <Text style={s.cardText}>{item.body}</Text>}
          </View>
        </TouchableOpacity>
      );

    case 'stat_item': // مكون صغير للإحصائيات
      return (
        <View style={[s.statItem, getDynamicStyles(item)]}>
          <Text style={s.statIcon}>{item.icon}</Text>
          <Text style={s.statLabel}>{item.label}</Text>
          <Text style={[s.statValue, { color: item.color }]}>{item.value}</Text>
        </View>
      );

    case 'button':
      return (
        <TouchableOpacity
          style={[s.btn, getDynamicStyles(item)]}
          onPress={handlePress}
        >
          <Text style={[s.btnText, { color: item.text_color || '#fff' }]}>{item.label}</Text>
        </TouchableOpacity>
      );

    case 'text':
      return <Text style={[s.plainText, getDynamicStyles(item), { fontSize: item.size || 14, color: item.color || '#aaa' }]}>{item.content || item.body}</Text>;

    case 'divider':
      return <View style={[s.divider, { backgroundColor: item.color || '#2a2a2a', marginVertical: item.space || 10 }]} />;

    default:
      console.warn(`Component type "${item.type}" is not defined.`);
      return null;
  }
}

// ─── 3. الشاشة الرئيسية ──────────────────────────────────────
export default function HomeScreen() {
  const [uiData, setUiData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUI = async () => {
    const { data, error } = await supabase
      .from('ui_screens')
      .select('*')
      .eq('screen', 'home')
      .single();
    
    if (data) setUiData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUI();

    // Realtime subscription
    const channel = supabase
      .channel('sdui-home')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'ui_screens', filter: 'screen=eq.home' }, 
        (payload) => setUiData(payload.new)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  // دعم الـ JSON إذا كان عبارة عن مصفوفة مباشرة أو كائن يحتوي على مصفوفة
  const components = Array.isArray(uiData?.components) ? uiData.components : [];

  return (
    <ScrollView 
      style={[s.container, { backgroundColor: uiData?.bg_color || '#111' }]} 
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      {components.map((item, index) => (
        <DynamicRenderer key={index} item={item} />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
  
  banner:      { borderRadius: 20, padding: 25, marginBottom: 15 },
  bannerTitle: { fontSize: 24, fontWeight: '900' },
  bannerSub:   { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  card:        { backgroundColor: '#1e1e1e', borderRadius: 20, overflow: 'hidden', marginBottom: 15, borderWeight: 1, borderColor: '#2a2a2a' },
  cardImage:   { width: '100%', height: 180 },
  cardBody:    { padding: 16 },
  cardTitle:   { fontSize: 18, fontWeight: '700', color: '#fff' },
  cardText:    { fontSize: 14, color: '#888', marginTop: 5 },

  statItem:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e1e1e', padding: 15, borderRadius: 20 },
  statIcon:    { fontSize: 24, marginBottom: 5 },
  statLabel:   { fontSize: 12, color: '#666', fontWeight: 'bold' },
  statValue:   { fontSize: 20, fontWeight: '800' },

  btn:         { borderRadius: 18, padding: 18, alignItems: 'center', justifyContent: 'center' },
  btnText:     { fontWeight: '800', fontSize: 16 },

  plainText:   { textAlign: 'right' },
  divider:     { height: 1.5, width: '100%' },
});
