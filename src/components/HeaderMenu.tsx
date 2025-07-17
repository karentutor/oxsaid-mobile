import React, { useState, useContext } from 'react';
import { View } from 'react-native';
import { Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';

export default function HeaderMenu() {
  const router = useRouter();
  const { auth } = useContext(AuthContext);

  const [visible, setVisible] = useState(false);
  const open   = () => setVisible(true);
  const close  = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={close}
      anchor={
        <Ionicons
          name="menu"
          size={24}
          color="#FFF"
          style={{ marginLeft: 16 }}
          onPress={open}
        />
      }
    >
      <Menu.Item
        onPress={() => {
          close();
          router.push('/');
        }}
        title="Home"
      />
      <Menu.Item
        onPress={() => {
          close();
          router.push('/chats');
        }}
        title="Chats"
      />
            <Menu.Item
        onPress={() => {
          close();
          router.push(`/users/search`);
        }}
        title="User Search"
      />
      <Menu.Item
        onPress={() => {
          close();
          router.push(`/users/${auth.user!._id}`);
        }}
        title="My Profile"
      />
    </Menu>
  );
}
