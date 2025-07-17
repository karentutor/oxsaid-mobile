// src/context/SocketRegistrationProvider.tsx
// src/context/SocketRegistrationProvider.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from '@/hooks/useAuth';  

export const SocketRegistrationContext = createContext({});

export const SocketRegistrationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { auth } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const user = auth.user;
    if (!user) return;    // ← explicit null check narrows `user` to non-null

    const handleConnect = () => {
      socket.emit('registerUser', {
        userId:    user._id,
        firstName: user.firstName || '',
        lastName:  user.lastName  || '',
      });
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [socket, auth.user]); // you can depend on `auth.user` directly

  return (
    <SocketRegistrationContext.Provider value={{}}>
      {children}
    </SocketRegistrationContext.Provider>
  );
};
