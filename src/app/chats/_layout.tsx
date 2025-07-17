// src/app/chats/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function ChatsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0066CC' },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  );
}
