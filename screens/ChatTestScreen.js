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

export default function ChatTestScreen() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]); // State to store chat messages
  const [inputMessage, setInputMessage] = useState(""); // State for the input message

  const route = useRoute(); // Access route parameters
  const user = route.params?.user; // Safely get the user data from route parameters
  const currentUsername = user.firstName; // Replace this with the actual username of the logged-in user
  const currentUserId = user._id; // Replace this with the actual user ID of the logged-in user

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

    // Listen for incoming messages from the server
    socket.on("broadcastMessage", (data) => {
      console.log("Received message from server:", data);
      setMessages((prevMessages) => [
        {
          text: data.message,
          from: data.from,
          isSentByCurrentUser: data.from === currentUsername,
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
      socket.off("broadcastMessage");
      socket.off("connect_error");
      socket.disconnect(); // Disconnect socket when component unmounts
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        message: inputMessage,
        from: currentUsername,
      };

      // Emit message to the server to broadcast to everyone
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

  if (!user) {
    // Early return if user is undefined
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
