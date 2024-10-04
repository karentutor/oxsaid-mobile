// screens/ChatScreen.js

import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from "react-native";
import tw from "../lib/tailwind";
import socket, { connectSocket } from "../services/socket";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import { axiosBase } from "../services/BaseService";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";

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
  const { initialChatId, initialChatName, initialOtherUser, groupId } =
    route.params || {};

  const currentUsername = auth.user.firstName;
  const currentUserId = auth.user._id;

  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (initialChatId && initialChatName && !chatId) {
          // Set existing chat
          setChatId(initialChatId);
          setChatName(initialChatName);
          await fetchChatHistory(initialChatId);
          return;
        }

        if (groupId && !chatId) {
          console.log("Initializing group chat with groupId:", groupId);

          // Create or retrieve an existing group chat
          const response = await axiosBase.post(
            "/chats/group-chat",
            { groupId, initialMessage: "Welcome to the group chat!" },
            {
              headers: { Authorization: `Bearer ${auth.access_token}` },
            }
          );

          if (response.data) {
            setChatId(response.data._id);
            setChatName(response.data.name);
            await fetchChatHistory(response.data._id);
          }
        } else if (!chatId && initialOtherUser && initialOtherUser._id) {
          console.log(
            "Initializing private chat with otherUser:",
            initialOtherUser
          );

          // Create a new private chat if chatId is not available
          const createdChat = await createChat();
          if (createdChat) {
            setChatId(createdChat._id);
            setChatName(createdChat.name);
            await fetchChatHistory(createdChat._id);
          } else {
            setLoading(false);
          }
        } else if (chatId) {
          console.log("Fetching existing chat history with chatId:", chatId);
          await fetchChatHistory(chatId);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        Alert.alert("Error", `Failed to initialize chat: ${error.message}`);
      }
    };

    // Set otherUser if provided
    if (initialOtherUser) {
      setOtherUser(initialOtherUser);
    }

    // Connect to Socket.io
    connectSocket();

    // Setup Socket.io event listeners
    socket.on("connect", () => {
      setConnected(true);

      // Register user when socket connects
      socket.emit("registerUser", {
        username: currentUsername,
        userId: currentUserId,
      });

      // Register privateMessage handler
      socket.on("privateMessage", (data) => {
        console.log("Received privateMessage:", data); // Debugging

        // Ensure data contains the necessary fields
        if (
          !data.chatId ||
          !data._id ||
          typeof data.isSentByCurrentUser !== "boolean"
        ) {
          console.warn("Received incomplete privateMessage data:", data);
          return;
        }

        if (data.chatId === chatId) {
          if (!data.isSentByCurrentUser) {
            // Only handle messages from others
            setMessages((prevMessages) => {
              // Check if the message already exists to prevent duplication
              const messageExists = prevMessages.some(
                (msg) => msg._id === data._id
              );

              if (messageExists) {
                console.log("Message already exists, skipping:", data._id);
                return prevMessages;
              }

              return [
                {
                  _id: data._id,
                  text: data.content,
                  from: data.fromName,
                  isSentByCurrentUser: false,
                  timestamp: data.createdAt,
                  fromAvatar: data.fromAvatar,
                },
                ...prevMessages,
              ];
            });

            console.log("Marking messages as read for chatId:", chatId);
            if (connected && chatId) {
              console.log("ChatScreen, calling markMessagesAsRead");
              markMessagesAsRead(chatId);
            }
          }
        }
      });

      // Register groupMessage handler
      socket.on("groupMessage", (data) => {
        console.log("Received groupMessage:", data); // Debugging

        // Ensure data contains the necessary fields
        if (!data.chatId || !data._id) {
          console.warn("Received incomplete groupMessage data:", data);
          return;
        }

        if (data.chatId === chatId) {
          setMessages((prevMessages) => {
            // Check if the message already exists to prevent duplication
            const messageExists = prevMessages.some(
              (msg) => msg._id === data._id
            );
            if (messageExists) {
              console.log("Message already exists, skipping:", data._id);
              return prevMessages;
            }

            return [
              {
                _id: data._id,
                text: data.content,
                from: data.from,
                isSentByCurrentUser: data.senderId === currentUserId,
                timestamp: data.timestamp,
              },
              ...prevMessages,
            ];
          });
        }
      });
    });

    socket.on("messageError", (error) => {
      setErrorMessage(error.error);
    });

    socket.on("connect_error", (err) => {
      setConnected(false);
    });

    // Initialize the chat
    initializeChat();

    // Cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("privateMessage");
      socket.off("groupMessage");
      socket.off("messageError");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [
    chatId,
    otherUser,
    groupId,
    connected,
    currentUsername,
    currentUserId,
    initialChatId,
    initialChatName,
    initialOtherUser,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (chatId) {
        fetchChatHistory(chatId); // Refetch chat history every time the screen is focused
      }
    }, [chatId])
  );

  // Fetch chat history function
  const fetchChatHistory = async (chatId) => {
    try {
      console.log("Fetching chat history for chatId:", chatId);

      if (!chatId) {
        console.warn("Invalid chatId, aborting fetchChatHistory");
        return;
      }

      const response = await axiosBase.get(`/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });

      console.log("Chat history fetched successfully:", response.data);

      if (response.data && Array.isArray(response.data.messages)) {
        setMessages(
          response.data.messages.map((msg) => ({
            _id: msg._id,
            text: msg.content,
            from:
              msg.senderId._id === currentUserId
                ? chatName
                : `${msg.senderId.firstName} ${msg.senderId.lastName}`,
            isSentByCurrentUser: msg.senderId._id === currentUserId,
            fromAvatar:
              msg.senderId._id === currentUserId
                ? auth.user.avatar
                : msg.senderId.avatar,
            timestamp: msg.createdAt,
          }))
        );

        // Log before marking messages as read
        console.log("About to mark messages as read for chatId:", chatId);
        await markMessagesAsRead(chatId);
      } else {
        console.warn("Unexpected response format:", response.data);
      }

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
  const markMessagesAsRead = async (chatId) => {
    try {
      console.log(
        "MarkMessagesAsRead: Sending PATCH request for chatId:",
        chatId
      );
      const response = await axiosBase.patch(
        `/chats/${chatId}/messages/read`,
        {}, // No body data needed
        { headers: { Authorization: `Bearer ${auth.access_token}` } }
      );
      console.log(
        "Messages marked as read for chatId:",
        chatId,
        "Response:",
        response.data
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Create a new chat function
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

      const chatData = response.data;

      if (!chatData || !chatData._id) {
        throw new Error("Invalid chat data received.");
      }

      chatData.name = `${otherUser.firstName} ${otherUser.lastName}`;

      return chatData;
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
          setMessages((prevMessages) => [
            {
              _id: newMessage._id,
              text: newMessage.content,
              from: chatName,
              isSentByCurrentUser: true,
              timestamp: newMessage.createdAt,
              fromAvatar: auth.user.avatar,
            },
            ...prevMessages.filter((msg) => msg._id !== newMessage._id),
          ]);
        }

        socket.emit("sendMessage", {
          chatId: currentChatId,
          senderId: currentUserId,
          content: newMessage.content,
          fromName: currentUsername,
          fromAvatar: auth.user.avatar,
          _id: newMessage._id,
          createdAt: newMessage.createdAt,
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
              {chatName && <ChatHeader chatName={chatName} />}

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
                <MessageList
                  messages={messages}
                  confirmDeleteMessage={confirmDeleteMessage}
                />
              )}

              <MessageInput
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                sendMessage={sendMessage}
              />
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
