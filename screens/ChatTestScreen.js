import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import tw from "twrnc"; // Tailwind CSS for React Native
import socket, { connectSocket } from "../services/socket"; // Import the socket and connect function
import { useRoute } from "@react-navigation/native"; // Import useRoute to access navigation parameters
import useAuth from "../hooks/useAuth"; // Import useAuth hook for current user

export default function ChatTestScreen() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]); // State to store chat messages
  const [inputMessage, setInputMessage] = useState(""); // State for the input message

  const { auth } = useAuth(); // Get the current user from useAuth hook
  const route = useRoute(); // Access route parameters
  const recipientUser = route.params?.user; // Safely get the recipient user data from route parameters

  const currentUsername = auth.user.firstName; // Current user's first name
  const currentUserId = auth.user._id; // Current user's ID
  const recipientUsername = recipientUser.firstName; // Recipient's first name
  const recipientUserId = recipientUser._id; // Recipient's ID

  useEffect(() => {
    console.log("Attempting to connect socket..."); // Debugging log
    // Connect to the socket when the component mounts
    connectSocket();

    // Register user with the server
    socket.emit("registerUser", {
      username: currentUsername,
      userId: currentUserId,
    });

    // Listen for connection events
    socket.on("connect", () => {
      console.log("Socket connected", socket.id);
      setConnected(true);
    });

    // Listen for incoming private messages from the server
    socket.on("privateMessage", (data) => {
      console.log("Received private message from server:", data);
      setMessages((prevMessages) => [
        {
          text: data.message,
          from: data.fromName,
          isSentByCurrentUser: data.fromId === currentUserId,
        },
        ...prevMessages,
      ]); // Add new message at the top
    });

    // Handle connection errors
    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      setConnected(false); // Set connected to false if there's an error
    });

    // Clean up the event listeners on component unmount
    return () => {
      console.log("Cleaning up socket events..."); // Debugging log
      socket.off("connect");
      socket.off("privateMessage");
      socket.off("connect_error");
      socket.disconnect(); // Disconnect socket when component unmounts
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() && recipientUserId) {
      const newMessage = {
        message: inputMessage,
        fromName: currentUsername, // Sender's first name
        fromId: currentUserId, // Sender's ID
        toId: recipientUserId, // Recipient's ID
        toName: recipientUsername, // Recipient's first name (optional for display purposes)
      };

      // Emit message to the server to send to the specific user
      socket.emit("sendMessage", newMessage);

      // Add the sent message locally with the sender's name
      setMessages((prevMessages) => [
        {
          text: inputMessage,
          from: currentUsername,
          isSentByCurrentUser: true,
        },
        ...prevMessages,
      ]);

      // Clear the input field
      setInputMessage("");
    }
  };

  if (!auth.user || !recipientUser) {
    // Early return if auth user or recipientUser is undefined
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <Text style={tw`text-2xl font-bold text-red-500`}>
          User data is missing. Please go back and try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      {connected ? (
        <>
          {/* Messages ScrollView */}
          <ScrollView
            style={tw`flex-1`}
            contentContainerStyle={tw`flex-grow`}
            inverted={true} // Display most recent messages at the top
          >
            {messages.map((msg, index) => (
              <View key={index} style={tw`p-2 border-b border-gray-200`}>
                <Text style={tw`text-base font-bold text-black`}>
                  {msg.isSentByCurrentUser ? "You" : msg.from}:
                </Text>
                <Text style={tw`text-base text-black`}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Input Box and Send Button at Bottom */}
          <View style={tw`flex-row items-center p-4 border-t border-gray-300`}>
            <TextInput
              style={tw`flex-1 border rounded-full p-2 mr-2`}
              placeholder="Type your message..."
              value={inputMessage}
              onChangeText={setInputMessage}
            />
            <TouchableOpacity onPress={sendMessage} style={tw`p-2`}>
              <Text style={tw`text-xl text-blue-500`}>➡️</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-2xl font-bold text-red-500`}>Connecting...</Text>
        </View>
      )}
    </View>
  );
}
