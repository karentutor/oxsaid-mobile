//src/components/MessageBubble.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';

export default function MessageBubble({
  message,
  mine,
}: {
  message: { content: string; createdAt: string; isReadBy: string[] };
  mine: boolean;
}) {
  const time = dayjs(message.createdAt).format('HH:mm');

  return (
    <View style={[styles.row, mine ? styles.rowR : null]}>
      <View style={[styles.bubble, mine ? styles.me : styles.them]}>
        <Text style={styles.text}>{message.content}</Text>
        <Text style={styles.time}>
          {time} {mine ? '✓' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 4 },
  rowR: { flexDirection: 'row-reverse' },
  bubble: { maxWidth: '75%', padding: 8, borderRadius: 8 },
  me: { backgroundColor: '#DCF8C6' },
  them: { backgroundColor: '#FFF' },
  text: { fontSize: 16 },
  time: { fontSize: 10, alignSelf: 'flex-end', opacity: 0.6 },
});
