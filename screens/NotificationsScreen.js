import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Alert
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle]     = useState('');
  const [message, setMessage] = useState('');
  const [live, setLive]       = useState(false);

  useEffect(() => {
    // تحميل البيانات
    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setNotifications(data); });

    // الاشتراك في Realtime
    const channel = supabase
      .channel('notif-channel')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => setNotifications(prev => [payload.new, ...prev])
      )
      .subscribe(status => setLive(status === 'SUBSCRIBED'));

    return () => supabase.removeChannel(channel);
  }, []);

  const send = async () => {
    if (!title || !message) return Alert.alert('تنبيه', 'اكتب العنوان والرسالة');
    await supabase.from('notifications').insert([{ title, message, type: 'info' }]);
    setTitle('');
    setMessage('');
  };

  return (
    <View style={s.container}>

      {/* Status */}
      <View style={s.statusRow}>
        <View style={[s.dot, { backgroundColor: live ? '#22c55e' : '#ef4444' }]} />
        <Text style={s.statusText}>{live ? 'متصل' : 'جاري الاتصال...'}</Text>
      </View>

      {/* Form */}
      <TextInput style={s.input} placeholder="العنوان" placeholderTextColor="#555"
        value={title} onChangeText={setTitle} />
      <TextInput style={s.input} placeholder="الرسالة" placeholderTextColor="#555"
        value={message} onChangeText={setMessage} />
      <TouchableOpacity style={s.btn} onPress={send}>
        <Text style={s.btnText}>⚡ إرسال</Text>
      </TouchableOpacity>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={i => i.id}
        contentContainerStyle={{ gap: 8, paddingTop: 12 }}
        ListEmptyComponent={<Text style={s.empty}>لا توجد إشعارات</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.cardTitle}>{item.title}</Text>
            <Text style={s.cardMsg}>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#111', padding: 16 },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  dot:        { width: 10, height: 10, borderRadius: 5 },
  statusText: { color: '#888', fontSize: 13 },
  input:      { backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#333' },
  btn:        { backgroundColor: '#7c3aed', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 4 },
  btnText:    { color: '#fff', fontWeight: '700', fontSize: 15 },
  card:       { backgroundColor: '#1e1e1e', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: '#7c3aed' },
  cardTitle:  { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  cardMsg:    { color: '#888', fontSize: 13 },
  empty:      { textAlign: 'center', color: '#555', marginTop: 40 },
});
