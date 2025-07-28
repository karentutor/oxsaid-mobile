import React, { useContext } from 'react';
import { Stack } from 'expo-router';
import { Pressable, Text, LogBox, Platform } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthContextProvider, AuthContext } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { SocketRegistrationProvider } from '@/context/SocketRegistrationProvider';
import { RealTimeContextProvider } from '@/context/RealTimeContext';
import { ChatProvider } from '@/context/ChatContext';
import { VideoCallProvider } from '@/context/VideoCallContext';
import Toast from 'react-native-toast-message';
import HeaderMenu from '@/components/HeaderMenu';

LogBox.ignoreAllLogs();

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthContextProvider>
        <SocketProvider>
          <SocketRegistrationProvider>
            <RealTimeContextProvider>
              <ChatProvider>
                <VideoCallProvider>
                  <RootStack />
   
                </VideoCallProvider>
              </ChatProvider>
            </RealTimeContextProvider>
          </SocketRegistrationProvider>
        </SocketProvider>
      </AuthContextProvider>
                     <Toast />
    </PaperProvider>
  );
}

function RootStack() {
  const { isAuthenticated, logout } = useContext(AuthContext);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0066CC' },
        headerTintColor: '#FFF',
        headerLeft: () => (isAuthenticated ? <HeaderMenu /> : null),
        headerRight: () =>
          isAuthenticated ? (
            <Pressable
              onPress={async () => await logout()}
              style={{ marginRight: 16, padding: 4 }}
            >
              <Text style={{ color: '#FFF', fontSize: 16 }}>Logout</Text>
            </Pressable>
          ) : null,
      }}
    />
  );
}
