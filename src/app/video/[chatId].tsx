/* src/screens/VideoScreen.tsx
 * ------------------------------------------------------------------
 *  UI for a single one‑to‑one WebRTC call
 *  • Dials exactly once per mount
 *  • Shows incoming/connecting/calling banners
 * ----------------------------------------------------------------- */
import { useChat }      from '@/context/ChatContext';
import { useVideoCall } from '@/context/VideoCallContext';
import { useAuth }      from '@/hooks/useAuth';
import { Ionicons }     from '@expo/vector-icons';

import {
  useLocalSearchParams,
  useNavigation,
} from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Pressable, StyleSheet, Text, View,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';

export default function VideoScreen() {
  /* ---------- route + state look‑ups ---------- */
  const { chatId }   = useLocalSearchParams<{ chatId: string }>();
  const { chats }    = useChat();
  const { auth }     = useAuth();
  const navigation   = useNavigation();

  const {
    localStream, remoteStream, state, incomingSdp,
    startCall,   acceptIncoming, declineIncoming, endCall,
  } = useVideoCall();

  const chat        = chats.find(c => c._id === chatId);
  const partnerId   = chat?.partnerId;
  const partnerName = chat?.partnerName ?? '';

  /* ---------- dial exactly once per mount ---------- */
  const hasDialled = useRef(false);

  useEffect(() => {
    if (
      !hasDialled.current &&
      state === 'idle' &&
      incomingSdp === null &&
      chatId && partnerId && auth.user
    ) {
      hasDialled.current = true;
      console.log('[VideoScreen] → startCall');
      startCall(chatId, partnerId, partnerName);
    }

    navigation.setOptions({ title: partnerName || 'Video Call' });
  }, [state, incomingSdp, chatId, partnerId, auth.user, navigation, startCall, partnerName]);

  /* reset the flag when we leave the screen */
  useEffect(() => () => { hasDialled.current = false; }, []);

  if (!chatId || !partnerId) return null;      // chat list still loading

  /* ---------- layout ---------- */
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

      {/* Call‑control buttons */}
      {state === 'ringing' ? (
        <View style={styles.btnRow}>
          <Pressable style={[styles.circle, styles.accept]}
                     onPress={acceptIncoming}>
            <Ionicons name="call" size={32} color="#fff" />
          </Pressable>
          <Pressable style={[styles.circle, styles.decline]}
                     onPress={declineIncoming}>
            <Ionicons name="call" size={32} color="#fff" />
          </Pressable>
        </View>
      ) : (
        <Pressable style={[styles.circle, styles.decline]}
                   onPress={endCall}>
          <Ionicons name="call" size={32} color="#fff" />
        </Pressable>
      )}

      {/* Status banner */}
      {state !== 'in-call' && (
        <Text style={styles.banner}>
          {state === 'calling'  ? 'Calling…'
           : state === 'ringing' ? 'Incoming call…'
           :                       'Connecting…'}
        </Text>
      )}
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  remote:    { flex: 1 },
  local:     { position: 'absolute', width: 120, height: 160,
               top: 30, right: 20, borderRadius: 6 },
  btnRow:    { position: 'absolute', bottom: 60, width: '100%',
               flexDirection: 'row', justifyContent: 'space-evenly' },
  circle:  { padding: 18, borderRadius: 50 },
  accept:  { backgroundColor: 'green' },
  decline: { backgroundColor: 'red' },
  banner:  { position: 'absolute', top: 40, alignSelf: 'center',
             color: '#fff', fontSize: 16 },
});
