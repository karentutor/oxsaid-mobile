import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, Button } from "react-native";
import io from "socket.io-client";
import { axiosBase } from "../services/BaseService";

const ChatScreen = ({ route }) => {
  const { userId, chatId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const socket = io("http://10.0.0.99:8000", {
    path: "/ws/socket.io/",
    transports: ["websocket"],
  });

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axiosBase.get(`/chats/${chatId}/messages`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    socket.emit("user-join-room", { roomId: chatId });

    socket.on("receive-message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data.newMessage]);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId]);

  const handleSendMessage = async () => {
    try {
      const messageData = {
        chatId: chatId,
        senderId: userId,
        content: newMessage,
      };

      // Emit message through socket
      socket.emit("user-send-message", messageData);

      // Send message to the backend
      await axiosBase.post(`/chats/${chatId}/messages`, messageData);

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Define handleMarkAsRead function
  const handleMarkAsRead = () => {
    try {
      socket.emit("mark-as-read", { conversationId: chatId, userId });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text>{`${item.sender.firstName}: ${item.content}`}</Text>
        )}
        onEndReached={handleMarkAsRead}
      />
      <TextInput
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={handleSendMessage} />
    </View>
  );
};

export default ChatScreen;
