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

          console.log("Full API Response:", response.data); // Log the full response

          if (response.data && response.data.chats.length > 0) {
            const chatsByUser = response.data.chats.reduce((acc, chat) => {
              // Manually attach user IDs to fromUser and toUser
              chat.fromUser._id = chat.latestMessage.fromId; // Attach fromId to fromUser
              chat.toUser._id = chat.latestMessage.toId; // Attach toId to toUser

              const otherUser =
                chat.latestMessage.fromId === auth.user._id
                  ? chat.toUser
                  : chat.fromUser;

              console.log("Other User:", otherUser); // Log the other user to inspect its structure

              if (!otherUser || !otherUser._id) {
                console.error(
                  "Error: User data is missing or malformed for this chat:",
                  chat
                );
                return acc; // Skip if otherUser is missing or malformed
              }

              const userId = otherUser._id;

              if (userId && !acc[userId]) {
                acc[userId] = {
                  user: otherUser, // Now populated with firstName, lastName, and _id
                  hasUnread: !chat.latestMessage.isRead,
                  latestMessage: chat.latestMessage.message, // Access the message here
                };
              } else if (userId && !chat.latestMessage.isRead) {
                acc[userId].hasUnread = true;
              }

              return acc;
            }, {});

            console.log("Chats by User after reduce:", chatsByUser); // Log the reduced chat data

            const chatList = Object.values(chatsByUser);
            setChatList(chatList);
            setUnreadCount(response.data.unreadCount);
          } else {
            console.log("No chats found for this user.");
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
          keyExtractor={(item) =>
            item.user && item.user._id
              ? item.user._id.toString()
              : Math.random().toString()
          }
          renderItem={({ item }) => (
            <ChatListItem
              user={item.user}
              hasUnread={item.hasUnread}
              latestMessage={item.latestMessage} // Correctly pass the latest message to the item
              onPress={() => handlePress(item.user, item.hasUnread)}
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
          <Button
            title="Start a New Chat"
            onPress={() => navigation.navigate("User Search")}
          />
        </View>
      )}
    </View>
  );
};

export default ChatListScreen;
