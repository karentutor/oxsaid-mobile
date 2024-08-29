import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import tw from "twrnc";
import socket, { connectSocket } from "../services/socket";
import { useRoute } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import { axiosBase } from "../services/BaseService";

export default function ChatScreen() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const { auth } = useAuth();
  const route = useRoute();
  const recipientUser = route.params?.user;
  const hasNewMessages = route.params?.new;

  const currentUsername = auth.user.firstName;
  const currentUserId = auth.user._id;
  const recipientUsername = recipientUser?.firstName;
  const recipientUserId = recipientUser?._id;

  useEffect(() => {
    connectSocket();

    socket.emit("registerUser", {
      username: currentUsername,
      userId: currentUserId,
    });

    socket.on("connect", () => {
      console.log("Socket connected", socket.id);
      setConnected(true);
    });

    socket.on("privateMessage", (data) => {
      setMessages((prevMessages) => [
        {
          text: data.message,
          from: data.fromName,
          isSentByCurrentUser: data.isSentByCurrentUser,
          _id: data._id,
        },
        ...prevMessages,
      ]);

      if (!data.isSentByCurrentUser) {
        markMessagesAsRead(currentUserId, recipientUserId);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      setConnected(false);
    });

    if (recipientUserId) {
      fetchChatHistory();
    }

    return () => {
      socket.off("connect");
      socket.off("privateMessage");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await axiosBase.get(
        `/chats/history/${currentUserId}/${recipientUserId}`
      );

      if (response.data && response.data.length > 0) {
        setMessages(
          response.data.map((msg) => ({
            text: msg.message,
            from: msg.fromId.firstName,
            isSentByCurrentUser: msg.fromId._id === currentUserId,
            _id: msg._id,
          }))
        );

        if (hasNewMessages) {
          markMessagesAsRead(currentUserId, recipientUserId);
        }
      } else {
        console.log("No chat history found, starting a new chat.");
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const markMessagesAsRead = async (userId, otherUserId) => {
    try {
      const response = await axiosBase.post("/chats/mark-p-messages-as-read", {
        userId,
        otherUserId,
      });

      console.log("Messages marked as read:", response.data);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() && recipientUserId) {
      const newMessage = {
        message: inputMessage,
        fromName: currentUsername,
        fromId: currentUserId,
        toId: recipientUserId,
        toName: recipientUsername,
      };

      socket.emit("sendMessage", newMessage);

      // No need to add message to state here, rely on server response
      setInputMessage("");
    }
  };

  if (!auth.user || !recipientUser) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <Text style={tw`text-2xl font-bold text-red-500`}>
          User data is missing. Please go back and try again.
        </Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={tw`flex-1 bg-white`}>
        {connected ? (
          <>
            {messages.length === 0 ? (
              // Display message when no chat history exists
              <View style={tw`flex-1 items-center justify-center`}>
                <Text style={tw`text-xl font-bold text-gray-500`}>
                  Start Your Chat
                </Text>
              </View>
            ) : (
              // Display chat history
              <ScrollView
                style={tw`flex-1`}
                contentContainerStyle={tw`flex-grow`}
                inverted={true}
                keyboardShouldPersistTaps="handled"
              >
                {messages.map((msg, index) => (
                  <View
                    key={index}
                    style={tw`p-2 border-b border-gray-200 ${
                      msg.isSentByCurrentUser ? "items-end" : "items-start"
                    }`}
                  >
                    <Text
                      style={tw`text-base font-bold text-black ${
                        msg.isSentByCurrentUser ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.isSentByCurrentUser ? "You" : msg.from}:
                    </Text>
                    <Text
                      style={tw`text-base text-black ${
                        msg.isSentByCurrentUser ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.text}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <View
              style={tw`flex-row items-center p-4 border-t border-gray-300`}
            >
              <TextInput
                style={tw`flex-1 border rounded-full p-2 mr-2`}
                placeholder="Type your message..."
                value={inputMessage}
                onChangeText={setInputMessage}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              <TouchableOpacity onPress={sendMessage} style={tw`p-2`}>
                <Text style={tw`text-xl text-blue-500`}>➡️</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={tw`flex-1 items-center justify-center`}>
            <Text style={tw`text-2xl font-bold text-red-500`}>
              Connecting...
            </Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}
