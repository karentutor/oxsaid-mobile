/* ------------------------------------------------------------------
 *  UI for a single video call
 * ----------------------------------------------------------------- */
import { useChat }      from '@/context/ChatContext';
import { useVideoCall } from '@/context/VideoCallContext';
import { useAuth }      from '@/hooks/useAuth';
import { Ionicons }     from '@expo/vector-icons';

import {
  useLocalSearchParams,
  useNavigation,
} from 'expo-router';
import React, { useEffect } from 'react';
import {
  Pressable, StyleSheet, Text, View,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';

export default function VideoScreen() {
  const { chatId }  = useLocalSearchParams<{ chatId: string }>();
  const { chats }   = useChat();
  const { auth }    = useAuth();

  const {
    localStream, remoteStream, state, incomingSdp,
    startCall,   acceptIncoming, declineIncoming, endCall,
  } = useVideoCall();

  const navigation  = useNavigation();
  const chat        = chats.find(c => c._id === chatId);
  const partnerId   = chat?.partnerId;
  const partnerName = chat?.partnerName ?? '';

  /* caller dials exactly once ---------------------------------- */
  useEffect(() => {
    const shouldDial =
         state === 'idle' &&
         incomingSdp === null &&
         !!chatId && !!partnerId && !!auth.user;

    if (shouldDial) {
      console.log('[VideoScreen] → startCall');
      startCall(chatId!, partnerId!);
    }
    console.log('[VideoScreen] guard',
      { state, chatId, partnerId, incomingSdp });

    navigation.setOptions({ title: partnerName || 'Video Call' });
  }, [state, incomingSdp, chatId, partnerId, auth.user, startCall]);

  if (!chatId) return null;

  /* ---------------- view ---------------- */
  return (
    <View style={styles.container}>
      {remoteStream &&
        <RTCView streamURL={remoteStream.toURL()}
                 style={styles.remote} objectFit="cover" />}
      {localStream &&
        <RTCView streamURL={localStream.toURL()}
                 style={styles.local} objectFit="cover" />}

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

      {state !== 'in-call' &&
        <Text style={styles.banner}>
          {state === 'calling'  ? 'Calling…'
           : state === 'ringing' ? 'Incoming call…'
           :                       'Connecting…'}
        </Text>}
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
