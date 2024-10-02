// screens/ChatListScreen.js

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
            console.log(
              "Chat Data Before Reduce:",
              JSON.stringify(response.data.chats, null, 2)
            );

            const chatsByUser = response.data.chats.reduce((acc, chat) => {
              // Determine if it's a group chat or one-on-one chat
              if (chat.isGroupChat) {
                // Group chat logic
                const chatId = chat._id;
                if (!acc[chatId]) {
                  acc[chatId] = {
                    chatName: chat.chatName || "Unnamed Group", // Group chat name
                    hasUnread: !chat.isReadBy.includes(auth.user._id),
                    latestMessage: chat.message,
                    userIds: chat.recipients
                      .map((recipient) => {
                        if (recipient && recipient._id) {
                          return recipient._id;
                        } else {
                          console.error(
                            "Group Chat: Recipient data is missing or malformed:",
                            recipient
                          );
                          return null;
                        }
                      })
                      .filter(Boolean), // Filter out any null values
                  };
                } else if (!chat.isReadBy.includes(auth.user._id)) {
                  acc[chatId].hasUnread = true;
                }
              } else {
                // One-on-one chat logic
                const otherUser =
                  chat.fromUser && chat.fromUser._id === auth.user._id
                    ? chat.recipients?.[0] // Assuming it's a one-on-one chat, access the first recipient
                    : chat.fromUser;

                if (!otherUser || !otherUser._id) {
                  console.error(
                    "One-on-One Chat: User data is missing or malformed for this chat:",
                    chat
                  );
                  return acc; // Skip if otherUser is missing or malformed
                }

                const userId = otherUser._id;

                if (userId && !acc[userId]) {
                  acc[userId] = {
                    user: otherUser, // One-on-one chat user information
                    hasUnread: !chat.isReadBy.includes(auth.user._id),
                    latestMessage: chat.message,
                  };
                } else if (userId && !chat.isReadBy.includes(auth.user._id)) {
                  acc[userId].hasUnread = true;
                }
              }

              return acc;
            }, {});

            // Log the chatsByUser to verify the transformation
            console.log(
              "Chats by User After Reduce:",
              JSON.stringify(chatsByUser, null, 2)
            );

            const chatList = Object.values(chatsByUser);
            setChatList(chatList);
            setUnreadCount(response.data.unreadCount);
          } else {
            console.log("No chats found for user");
            setChatList([]);
          }
        } catch (error) {
          console.error("Error fetching chat list:", error); // Log any errors during fetching
          setChatList([]);
        }
      };

      fetchChats();
    }, [auth.user._id])
  );

  const handlePress = (chat) => {
    if (chat.user) {
      // One-on-one chat
      const userIds = [chat.user._id];
      const chatName = `${chat.user.firstName || "Unknown"} ${
        chat.user.lastName || "User"
      }`; // Fallback to avoid undefined values
      navigation.navigate("ChatScreen", {
        userIds,
        chatName,
        new: chat.hasUnread,
      });
    } else if (chat.chatName) {
      // Group chat
      const userIds = chat.userIds; // Pass all the user IDs in the group chat
      const chatName = chat.chatName;
      navigation.navigate("ChatScreen", {
        userIds,
        chatName,
        new: chat.hasUnread,
      });
    } else {
      console.error("Chat item is missing necessary data:", chat);
    }
  };

  const handleStartChat = () => {
    navigation.navigate("CreateChatScreen"); // Navigate to CreateChatScreen to start a new chat
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Create New Chat" onPress={handleStartChat} />

      {chatList.length > 0 ? (
        <FlatList
          data={chatList}
          keyExtractor={(item) =>
            item.user
              ? item.user._id.toString()
              : item.chatName || Math.random().toString()
          }
          renderItem={({ item }) => {
            if (!item.user && !item.chatName) {
              console.error("Chat item is missing user and chat name:", item);
              return null; // Skip rendering if data is missing
            }

            const displayName = item.user
              ? `${item.user.firstName} ${item.user.lastName}`
              : item.chatName || "Unknown Chat";

            return (
              <ChatListItem
                displayName={displayName}
                hasUnread={item.hasUnread}
                latestMessage={item.latestMessage}
                onPress={() => handlePress(item)}
              />
            );
          }}
        />
      ) : (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <Text style={{ fontSize: 18, marginBottom: 20 }}>
            No chats found. Would you like to start one?
          </Text>
          <Button
            title="Create a New Chat"
            onPress={() => navigation.navigate("CreateChatScreen")}
          />
        </View>
      )}
    </View>
  );
};

export default ChatListScreen;
