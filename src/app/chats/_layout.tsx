// src/app/chats/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChatsLayout() {
  return (
    <Stack
      screenOptions={({ route, navigation }) => {
        // --- narrow the params type only where we need it
        const params = route.params as { chatId: string } | undefined;
        const router = useRouter();

        return {
          headerStyle:  { backgroundColor: '#0066CC' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: 'bold' },

          /* show the cam icon only on the dynamic [chatId] screen */
          headerRight: () =>
            route.name === '[chatId]' && params?.chatId ? (
              <Pressable
                onPress={() => router.push(`/video/${params.chatId}`)}
                style={{ marginRight: 12 }}
              >
                <Ionicons name="videocam" color="#fff" size={24} />
              </Pressable>
            ) : null,
        };
      }}
    />
  );
}
