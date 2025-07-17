import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Text,
} from 'react-native';
import {
  useLocalSearchParams,
  useNavigation,
  useFocusEffect,
} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChat, Message } from '@/context/ChatContext';

const PRIMARY = '#0066CC';

export default function Wrapper() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  if (!chatId) return null;
  return <ChatScreen chatId={chatId} />;
}

function ChatScreen({ chatId }: { chatId: string }) {
  const { messages, send, markRead, loadMessages, chats } = useChat();
  const [text, setText] = useState('');
  const flatRef = useRef<FlatList>(null);
  const nav = useNavigation();

  const msgs: Message[] = messages[chatId] ?? [];
  const partnerName =
    chats.find((c) => c._id === chatId)?.partnerName ?? 'Chat';

  /* initial history load */
  useEffect(() => {
    loadMessages(chatId);
  }, [chatId]);

  /* scroll to bottom on new messages */
  useEffect(() => {
    flatRef.current?.scrollToEnd({ animated: true });
  }, [msgs.length]);

  /* header title */
  useEffect(() => {
    nav.setOptions({ title: partnerName });
  }, [nav, partnerName]);

  /* on focus: mark read & instant scroll */
  useFocusEffect(
    useCallback(() => {
      markRead(chatId);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 50);
      return () => {};
    }, [chatId]),
  );

  const handleSend = () => {
    if (!text.trim()) return;
    send(chatId, text.trim());
    setText('');
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.row, item.mine && styles.rowR]}>
      <View style={[styles.bubble, item.mine ? styles.me : styles.them]}>
        <Text style={styles.text}>{item.text}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatRef}
        data={msgs}
        extraData={msgs.length}          /* forces re‑render */
        keyExtractor={(m) => m._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message…"
          multiline
        />
        <Pressable onPress={handleSend} style={styles.sendBtn}>
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5DDD5' },
  row: { flexDirection: 'row', marginVertical: 4 },
  rowR: { flexDirection: 'row-reverse' },
  bubble: { maxWidth: '75%', padding: 8, borderRadius: 8 },
  me: { backgroundColor: '#DCF8C6' },
  them: { backgroundColor: '#FFF' },
  text: { fontSize: 16 },
  time: { fontSize: 10, alignSelf: 'flex-end', opacity: 0.6 },
  inputRow: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  input: { flex: 1, padding: 8, fontSize: 16, maxHeight: 120 },
  sendBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 6,
  },
});
