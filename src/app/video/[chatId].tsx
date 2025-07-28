/* ------------------------------------------------------------------
 *  VideoScreen — peer‑to‑peer call UI for a single chat
 *  – The FIRST user who opens this screen places the call (state === 'idle')
 *  – The second user only answers (state === 'ringing' by the time they arrive)
 * ----------------------------------------------------------------- */

import { useChat } from '@/context/ChatContext';
import { useVideoCall } from '@/context/VideoCallContext';
import { useAuth } from '@/hooks/useAuth';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';

export default function VideoScreen() {
  /* ----- route / context ----- */
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { chats } = useChat();
  const { auth } = useAuth();
  const {
    localStream,
    remoteStream,
    state,           // 'idle' | 'calling' | 'ringing' | 'in‑call'
    startCall,
    endCall,
  } = useVideoCall();
  const navigation = useNavigation();

  /* ----- derive partner info from chat ----- */
  const chat        = chats.find((c) => c._id === chatId);
  const partnerId   = chat?.partnerId;
  const partnerName = chat?.partnerName ?? '';

  /* ----------------------------------------------------------------
   * Only **one** side (the original caller) is allowed to dial.
   * That side is the one whose VideoCallContext.state === 'idle'
   * when the screen mounts.
   * --------------------------------------------------------------- */
  useEffect(() => {
    if (
      state === 'idle' &&      // ← caller only
      chatId &&
      partnerId &&
      auth.user
    ) {
      startCall(chatId, partnerId);
    }
    navigation.setOptions({ title: partnerName || 'Video Call' });
  }, [state, chatId, partnerId, auth.user]);

  /* Guard: if chatId vanished somehow, don't render the screen */
  if (!chatId) return null;

  console.log('[debug] VideoScreen • myId', auth.user?._id, 'partnerId', partnerId, 'state', state);

  /* ----- ui ----- */
  return (
    <View style={styles.container}>
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remote}
          objectFit="cover"
        />
      )}

      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.local}
          objectFit="cover"
        />
      )}

      <Pressable style={styles.hangup} onPress={endCall}>
        <Ionicons name="call" size={32} color="#fff" />
      </Pressable>

      {state !== 'in-call' && (
        <Text style={styles.banner}>
          {state === 'calling' ? 'Calling…' :
           state === 'ringing'  ? 'Incoming call…' :
           'Connecting…'}
        </Text>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------
 *  Styles
 * ----------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },

  remote: { flex: 1 },

  local: {
    position: 'absolute',
    width: 120,
    height: 160,
    top: 30,
    right: 20,
    borderRadius: 6,
  },

  hangup: {
    backgroundColor: 'red',
    padding: 18,
    borderRadius: 50,
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
  },

  banner: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    color: '#fff',
    fontSize: 16,
  },
});
