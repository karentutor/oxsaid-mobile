import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import InCallManager from 'react-native-incall-manager';
import { useSocket } from './SocketContext';

import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';

/* ---------- helpers ---------- */
interface PeerWithHandlers extends RTCPeerConnection {
  onicecandidate: ((e: { candidate: RTCIceCandidate | null }) => void) | null;
  ontrack: ((e: { streams: MediaStream[] }) => void) | null;
}

type CallState = 'idle' | 'calling' | 'ringing' | 'in-call';

interface VideoCtx {
  state: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  currentChatId: string | null;
  incomingSdp: any | null;

  /* actions */
  startCall(chatId: string, partnerId: string): Promise<void>;
  acceptIncoming(): Promise<void>;
  declineIncoming(): void;
  endCall(): void;
}

const VideoCallContext = createContext<VideoCtx>(null!);
export const useVideoCall = () => useContext(VideoCallContext);

const ICE = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */
export const VideoCallProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { auth } = useAuth();
  const socket = useSocket();

  const pc = useRef<PeerWithHandlers | null>(null);
  const destIdRef = useRef<string | null>(null);

  const [state, setState] = useState<CallState>('idle');
  const [incomingSdp, setIncomingSdp] = useState<any | null>(null);
  const [localStream, setLocal] = useState<MediaStream | null>(null);
  const [remoteStream, setRemote] = useState<MediaStream | null>(null);
  const [currentChatId, setChatId] = useState<string | null>(null);

  /* ------------ helpers ------------ */
  const obtainMedia = async (): Promise<MediaStream> => {
    if (localStream) return localStream;
    const stream = await mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocal(stream);
    return stream;
  };

  const initPC = (chatId: string): PeerWithHandlers => {
    const peer = new RTCPeerConnection(ICE) as PeerWithHandlers;
    pc.current = peer;

    peer.onicecandidate = (e) => {
      if (e.candidate && auth.user && destIdRef.current) {
        socket?.emit('video-ice-candidate', {
          chatId,
          from: auth.user._id,
          to: destIdRef.current,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      if (e.streams && e.streams[0]) setRemote(e.streams[0]);
    };

    return peer;
  };

  /* ------------ outgoing ------------ */
  const startCall = async (chatId: string, partnerId: string) => {
    if (!auth.user) return;
    destIdRef.current = partnerId;

    setChatId(chatId);
    setState('calling');
    InCallManager.start({ media: 'audio' });

    const stream = await obtainMedia();
    const peer = initPC(chatId);
    stream.getTracks().forEach((t) => peer.addTrack(t, stream));

    const offer = await peer.createOffer({});
    await peer.setLocalDescription(offer);

    socket?.emit('video-offer', {
      chatId,
      from: auth.user._id,
      to: partnerId,
      sdp: peer.localDescription,
    });
  };

  /* ------------ incoming offer ------------ */
  const handleOffer = async (data: any) => {
    if (!auth.user || data.to !== auth.user._id) return;

    destIdRef.current = data.from;
    setChatId(data.chatId);
    setIncomingSdp(data.sdp);
    setState('ringing');

    router.push(`/video/${data.chatId}`);
  };

  /* ------------ accept / decline ------------ */
  const acceptIncoming = async () => {
    if (!incomingSdp || !currentChatId || !destIdRef.current || !auth.user)
      return;

    setState('in-call');
    InCallManager.start({ media: 'audio' });

    const stream = await obtainMedia();
    const peer = initPC(currentChatId);
    stream.getTracks().forEach((t) => peer.addTrack(t, stream));

    await peer.setRemoteDescription(new RTCSessionDescription(incomingSdp));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket?.emit('video-answer', {
      chatId: currentChatId,
      from: auth.user._id,
      to: destIdRef.current,
      sdp: peer.localDescription,
    });

    setIncomingSdp(null);
  };

  const declineIncoming = () => {
    endCall();
  };

  /* ------------ handle answer / ICE ------------ */
  const handleAnswer = async (data: any) => {
    if (!auth.user || data.to !== auth.user._id) return;
    await pc.current?.setRemoteDescription(
      new RTCSessionDescription(data.sdp),
    );
    setState('in-call');
  };

  const handleICE = async (data: any) => {
    if (!auth.user || data.to !== auth.user._id) return;
    try {
      await pc.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch {}
  };

  /* ------------ end / cleanup ------------ */
  const cleanup = () => {
    pc.current?.close();
    pc.current = null;
    setRemote(null);
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocal(null);
    }
    setIncomingSdp(null);
    InCallManager.stop();
  };

  const endCall = () => {
    if (auth.user && currentChatId && destIdRef.current) {
      socket?.emit('video-end', {
        chatId: currentChatId,
        from: auth.user._id,
        to: destIdRef.current,
      });
    }
    setState('idle');
    cleanup();
  };

  /* ------------ wire socket ------------ */
  useEffect(() => {
    if (!socket) return;

    socket.on('video-offer', handleOffer);
    socket.on('video-answer', handleAnswer);
    socket.on('video-ice-candidate', handleICE);
    socket.on('video-end', endCall);

    return () => {
      socket.off('video-offer', handleOffer);
      socket.off('video-answer', handleAnswer);
      socket.off('video-ice-candidate', handleICE);
      socket.off('video-end', endCall);
    };
  }, [socket, auth.user?._id]);

  /* ------------ exposed value ------------ */
  const value = useMemo(
    () => ({
      state,
      localStream,
      remoteStream,
      currentChatId,
      incomingSdp,
      startCall,
      acceptIncoming,
      declineIncoming,
      endCall,
    }),
    [state, localStream, remoteStream, currentChatId, incomingSdp],
  );

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};
