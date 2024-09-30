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
            console.log("Chat Data Before Reduce:", response.data.chats);

            const chatsByUser = response.data.chats.reduce((acc, chat) => {
              // Determine who the other user is
              const otherUser =
                chat.fromUser._id === auth.user._id
                  ? chat.recipients[0] // Assuming it's a one-on-one chat, use the first recipient
                  : chat.fromUser;

              console.log("Other User Found:", otherUser);

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
                  hasUnread: !chat.isReadBy.includes(auth.user._id),
                  latestMessage: chat.message, // Access the message here
                };
              } else if (userId && !chat.isReadBy.includes(auth.user._id)) {
                acc[userId].hasUnread = true;
              }

              return acc;
            }, {});

            const chatList = Object.values(chatsByUser);
            setChatList(chatList);
            setUnreadCount(response.data.unreadCount);
          } else {
            setChatList([]);
          }
        } catch (error) {
          // console.log("Error fetching chat list:", error); // Log any errors during fetching
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
      <Button
        title="Create Chat"
        onPress={() => navigation.navigate("CreateChatScreen")}
      />

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
            title="Create a New Chat"
            onPress={() => navigation.navigate("CreateChatScreen")}
          />
        </View>
      )}
    </View>
  );
};

export default ChatListScreen;
