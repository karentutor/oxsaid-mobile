// src/context/VideoCallContext.tsx
import React, {
  createContext, useContext, useEffect, useMemo,
  useRef, useState
} from 'react';
import { router } from 'expo-router';
import InCallManager from 'react-native-incall-manager';
import {
  mediaDevices, MediaStream,
  RTCIceCandidate, RTCPeerConnection,
  RTCSessionDescription
} from 'react-native-webrtc';
import { Camera } from 'expo-camera';
import { Audio }  from 'expo-av';
import Toast      from 'react-native-toast-message';

import RNCallKeep from 'react-native-callkeep';
import { PermissionsAndroid, Platform } from 'react-native';
import uuid from 'react-native-uuid';  // default export has .v4()

import { useAuth }   from '@/hooks/useAuth';
import { useSocket } from './SocketContext';

type CallState = 'idle' | 'calling' | 'ringing' | 'in-call';

interface VideoCtx {
  state: CallState;
  localStream:  MediaStream | null;
  remoteStream: MediaStream | null;
  currentChatId: string | null;
  incomingSdp:   any | null;

  startCall(chatId: string, partnerId: string, partnerName: string): Promise<void>;
  acceptIncoming(): Promise<void>;
  declineIncoming(): void;
  endCall(): void;
}

const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const VideoCallContext = createContext<VideoCtx>(null!);
export const useVideoCall = () => useContext(VideoCallContext);

