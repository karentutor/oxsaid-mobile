/* app/_layout.tsx
 * ------------------------------------------------------------------
 *  Root layout for Expo‑router
 *  ▸ Provider tree (VideoCallProvider always mounted)
 *  ▸ Global <Stack> that adds the blue header to every page
 * ----------------------------------------------------------------- */
import 'expo-router/entry';           // ← keep this first
import { Stack } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import { LogBox, Pressable, Text, NativeModules } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

import { AuthContextProvider, AuthContext }  from '@/context/AuthContext';
import { SocketProvider }                    from '@/context/SocketContext';
import { SocketRegistrationProvider }        from '@/context/SocketRegistrationProvider';
import { VideoCallProvider }                 from '@/context/VideoCallContext';
import { ChatProvider }                      from '@/context/ChatContext';
import { RealTimeContextProvider }           from '@/context/RealTimeContext';

import HeaderMenu from '@/components/HeaderMenu';
import Toast from 'react-native-toast-message';

import { ensureCallKeep } from '@/utils/callkeep';   // ← add this

LogBox.ignoreAllLogs();      // dev‑only — remove for production

/* ------------ tiny header helpers ------------ */
function LeftMenu() {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <HeaderMenu /> : null;
}

function LogoutButton() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  if (!isAuthenticated) return null;
  return (
    <Pressable
      onPress={logout}
      style={{ marginRight: 16, padding: 4 }}
    >
      <Text style={{ color: '#FFF', fontSize: 16 }}>Logout</Text>
    </Pressable>
  );
}

/* ------------ exported root layout ------------ */
export default function RootLayout() {
  useEffect(() => {
    // 1) sanity‑check native modules
    console.log('💡 InCallManager:', NativeModules.InCallManager);
    console.log('💡 WebRTCModule:',   NativeModules.WebRTCModule);
    console.log(
      '🔍 InCallManager keys:',
      Object.keys(NativeModules.InCallManager)
    );
    console.log(
      'InCallManager methods:',
      Object.getOwnPropertyNames(NativeModules.InCallManager.__proto__)
        .filter(name => typeof NativeModules.InCallManager[name] === 'function')
    );

    // 2) initialize CallKeep once at startup
    ensureCallKeep();
  }, []);

  return (
    <PaperProvider>
      <AuthContextProvider>
        <SocketProvider>
          <SocketRegistrationProvider>
            <VideoCallProvider>
              <ChatProvider>
                <RealTimeContextProvider>

                  {/* Global navigator – expo‑router will inject pages */}
                  <Stack
                    screenOptions={{
                      headerStyle: { backgroundColor: '#0066CC' },
                      headerTintColor: '#FFF',
                      headerLeft:  () => <LeftMenu />,
                      headerRight: () => <LogoutButton />,
                    }}
                  />

                </RealTimeContextProvider>
              </ChatProvider>
            </VideoCallProvider>
          </SocketRegistrationProvider>
        </SocketProvider>
      </AuthContextProvider>

      <Toast />
    </PaperProvider>
  );
}
