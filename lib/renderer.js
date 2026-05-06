// ─────────────────────────────────────────────────────────────
//  SDUI Renderer — كل component جديد تضيفه هنا بس
// ─────────────────────────────────────────────────────────────
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';

export function RenderComponent({ item }) {
  switch (item.type) {

    // ── Header ──────────────────────────────────────────────
    case 'header':
      return (
        <View style={s.header}>
          <Text style={s.headerTitle}>{item.title}</Text>
          {item.subtitle && <Text style={s.headerSub}>{item.subtitle}</Text>}
        </View>
      );

    // ── Stats Grid (2 × N) ───────────────────────────────────
    case 'stats_grid':
      return (
        <View style={s.statsGrid}>
          {item.items.map((stat, i) => (
            <View key={i} style={[s.statBox, { borderTopColor: stat.color }]}>
              <Text style={s.statIcon}>{stat.icon}</Text>
              <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      );

    // ── Card ─────────────────────────────────────────────────
    case 'card':
      return (
        <View style={[s.card, item.accent && { borderLeftColor: item.accent }]}>
          {item.image_url && (
            <Image source={{ uri: item.image_url }} style={s.cardImage} resizeMode="cover" />
          )}
          <Text style={s.cardTitle}>{item.title}</Text>
          {item.body && <Text style={s.cardBody}>{item.body}</Text>}
        </View>
      );

    // ── Alert Banner ─────────────────────────────────────────
    case 'alert':
      return (
        <View style={[s.alert, { backgroundColor: item.color + '22', borderLeftColor: item.color }]}>
          <Text style={[s.alertText, { color: item.color }]}>{item.message}</Text>
        </View>
      );

    // ── Info List ────────────────────────────────────────────
    case 'info_list':
      return (
        <View style={s.infoList}>
          {item.items.map((row, i) => (
            <View key={i} style={s.infoRow}>
              <Text style={s.infoLabel}>{row.label}</Text>
              <Text style={s.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      );

    // ── Button ───────────────────────────────────────────────
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

    // ── Text ─────────────────────────────────────────────────
    case 'text':
      return <Text style={s.text}>{item.content}</Text>;

    // ── Image ────────────────────────────────────────────────
    case 'image':
      return (
        <Image
          source={{ uri: item.url }}
          style={[s.image, item.height && { height: item.height }]}
          resizeMode={item.fit || 'cover'}
        />
      );

    // ── Divider ──────────────────────────────────────────────
    case 'divider':
      return <View style={s.divider} />;

    // ── Spacer ───────────────────────────────────────────────
    case 'spacer':
      return <View style={{ height: item.height || 16 }} />;

    default:
      return null;
  }
}

const s = StyleSheet.create({
  // Header
  header:      { marginBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub:   { fontSize: 13, color: '#555', marginTop: 4 },

  // Stats Grid
  statsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statBox:     { width: '47%', backgroundColor: '#1a1a1a', borderRadius: 14,
                 padding: 16, borderTopWidth: 3, alignItems: 'center', gap: 4 },
  statIcon:    { fontSize: 24 },
  statValue:   { fontSize: 22, fontWeight: '800' },
  statLabel:   { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Card
  card:        { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16,
                 borderLeftWidth: 3, borderLeftColor: '#2a2a2a' },
  cardImage:   { width: '100%', height: 180, borderRadius: 10, marginBottom: 12 },
  cardTitle:   { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 6 },
  cardBody:    { fontSize: 13, color: '#888', lineHeight: 20 },

  // Alert
  alert:       { borderRadius: 10, padding: 14, borderLeftWidth: 3 },
  alertText:   { fontSize: 13, fontWeight: '600' },

  // Info List
  infoList:    { backgroundColor: '#1a1a1a', borderRadius: 14, overflow: 'hidden' },
  infoRow:     { flexDirection: 'row', justifyContent: 'space-between',
                 padding: 14, borderBottomWidth: 1, borderBottomColor: '#222' },
  infoLabel:   { fontSize: 13, color: '#666' },
  infoValue:   { fontSize: 13, color: '#fff', fontWeight: '600' },

  // Button
  btn:         { borderRadius: 14, padding: 16, alignItems: 'center' },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Others
  text:        { fontSize: 14, color: '#888', lineHeight: 22 },
  image:       { width: '100%', height: 200, borderRadius: 12 },
  divider:     { height: 1, backgroundColor: '#1e1e1e' },
});
