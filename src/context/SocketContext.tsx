// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { useAuth } from '@/hooks/useAuth';      // ⇦ your existing hook

type SocketContextType = Socket | null;

const SocketContext = createContext<SocketContextType>(null);

export const SocketProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  // create only once
  if (!socketRef.current) {
const socketURL =
  Constants.expoConfig?.extra?.socketUrl as string; // camelCase!
    socketRef.current = io(socketURL, {
      path: '/socket.io/',
      reconnection: true,
      autoConnect: false,
    });
  }

  useEffect(() => {
    const sock = socketRef.current!;
    if (isAuthenticated) sock.connect();
    else                 sock.disconnect();
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
