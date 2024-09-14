import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import tw from "../lib/tailwind";
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
          timestamp: validateDate(data.timestamp),
        },
        ...prevMessages,
      ]);

      if (!data.isSentByCurrentUser) {
        markMessagesAsRead(currentUserId, recipientUserId);
      }
    });

    socket.on("connect_error", (err) => {
      //console.error("Connection error:", err.message);
      setConnected(false);
    });

    if (recipientUserId) {
      fetchChatHistory();
    } else {
      setMessages([]); // Reset messages if no recipient
    }

    return () => {
      socket.off("connect");
      socket.off("privateMessage");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, []);

  const validateDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? new Date().toISOString()
      : date.toISOString(); // If invalid, return current date
  };

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
            timestamp: validateDate(msg.timestamp),
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
      //console.error("Error fetching chat history:", error);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={tw`flex-1`}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={tw`flex-1 bg-white`}>
          {connected ? (
            <>
              {messages.length === 0 ? (
                <View style={tw`flex-1 items-center justify-center`}>
                  <Text style={tw`text-xl font-bold text-gray-500`}>
                    Start Your Chat Below
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={tw`flex-1`}
                  contentContainerStyle={tw`flex-grow pt-4`}
                  inverted={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {messages.map((msg, index) => {
                    const messageDate = new Date(msg.timestamp);
                    return (
                      <View
                        key={index}
                        style={tw`mb-4 p-2 rounded-lg ${
                          msg.isSentByCurrentUser
                            ? "bg-blue-100 self-end"
                            : "bg-gray-200 self-start"
                        }`}
                      >
                        <Text style={tw`text-sm text-gray-500`}>
                          {msg.isSentByCurrentUser ? "You" : msg.from} •{" "}
                          {messageDate.toLocaleTimeString()} {/* Time */}
                        </Text>
                        <Text style={tw`text-xs text-gray-400`}>
                          {messageDate.toLocaleDateString()}{" "}
                          {/* Date: Month Day, Year */}
                        </Text>
                        <Text style={tw`text-base text-black mt-1`}>
                          {msg.text}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              )}

              <View
                style={tw`flex-row items-center p-4 border-t border-gray-300`}
              >
                <TextInput
                  style={tw`flex-1 border border-gray-300 rounded-full p-2 mr-2 bg-white`}
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
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
    </KeyboardAvoidingView>
  );
}
