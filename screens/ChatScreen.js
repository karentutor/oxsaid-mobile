import React, { useEffect, useState } from "react";
import {
  Alert,
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
  const [errorMessage, setErrorMessage] = useState(""); //

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
      // console.log("Socket connected", socket.id);
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

    // Listen for message length error
    socket.on("messageError", (error) => {
      setErrorMessage(error.error); // Set error message in state
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
        // console.log("No chat history found, starting a new chat.");
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

      // console.log("Messages marked as read:", response.data);
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
        toIds: [recipientUserId], // Update to send recipient ID as an array
        toName: recipientUsername,
      };

      socket.emit("sendMessage", newMessage);

      setInputMessage("");
      setErrorMessage(""); // Clear error message if any
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axiosBase.delete(`/chats/message/${messageId}`, {
        headers: { Authorization: `Bearer ${auth.access_token}` }, // Corrected the parentheses
      });
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
      Alert.alert("Success", "Message deleted successfully.");
    } catch (error) {
      Alert.alert("Error", "Could not delete the message.");
    }
  };

  const confirmDeleteMessage = (messageId) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteMessage(messageId),
        },
      ],
      { cancelable: true }
    );
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
              {errorMessage ? (
                <View style={tw`p-4 bg-red-100`}>
                  <Text style={tw`text-red-500 font-bold`}>{errorMessage}</Text>
                </View>
              ) : null}
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
                        <View>
                          {/* Meta Info (Sender Name and Time) */}
                          <Text style={tw`text-sm text-gray-500`}>
                            {msg.isSentByCurrentUser ? "You" : msg.from} •{" "}
                            {messageDate.toLocaleTimeString()}
                          </Text>
                          <Text style={tw`text-xs text-gray-400`}>
                            {messageDate.toLocaleDateString()}
                          </Text>
                          {/* Adjust message text to handle wrapping */}
                          <Text
                            style={tw`text-base text-black mt-1 flex-shrink-0`}
                          >
                            {msg.text}
                          </Text>
                        </View>
                        {/* Delete Button: New line, bottom right */}
                        <View style={tw`flex-row justify-end mt-2`}>
                          <TouchableOpacity
                            onPress={() => confirmDeleteMessage(msg._id)}
                            style={tw`p-1`}
                          >
                            <Text style={tw`text-red-500 text-xs`}>Delete</Text>
                          </TouchableOpacity>
                        </View>
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
