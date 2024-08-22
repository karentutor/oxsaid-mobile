import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import axios from "axios";
import io from "socket.io-client";
import { axiosBase } from "../services/BaseService";

const ChatListScreen = ({ navigation, route }) => {
  const { userId } = route.params; // Ensure userId is passed from the navigation route
  const [chats, setChats] = useState([]);
  const socket = io("http://10.0.0.99:8000", {
    path: "/ws/socket.io/",
    transports: ["websocket"],
  });

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axiosBase.get(`/chats/${userId}`);
        setChats(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();

    socket.on("messages-read", () => {
      fetchChats(); // Re-fetch chats when messages are marked as read
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const handleChatPress = (chat) => {
    navigation.navigate("ChatScreen", {
      userId,
      chatId: chat._id,
    });
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const unreadMessages = item.messages.filter(
            (msg) => msg.sender._id !== userId && !msg.isRead
          ).length;

          return (
            <TouchableOpacity onPress={() => handleChatPress(item)}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 10,
                }}
              >
                <Text>
                  Chat with{" "}
                  {item.participants.find((p) => p._id !== userId).firstName}
                </Text>
                {unreadMessages > 0 && (
                  <Text style={{ color: "red" }}>{unreadMessages} Unread</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default ChatListScreen;