export const VideoCallProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { auth } = useAuth();
  const socket    = useSocket();

  const pc           = useRef<RTCPeerConnection|null>(null);
  const destRef      = useRef<string|null>(null);
  const callUUIDRef  = useRef<string|null>(null);

  const [state,        setState]       = useState<CallState>('idle');
  const [incomingSdp,  setIncomingSdp] = useState<any|null>(null);
  const [localStream,  setLocal]       = useState<MediaStream|null>(null);
  const [remoteStream, setRemote]      = useState<MediaStream|null>(null);
  const [currentChatId,setChatId]      = useState<string|null>(null);

  // --- ask for cam + mic, fall back to audio-only ---
  const obtainMedia = async () => {
    if (localStream) return localStream;
    const [camP, micP] = await Promise.all([
      Camera.requestCameraPermissionsAsync(),
      Audio.requestPermissionsAsync(),
    ]);
    if (micP.status !== 'granted') {
      throw new Error('Microphone permission denied');
    }
    try {
      const s = await mediaDevices.getUserMedia({
        video: camP.status === 'granted',
        audio: true,
      });
      setLocal(s);
      return s;
    } catch {
      const s = await mediaDevices.getUserMedia({ video: false, audio: true });
      setLocal(s);
      Toast.show({ type: 'info', text1: 'Camera unavailable – audio only' });
      return s;
    }
  };

  // --- request only the runtime Android permissions that exist ---
  const requestAndroidCallPermissions = async () => {
    if (Platform.OS !== 'android') return;
    const perms = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    ]);
    const ok = Object.values(perms).every(status => status === 'granted');
    if (!ok) console.warn('Not all call permissions granted', perms);
  };

  // --- set up peer connection & wire ICE / tracks, using ts‑safe casts for events ---
  const initPC = (chatId: string) => {
    const peer = new RTCPeerConnection(ICE);
    pc.current = peer;

    // TS defs for react-native-webrtc omit these, so cast to any:
    (peer as any).onicecandidate = (e: { candidate: RTCIceCandidate | null }) => {
      if (e.candidate && auth.user && destRef.current) {
        socket?.emit('video-ice-candidate', {
          chatId, from: auth.user._id, to: destRef.current, candidate: e.candidate
        });
      }
    };

    (peer as any).ontrack = (e: { streams: MediaStream[] }) => {
      if (e.streams[0]) setRemote(e.streams[0]);
    };

    return peer;
  };

  // --- outgoing call ---
  const startCall = async (chatId: string, partnerId: string, partnerName: string) => {
    if (!auth.user) return;
    destRef.current = partnerId;
    await requestAndroidCallPermissions();

    // generate a UUID
    const uuidStr = uuid.v4() as string;
    callUUIDRef.current = uuidStr;

    // tell CallKeep to show the native outgoing UI
    // signature: startCall(callUUID, handle, handleType?, localizedCallerName?, hasVideo?)
  // ✅ correct order:
 RNCallKeep.startCall(
   uuidStr,        // call UUID
   partnerId,      // the “handle” (phone number or id)
   partnerName,    // localizedCallerName (what the user sees)
   'number',       // handleType – use 'number' if it’s a numeric handle
   true            // hasVideo
 );


    setChatId(chatId);
    setState('calling');
    try { InCallManager.start({ media: 'audio' }); } catch {}

    const stream = await obtainMedia();
    const peer   = initPC(chatId);
    stream.getTracks().forEach(t => peer.addTrack(t, stream));
    await peer.setLocalDescription(await peer.createOffer());
    socket?.emit('video-offer', {
      chatId,
      from: auth.user._id,
      to:   partnerId,
      sdp:  peer.localDescription,
      callUUID: uuidStr,
    });
  };

  // --- incoming offer ---
  const handleOffer = (d: any) => {
    if (!auth.user || d.to !== auth.user._id) return;

    const uuidStr = uuid.v4() as string;
    callUUIDRef.current = uuidStr;
    destRef.current     = d.from;
    setChatId(d.chatId);
    setIncomingSdp(d.sdp);
    setState('ringing');

    // show native incoming UI
    // signature: displayIncomingCall(callUUID, handle, localizedCallerName?, handleType?, hasVideo?)
    RNCallKeep.displayIncomingCall(
      uuidStr,
      d.from,       // handle
      d.fromName,   // localizedCallerName
      'generic',
      true
    );

    router.push(`/video/${d.chatId}`);
  };

  // --- accept / decline ---
  const acceptIncoming = async () => {
    const uuidStr = callUUIDRef.current!;
    RNCallKeep.answerIncomingCall(uuidStr);
    setState('in-call');
    try { InCallManager.start({ media: 'audio' }); } catch {}

    const stream = await obtainMedia();
    const peer   = initPC(currentChatId!);
    stream.getTracks().forEach(t => peer.addTrack(t, stream));
    await peer.setRemoteDescription(new RTCSessionDescription(incomingSdp!));
    await peer.setLocalDescription(await peer.createAnswer());

    socket?.emit('video-answer', {
      chatId: currentChatId,
      from: auth.user!._id,
      to:   destRef.current!,
      sdp:  peer.localDescription,
    });

    setIncomingSdp(null);
  };
  const declineIncoming = () => {
    RNCallKeep.rejectCall(callUUIDRef.current!);
    endCall();
  };

  // --- handle remote answer + ICE ---
  const handleAnswer = async (d: any) => {
    if (!auth.user || d.to !== auth.user._id) return;
    // correct method name:
    RNCallKeep.reportConnectedOutgoingCallWithUUID(callUUIDRef.current!);
    await pc.current?.setRemoteDescription(new RTCSessionDescription(d.sdp));
    setState('in-call');
  };
  const handleICE = async (d: any) => {
    if (!auth.user || d.to !== auth.user._id) return;
    try { await pc.current?.addIceCandidate(new RTCIceCandidate(d.candidate)); } catch {}
  };

  // --- hang up + cleanup ---
  const cleanup = () => {
    pc.current?.close();
    pc.current = null;
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocal(null);
    }
    setRemote(null);
    setIncomingSdp(null);
    try { InCallManager.stop(); } catch {}
  };
  const endCall = () => {
    const uuidStr = callUUIDRef.current;
    if (uuidStr) {
      RNCallKeep.endCall(uuidStr);
      callUUIDRef.current = null;
    }
    if (auth.user && currentChatId && destRef.current) {
      socket?.emit('video-end', {
        chatId: currentChatId,
        from:   auth.user._id,
        to:     destRef.current,
      });
    }
    router.canGoBack() && router.back();
    setState('idle');
    cleanup();
  };

  // --- socket wiring ---
  useEffect(() => {
    if (!socket) return;
    socket.on('video-offer',         handleOffer);
    socket.on('video-answer',        handleAnswer);
    socket.on('video-ice-candidate', handleICE);
    socket.on('video-end',           endCall);
    return () => {
      socket.off('video-offer',         handleOffer);
      socket.off('video-answer',        handleAnswer);
      socket.off('video-ice-candidate', handleICE);
      socket.off('video-end',           endCall);
    };
  }, [socket, auth.user?._id]);

  const value = useMemo(() => ({
    state, localStream, remoteStream, currentChatId, incomingSdp,
    startCall, acceptIncoming, declineIncoming, endCall
  }), [state, localStream, remoteStream, currentChatId, incomingSdp]);

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};
