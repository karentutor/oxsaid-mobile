/* ------------------------------------------------------------------
 *  Centralised WebRTC logic + socket signalling  (FIXED VERSION)
 * ----------------------------------------------------------------- */
import { useAuth }   from '@/hooks/useAuth';
import { useSocket } from './SocketContext';
import { router }    from 'expo-router';
import React, {
  createContext, useContext, useEffect, useMemo,
  useRef, useState,
} from 'react';
import InCallManager from 'react-native-incall-manager';

import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';

import { Camera } from 'expo-camera';
import { Audio }  from 'expo-av';
import Toast      from 'react-native-toast-message';

/* ---------- local types ---------- */
type CallState = 'idle' | 'calling' | 'ringing' | 'in-call';

interface PeerWithHandlers extends RTCPeerConnection {
  onicecandidate: ((e: { candidate: RTCIceCandidate | null }) => void) | null;
  ontrack:        ((e: { streams: MediaStream[] }) => void) | null;
}

interface VideoCtx {
  state: CallState;
  localStream:  MediaStream | null;
  remoteStream: MediaStream | null;
  currentChatId: string | null;
  incomingSdp:   any | null;

  startCall(chatId: string, partnerId: string): Promise<void>;
  acceptIncoming(): Promise<void>;
  declineIncoming(): void;
  endCall(): void;
}

const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

/* ---------- context scaffold ---------- */
const VideoCallContext = createContext<VideoCtx>(null!);
export const useVideoCall = () => useContext(VideoCallContext);

/* ==================================================================
 *  Provider
 * =================================================================*/
export const VideoCallProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { auth } = useAuth();
  const socket   = useSocket();

  const pc        = useRef<PeerWithHandlers | null>(null);
  const destRef   = useRef<string | null>(null);

  const [state,        setState]        = useState<CallState>('idle');
  const [incomingSdp,  setIncomingSdp]  = useState<any | null>(null);
  const [localStream,  setLocal]        = useState<MediaStream | null>(null);
  const [remoteStream, setRemote]       = useState<MediaStream | null>(null);
  const [currentChatId,setChatId]       = useState<string | null>(null);

  /* ------------ helper: ask for camera & mic, then open ------------ */
  const obtainMedia = async () => {
    if (localStream) return localStream;

    /* 1 ▸ ask permissions (camera + audio) */
    const [{ status: cam }, { status: mic }] = await Promise.all([
      Camera.requestCameraPermissionsAsync(),
      Audio.requestPermissionsAsync(),
    ]);
    if (cam !== 'granted' || mic !== 'granted') {
      throw new Error('Permissions not granted for camera / microphone');
    }

    /* 2 ▸ open media */
    const s = await mediaDevices.getUserMedia({ video: true, audio: true });
    setLocal(s);
    return s;
  };

  /* ------------ helper: prepare RTCPeerConnection -- */
  const initPC = (chatId: string) => {
    const peer = new RTCPeerConnection(ICE) as PeerWithHandlers;
    pc.current = peer;

    peer.onicecandidate = (e) => {
      if (e.candidate && auth.user && destRef.current) {
        socket?.emit('video-ice-candidate', {
          chatId,
          from: auth.user._id,
          to:   destRef.current,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      if (e.streams?.[0]) setRemote(e.streams[0]);
    };

    return peer;
  };

  /* =================================================================
   *  1. Outgoing call
   * =================================================================*/
  const startCall = async (chatId: string, partnerId: string) => {
    console.log('[startCall]', { chatId, partnerId,
                                 socketConnected: socket?.connected });

    if (!auth.user) return;
    destRef.current = partnerId;

    /* ensure socket is hand‑shaken */
    if (!socket?.connected) {
      socket?.once('connect', () => startCall(chatId, partnerId));
      socket?.connect();
      return;
    }

    setChatId(chatId);
    setState('calling');
    InCallManager.start({ media: 'audio' });

    try {
      const stream = await obtainMedia();
      const peer   = initPC(chatId);
      stream.getTracks().forEach((t) => peer.addTrack(t, stream));

      await peer.setLocalDescription(await peer.createOffer({}));
      console.log('[startCall] → emit video-offer');

      socket.emit('video-offer', {
        chatId,
        from: auth.user._id,
        to:   partnerId,
        sdp:  peer.localDescription,
      });
    } catch (err: any) {
      console.error('[startCall] failed', err);
      Toast.show({ type: 'error', text1: err.message ?? 'Cannot start call' });
      setState('idle');
      cleanup();
    }
  };

  /* =================================================================
   *  2. Incoming offer
   * =================================================================*/
  const handleOffer = (d: any) => {
    if (!auth.user || d.to !== auth.user._id) return;
    console.log('[handleOffer] offer received for me', d.chatId);

    destRef.current = d.from;
    setChatId(d.chatId);
    setIncomingSdp(d.sdp);
    setState('ringing');

    router.push(`/video/${d.chatId}`);
  };

  /* =================================================================
   *  3. Callee actions
   * =================================================================*/
  const acceptIncoming = async () => {
    if (!incomingSdp || !currentChatId || !destRef.current || !auth.user)
      return;

    setState('in-call');
    InCallManager.start({ media: 'audio' });

    try {
      const stream = await obtainMedia();
      const peer   = initPC(currentChatId);
      stream.getTracks().forEach(t => peer.addTrack(t, stream));

      await peer.setRemoteDescription(new RTCSessionDescription(incomingSdp));
      await peer.setLocalDescription(await peer.createAnswer());

      socket?.emit('video-answer', {
        chatId: currentChatId,
        from:   auth.user._id,
        to:     destRef.current,
        sdp:    peer.localDescription,
      });

      setIncomingSdp(null);
    } catch (err: any) {
      console.error('[acceptIncoming] failed', err);
      Toast.show({ type: 'error', text1: err.message ?? 'Cannot answer call' });
      endCall();
    }
  };

  const declineIncoming = () => endCall();

  /* =================================================================
   *  4. Caller receives answer + ICE exchange
   * =================================================================*/
  const handleAnswer = async (d: any) => {
    if (!auth.user || d.to !== auth.user._id) return;
    await pc.current?.setRemoteDescription(new RTCSessionDescription(d.sdp));
    setState('in-call');
  };

  const handleICE = async (d: any) => {
    if (!auth.user || d.to !== auth.user._id) return;
    try { await pc.current?.addIceCandidate(new RTCIceCandidate(d.candidate)); }
    catch {}
  };

  /* =================================================================
   *  5. Hang‑up
   * =================================================================*/
  const cleanup = () => {
    pc.current?.close();
    pc.current = null;

    setRemote(null);
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocal(null);
    }
    setIncomingSdp(null);
    InCallManager.stop();
  };

  const endCall = () => {
    if (auth.user && currentChatId && destRef.current) {
      socket?.emit('video-end', {
        chatId: currentChatId,
        from:   auth.user._id,
        to:     destRef.current,
      });
    }

    /* leave the video screen so its useEffect won’t redial */
    router.canGoBack() && router.back();

    setState('idle');
    cleanup();
  };

  /* =================================================================
   *  6. Socket wiring
   * =================================================================*/
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

  /* =================================================================
   *  7. Provide context
   * =================================================================*/
  const value = useMemo(() => ({
    state, localStream, remoteStream, currentChatId, incomingSdp,
    startCall, acceptIncoming, declineIncoming, endCall,
  }), [state, localStream, remoteStream, currentChatId, incomingSdp]);

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};
