// ChatListScreen.js

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { axiosBase } from "../services/BaseService";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import tw from "twrnc"; // Using Tailwind for styling

const ChatListScreen = () => {
  const { auth } = useAuth();
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Fetch chats when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchChats = async () => {
        setLoading(true);
        try {
          // Log the user ID being used
          console.log("Fetching chats for user ID:", auth.user._id);

          const response = await axiosBase.get(`/chats/${auth.user._id}`, {
            headers: { Authorization: `Bearer ${auth.access_token}` },
          });

          console.log("Fetched Chats Response:", response.data); // Debugging

          if (response.data && Array.isArray(response.data.chats)) {
            setChatList(response.data.chats);
            console.log(
              `Setting chat list with ${response.data.chats.length} chats`
            );
          } else {
            console.warn("No chats found for user or invalid data format.");
            setChatList([]);
          }
        } catch (error) {
          console.error("Error fetching chat list:", error);
          Alert.alert(
            "Error",
            "There was an error fetching your chats. Please try again later."
          );
          setChatList([]);
        } finally {
          setLoading(false);
        }
      };

      fetchChats();
    }, [auth.user._id, auth.access_token]) // Added auth.access_token as dependency
  );

  // Handle navigation to ChatScreen
  const handlePress = (chat) => {
    navigation.navigate("ChatScreen", {
      initialChatId: chat._id,
      initialChatName: chat.name, // Use chat.name directly
    });
  };

  // Navigate to CreateChatScreen
  const handleStartChat = () => {
    navigation.navigate("CreateChatScreen");
  };

  // Render each chat item
  const renderItem = ({ item }) => {
    // Debugging: Check if chat.name exists
    if (!item.name) {
      console.error("Chat item is missing the 'name' field:", item);
      return null;
    }

    const displayName = item.name; // Use chat.name directly
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity onPress={() => handlePress(item)}>
        <View
          style={tw`flex-row items-center justify-between p-4 border-b border-gray-200`}
        >
          <View style={tw`flex-row items-center`}>
            {/* Optional: Display participant avatars or initials */}
            {/* <Image source={{ uri: item.avatar }} style={tw`w-10 h-10 rounded-full mr-4`} /> */}
            <Text style={tw`text-lg`}>{displayName}</Text>
          </View>
          <View
            style={[
              tw`w-3 h-3 rounded-full`,
              hasUnread ? tw`bg-red-500` : tw`bg-green-500`,
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Show loading indicator while fetching chats
  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={tw`mt-2 text-gray-500`}>Loading Chats...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 p-5 bg-white`}>
      <Button title="Create New Chat" onPress={handleStartChat} />

      {chatList.length > 0 ? (
        <FlatList
          data={chatList}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderItem}
          contentContainerStyle={tw`mt-4`}
        />
      ) : (
        <View style={tw`flex-1 items-center justify-center mt-10`}>
          <Text style={tw`text-lg text-gray-500 mb-4`}>
            No chats found. Would you like to start one?
          </Text>
          <Button title="Create a New Chat" onPress={handleStartChat} />
        </View>
      )}
    </View>
  );
};

export default ChatListScreen;
