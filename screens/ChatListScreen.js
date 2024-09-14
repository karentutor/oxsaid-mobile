import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Button } from "react-native";
import { axiosBase } from "../services/BaseService";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import ChatListItem from "../components/ui/ChatListItem";

const ChatListScreen = () => {
  const { auth } = useAuth();
  const [chatList, setChatList] = useState([]);
  const navigation = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0); // Store the unread message count

  useFocusEffect(
    useCallback(() => {
      const fetchChats = async () => {
        try {
          const response = await axiosBase.get(`/chats/${auth.user._id}`);

          if (response.data && response.data.chats.length > 0) {
            const chatsByUser = response.data.chats.reduce((acc, chat) => {
              const otherUser =
                chat.fromId._id === auth.user._id ? chat.toId : chat.fromId;
              const userId = otherUser._id;

              if (!acc[userId]) {
                acc[userId] = {
                  user: otherUser,
                  hasUnread: !chat.isRead, // Check if the chat has unread messages
                };
              } else if (!chat.isRead) {
                acc[userId].hasUnread = true;
              }

              return acc;
            }, {});

            const chatList = Object.values(chatsByUser);
            setChatList(chatList);

            // Update unread message count directly from the response
            const unreadCount = response.data.unreadCount;
            setUnreadCount(unreadCount); // Update the unread count
          } else {
            console.log("No chats found for this user.");
            setChatList([]);
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            // Line 34
            console.log("No chats available for this user."); // Line 35
            setChatList([]); // Line 36
            setUnreadCount(0); // Line 37
          } else {
            console.error("Error fetching chat list:", error); // Line 39
            setChatList([]); // Line 40
          }
        }
      };

      fetchChats();
    }, [auth.user._id])
  );

  const handlePress = (user, hasUnread) => {
    navigation.navigate("ChatScreen", { user, new: hasUnread }); // Pass unread status
  };

  const handleStartChat = () => {
    navigation.navigate("User Search"); // Navigate to UserSearchScreen to start a new chat
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {chatList.length > 0 ? (
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
      ) : (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <Text style={{ fontSize: 18, marginBottom: 20 }}>
            No chats found. Would you like to start one?
          </Text>
          <Button title="Start a New Chat" onPress={handleStartChat} />
        </View>
      )}
    </View>
  );
};

export default ChatListScreen;
