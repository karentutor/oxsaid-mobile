import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
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
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  const [chatName, setChatName] = useState("");
  const [otherUser, setOtherUser] = useState(null);

  const { auth } = useAuth();
  const route = useRoute();

  // Extract data from route params
  const { initialChatId, initialChatName, initialOtherUser } =
    route.params || {};

  const currentUsername = auth.user.firstName;
  const currentUserId = auth.user._id;

  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!chatId && otherUser && otherUser._id) {
          // Create a new chat if chatId is not available
          const createdChat = await createChat();
          if (createdChat) {
            setChatId(createdChat._id);
            setChatName(createdChat.name);
            fetchChatHistory(createdChat._id); // Fetch history after creating the chat
          } else {
            setLoading(false);
          }
        } else if (chatId) {
          fetchChatHistory(chatId);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    if (initialChatId && initialChatName) {
      setChatId(initialChatId);
      setChatName(initialChatName);
    }

    if (initialOtherUser) {
      setOtherUser(initialOtherUser);
    }

    connectSocket();

    // Register user when socket connects
    socket.emit("registerUser", {
      username: currentUsername,
      userId: currentUserId,
    });

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("privateMessage", (data) => {
      if (data.chatId === chatId) {
        // Update setMessages to avoid duplicate messages
        setMessages((prevMessages) => {
          // Filter out duplicate messages
          const filteredMessages = prevMessages.filter(
            (msg) => msg._id !== data.messageId
          );

          return [
            {
              _id: data.messageId,
              text: data.content,
              from: data.fromName,
              isSentByCurrentUser: data.senderId === currentUserId,
              timestamp: data.timestamp,
              fromAvatar: data.fromAvatar,
            },
            ...filteredMessages,
          ];
        });

        if (!data.isSentByCurrentUser) {
          markMessagesAsRead(currentUserId, chatId);
        }
      }
    });

    socket.on("messageError", (error) => {
      setErrorMessage(error.error);
    });

    socket.on("connect_error", (err) => {
      setConnected(false);
    });

    initializeChat();

    return () => {
      socket.off("connect");
      socket.off("privateMessage");
      socket.off("messageError");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [chatId, otherUser]);

  // Fetch chat history function
  const fetchChatHistory = async (chatId) => {
    try {
      console.log("Fetching chat history for chatId:", chatId);

      const response = await axiosBase.get(`/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });

      console.log("Chat history fetched successfully:", response.data);

      setMessages(
        response.data.messages.map((msg) => ({
          _id: msg._id,
          text: msg.content,
          isSentByCurrentUser: msg.senderId._id === currentUserId,
          from: `${msg.senderId.firstName} ${msg.senderId.lastName}`,
          fromAvatar: msg.senderId.avatar,
          timestamp: msg.createdAt,
        }))
      );

      setLoading(false);
    } catch (error) {
      console.error("Error fetching chat history:", error);

      const errorMsg =
        error.response?.data?.message || "Failed to load chat history.";
      Alert.alert("Error", errorMsg);
      setLoading(false);
    }
  };

  // Mark messages as read function
  const markMessagesAsRead = async (userId, chatId) => {
    try {
      await axiosBase.patch(
        `/chats/${chatId}/messages/read`,
        { userId },
        {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        }
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Create chat function
  const createChat = async () => {
    if (!otherUser || !otherUser._id) {
      Alert.alert("Error", "Cannot create chat without a valid user.");
      return null;
    }

    try {
      const payload = {
        fromId: currentUserId,
        toIds: [otherUser._id],
      };

      const response = await axiosBase.post("/chats", payload, {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });

      if (!response.data || !response.data._id) {
        throw new Error("Invalid chat data received.");
      }

      return response.data;
    } catch (error) {
      console.error("Error creating chat:", error);
      const errorMsg = error.message || "Failed to create chat.";
      Alert.alert("Error", errorMsg);
      return null;
    }
  };

  // Send message function
  const sendMessage = async () => {
    if (inputMessage.trim()) {
      try {
        let currentChatId = chatId;

        if (!currentChatId) {
          const createdChat = await createChat();
          if (createdChat) {
            currentChatId = createdChat._id;
            setChatId(createdChat._id);
            setChatName(createdChat.name);
          } else {
            return; // Failed to create chat
          }
        }

        console.log("Sending message payload:", {
          senderId: currentUserId,
          content: inputMessage.trim(),
        });

        const payload = {
          senderId: currentUserId,
          content: inputMessage.trim(),
        };

        const response = await axiosBase.post(
          `/chats/${currentChatId}/messages`,
          payload,
          {
            headers: { Authorization: `Bearer ${auth.access_token}` },
          }
        );

        if (!response || !response.data) {
          throw new Error("Failed to send message");
        }

        const newMessage = response.data;

        console.log("Message sent successfully:", newMessage);

        // Add message to the chat only if it has a valid _id
        if (newMessage && newMessage._id) {
          setMessages((prevMessages) => {
            const filteredMessages = prevMessages.filter(
              (msg) => msg._id !== newMessage._id
            );

            return [
              {
                _id: newMessage._id,
                text: newMessage.content,
                from: currentUsername,
                isSentByCurrentUser: true,
                timestamp: newMessage.createdAt,
                fromAvatar: auth.user.avatar,
              },
              ...filteredMessages,
            ];
          });
        }

        socket.emit("sendMessage", {
          chatId: currentChatId,
          senderId: currentUserId,
          content: newMessage.content,
          fromName: currentUsername,
          fromAvatar: auth.user.avatar,
          messageId: newMessage._id,
          timestamp: newMessage.createdAt,
        });

        setInputMessage("");
        setErrorMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMsg =
          error.response?.data?.message || "Failed to send message.";
        Alert.alert("Error", errorMsg);
      }
    } else {
      Alert.alert("Error", "Cannot send an empty message.");
    }
  };

  // Delete message function
  const handleDeleteMessage = async (messageId) => {
    if (!chatId) {
      Alert.alert("Error", "Chat ID is missing. Cannot delete the message.");
      return;
    }

    try {
      await axiosBase.delete(`/chats/${chatId}/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
      Alert.alert("Success", "Message deleted successfully.");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Could not delete the message.";
      Alert.alert("Error", errorMsg);
    }
  };

  // Confirm delete message
  const confirmDeleteMessage = (messageId) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteMessage(messageId),
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = useCallback(
    ({ item }) => {
      const messageDate = new Date(item.timestamp);
      const formattedTime = messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const formattedDate = messageDate.toLocaleDateString();

      return (
        <View
          style={[
            tw`mb-4 p-2 rounded-lg`,
            item.isSentByCurrentUser
              ? tw`bg-blue-100 self-end`
              : tw`bg-gray-200 self-start`,
          ]}
        >
          <View style={tw`flex-row items-center`}>
            {!item.isSentByCurrentUser && item.fromAvatar && (
              <Image
                source={{ uri: item.fromAvatar }}
                style={tw`w-6 h-6 rounded-full mr-2`}
              />
            )}
            <View>
              <Text style={tw`text-sm text-gray-500`}>
                {item.isSentByCurrentUser ? "You" : item.from} • {formattedTime}
              </Text>
              <Text style={tw`text-xs text-gray-400`}>{formattedDate}</Text>
              <Text style={tw`text-base text-black mt-1`}>{item.text}</Text>
            </View>
          </View>
          {item.isSentByCurrentUser && chatId && (
            <View style={tw`flex-row justify-end mt-2`}>
              <TouchableOpacity
                onPress={() => confirmDeleteMessage(item._id)}
                style={tw`p-1`}
              >
                <Text style={tw`text-red-500 text-xs`}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    },
    [currentUserId, currentUsername, chatId]
  );

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#0000ff" />
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
              {chatName && (
                <View style={tw`p-4 bg-blue-100`}>
                  <Text style={tw`text-xl font-bold text-center`}>
                    {chatName}
                  </Text>
                </View>
              )}

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
                <FlatList
                  data={messages}
                  keyExtractor={(item) =>
                    item._id ? item._id.toString() : Math.random().toString()
                  }
                  renderItem={renderItem}
                  contentContainerStyle={tw`flex-grow pt-4`}
                  inverted
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={20}
                  maxToRenderPerBatch={20}
                  windowSize={21}
                />
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
