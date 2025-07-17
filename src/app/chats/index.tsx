import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChat, ChatMeta } from '@/context/ChatContext';

export default function ChatList() {
  const router = useRouter();
  const { chats } = useChat();

  const renderItem = ({ item }: { item: ChatMeta }) => (
    <Pressable
      android_ripple={{ color: '#D6E4FF' }}                 /* Android */
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,                       /* iOS   */
      ]}
      onPress={() => router.push(`/chats/${item._id}`)}
    >
      <View style={styles.avatar} />

      <View style={styles.content}>
        <Text style={styles.name}>{item.partnerName}</Text>
        <Text style={styles.preview} numberOfLines={1}>
          {item.latest}
        </Text>
      </View>

      {item.unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unread}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <FlatList
      data={chats}
      keyExtractor={(c) => c._id}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
      ListEmptyComponent={
        <Text style={{ padding: 24, textAlign: 'center', color: '#666' }}>
          No chats yet — start one from “Find Users”.
        </Text>
      }
    />
  );
}

const PRIMARY = '#0066CC';
const styles = StyleSheet.create({
  row: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  rowPressed: { backgroundColor: '#F0F6FF' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#AAA',
    marginRight: 12,
  },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  preview: { color: '#666', marginTop: 2 },
  badge: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minWidth: 24,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  badgeText: { color: '#FFF', fontSize: 12 },
  sep: { height: 1, backgroundColor: '#EEE', marginLeft: 72 },
});
