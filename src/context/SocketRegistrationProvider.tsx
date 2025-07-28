/* ------------------------------------------------------------------
 *  SocketRegistrationProvider
 *  ▸ Registers the current user with the signalling‑server (socket.io)
 *  ▸ Re‑registers automatically every time the socket reconnects
 *  ▸ Re‑registers when auth.user changes after login / logout
 * ----------------------------------------------------------------- */

import React, { createContext, useEffect } from 'react';
import { useAuth }   from '@/hooks/useAuth';
import { useSocket } from './SocketContext';

export const SocketRegistrationContext = createContext({});

/* The provider does not expose any value – it just ensures the
 * registration side effect happens before other realtime providers. */
export const SocketRegistrationProvider: React.FC<
  React.PropsWithChildren
> = ({ children }) => {
  const { auth } = useAuth();
  const socket   = useSocket();

  useEffect(() => {
    if (!socket) return;

    /* guard – nothing to register until we have a logged‑in user */
    const user = auth.user;
    if (!user) return;

    /* helper so we can reuse the logic in two places */
    const sendRegistration = () => {
      console.log('[registerUser] emit for', user._id);
      socket.emit('registerUser', {
        userId:    user._id,
        firstName: user.firstName ?? '',
        lastName:  user.lastName  ?? '',
      });
    };

    // ① immediately if the socket is already connected
    if (socket.connected) sendRegistration();

    // ② again every time the socket reconnects (after reload etc.)
    socket.on('connect', sendRegistration);

    /* cleanup */
   return () => {
  socket.off('connect', sendRegistration);  // now returns void ✔
};
  }, [socket, auth.user?._id]);   // rerun when user or socket instance changes

  return (
    <SocketRegistrationContext.Provider value={{}}>
      {children}
    </SocketRegistrationContext.Provider>
  );
};
