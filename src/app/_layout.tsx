// src/app/_layout.tsx
import React, { useContext } from 'react';
import { Stack } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { AuthContextProvider, AuthContext } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { SocketRegistrationProvider } from '@/context/SocketRegistrationProvider';
import { RealTimeContextProvider } from '@/context/RealTimeContext';
import { ChatProvider } from '@/context/ChatContext';
import Toast from 'react-native-toast-message';
import HeaderMenu from '@/components/HeaderMenu';

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthContextProvider>
        <SocketProvider>
          <SocketRegistrationProvider>
            <RealTimeContextProvider>
                <ChatProvider>          
                <RootStack />
                <Toast />
              </ChatProvider>         
            </RealTimeContextProvider>
          </SocketRegistrationProvider>
        </SocketProvider>
      </AuthContextProvider>
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
        headerLeft: () =>
          isAuthenticated ? <HeaderMenu /> : null,          // ← NEW
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
