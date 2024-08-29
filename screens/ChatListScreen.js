import React, { useState, useCallback } from "react";
import { FlatList } from "react-native";
import { axiosBase } from "../services/BaseService";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import ChatListItem from "../components/ui/ChatListItem";

const ChatListScreen = () => {
  const { auth } = useAuth();
  const [chatList, setChatList] = useState([]);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const fetchChats = async () => {
        try {
          const response = await axiosBase.get(`/chats/${auth.user._id}`);

          if (response.data && response.data.length > 0) {
            const chatsByUser = response.data.reduce((acc, chat) => {
              const otherUser =
                chat.fromId._id === auth.user._id ? chat.toId : chat.fromId;
              const userId = otherUser._id;

              if (!acc[userId]) {
                acc[userId] = {
                  user: otherUser,
                  hasUnread: !chat.isRead, // Check if there is any unread message
                };
              } else if (!chat.isRead) {
                acc[userId].hasUnread = true;
              }

              return acc;
            }, {});

            setChatList(Object.values(chatsByUser));
          } else {
            console.log("No chats found for this user.");
            setChatList([]);
          }
        } catch (error) {
          console.error("Error fetching chat list:", error);
        }
      };

      fetchChats();
    }, [auth.user._id])
  );

  const handlePress = (user, hasUnread) => {
    navigation.navigate("ChatScreen", { user, new: hasUnread }); // Pass unread status
  };

  return (
    <FlatList
      data={chatList}
      keyExtractor={(item) => item.user._id.toString()}
      renderItem={({ item }) => (
        <ChatListItem
          user={item.user}
          hasUnread={item.hasUnread}
          onPress={handlePress} // Pass the user and unread status
        />
      )}
    />
  );
};

export default ChatListScreen;
