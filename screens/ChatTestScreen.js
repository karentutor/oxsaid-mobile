import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import socket from "../services/socket";
import tw from "twrnc";

function ChatTestScreen() {
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("user joined", (msg) => {
      console.log("user joined message", msg);
    });

    socket.on("message", (message) => {
      setMessages((previousMessages) => [...previousMessages, message]);
    });

    return () => {
      socket.off("user joined");
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    socket.on("users", (users) => {
      console.log("Updated users list:", users); // Log the updated users list
      setUsers(users);
    });

    return () => {
      socket.off("users");
    };
  }, []);

  const handleUserName = () => {
    console.log(username);
    socket.emit("username", username);
    setConnected(true);
  };

  const handleMessage = () => {
    socket.emit("message", `${username} - ${message}`);
    setMessage("");
  };

  return (
    <View style={tw`flex-1 p-5 bg-gray-100`}>
      {connected ? (
        <View style={tw`flex-row mb-5`}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message"
            style={tw`flex-1 border border-gray-300 p-2 rounded mr-2`}
          />
          <TouchableOpacity
            onPress={handleMessage}
            style={tw`bg-blue-500 p-2 rounded`}
          >
            <Text style={tw`text-white text-center`}>Send</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={tw`flex-row mb-5`}>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your name"
            style={tw`flex-1 border border-gray-300 p-2 rounded mr-2`}
          />
          <TouchableOpacity
            onPress={handleUserName}
            style={tw`bg-blue-500 p-2 rounded`}
          >
            <Text style={tw`text-white text-center`}>Join</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={tw`flex-row`}>
        {/* Messages on the left */}
        <View style={tw`flex-3`}>
          <FlatList
            data={messages}
            renderItem={({ item }) => (
              <View style={tw`bg-gray-300 p-3 rounded mb-3`}>
                <Text style={tw`text-sm text-left`}>{item}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>

        {/* Users on the right */}
        <View style={tw`flex-1 ml-3`}>
          <FlatList
            data={users}
            renderItem={({ item }) => (
              <View style={tw`p-3 rounded mb-3`}>
                <Text style={tw`text-sm text-right text-blue-500`}>{item}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </View>
    </View>
  );
}

export default ChatTestScreen;
