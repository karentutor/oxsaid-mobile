// CreateChatScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { axiosBase } from "../services/BaseService";
import useAuth from "../hooks/useAuth";
import FilterModal from "../components/ui/FilterModal"; // Ensure this component exists and functions correctly
import tw from "twrnc"; // Using Tailwind for styling

const CreateChatScreen = () => {
  const { auth } = useAuth();
  const navigation = useNavigation();

  const [users, setUsers] = useState([]); // List of all users
  const [selectedUsers, setSelectedUsers] = useState([]); // Users selected for the chat
  const [chatName, setChatName] = useState(""); // Name for group chats
  const [isModalVisible, setIsModalVisible] = useState(false); // Visibility state for user selection modal
  const [isCreating, setIsCreating] = useState(false); // Loading state for chat creation

  // Fetch all users excluding the current user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosBase.get("/users", {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        });

        // Simplify users data for easier handling
        const simplifiedUsers = response.data
          .filter((user) => user._id !== auth.user._id)
          .map((user) => ({
            _id: user._id,
            name: `${user.firstName} ${user.lastName}`, // Combine first and last name
          }));

        setUsers(simplifiedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        Alert.alert("Error", "Failed to fetch users. Please try again later.");
      }
    };

    fetchUsers();
  }, [auth.user._id, auth.access_token]);

  // Handle user selection from FilterModal
  const handleSelectUser = (user) => {
    if (!selectedUsers.some((selectedUser) => selectedUser._id === user._id)) {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  // Remove user from selected users list
  const handleRemoveUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((user) => user._id !== userId));
  };

  // Create a new chat (single or group)
  const handleCreateChat = async () => {
    // Validation
    if (selectedUsers.length === 0) {
      Alert.alert("Validation Error", "Please select at least one user.");
      return;
    }

    if (selectedUsers.length > 1 && !chatName.trim()) {
      Alert.alert("Validation Error", "Please enter a group chat name.");
      return;
    }

    setIsCreating(true);

    try {
      // Prepare payload based on chat type
      const payload = {
        fromId: auth.user._id,
        toIds: selectedUsers.map((user) => user._id),
        groupName: selectedUsers.length > 1 ? chatName.trim() : null,
      };

      // Make POST request to create chat
      const response = await axiosBase.post("/chats", payload, {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });

      const createdChat = response.data;

      if (!createdChat || !createdChat._id) {
        throw new Error("Invalid chat data received from server.");
      }

      // Navigate to ChatScreen with the created chat's details
      navigation.navigate("ChatScreen", {
        initialChatId: createdChat._id,
        initialChatName: createdChat.name,
      });

      resetState();
    } catch (error) {
      console.error("Error creating chat:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to create chat. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Reset all state variables to initial values
  const resetState = () => {
    setSelectedUsers([]);
    setChatName("");
    setIsModalVisible(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={tw`flex-1 bg-white`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={tw`flex-grow p-6`}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Text style={tw`text-center font-bold text-2xl mb-6`}>
            Create a New Chat
          </Text>

          {/* Step 1: Select Users */}
          <Text style={tw`text-lg mb-2`}>1. Select Users:</Text>
          <Button
            title="Select Users"
            onPress={() => setIsModalVisible(true)}
          />

          {/* Display selected users */}
          {selectedUsers.length > 0 && (
            <View style={tw`mt-4`}>
              <Text style={tw`text-lg mb-2`}>Selected Users:</Text>
              {selectedUsers.map((user) => (
                <View
                  key={user._id}
                  style={tw`flex-row items-center justify-between p-3 bg-gray-100 mb-2 rounded-lg`}
                >
                  <Text style={tw`text-base`}>{user.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveUser(user._id)}>
                    <Text style={tw`text-red-500 text-sm`}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Step 2: Enter Group Title (if applicable) */}
          {selectedUsers.length > 1 && (
            <View style={tw`mt-6`}>
              <Text style={tw`text-lg mb-2`}>2. Enter Group Title:</Text>
              <TextInput
                style={tw`border border-gray-300 rounded p-3`}
                value={chatName}
                onChangeText={setChatName}
                placeholder="Enter Group Chat Name"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          )}

          {/* Create Chat Button */}
          {selectedUsers.length > 0 &&
            (selectedUsers.length === 1 ||
              (selectedUsers.length > 1 && chatName.trim())) && (
              <TouchableOpacity
                onPress={handleCreateChat}
                style={tw`bg-blue-500 p-4 rounded mt-6`}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={tw`text-white text-center text-lg`}>
                    Create Chat
                  </Text>
                )}
              </TouchableOpacity>
            )}
        </ScrollView>

        {/* Cancel Button at the bottom of the screen */}
        <View style={tw`p-6`}>
          <TouchableOpacity
            onPress={() => {
              resetState(); // Reset state when cancel button is pressed
              navigation.goBack();
            }}
            style={tw`bg-red-500 p-4 rounded`}
          >
            <Text style={tw`text-white text-center text-lg`}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Modal for selecting users */}
        <FilterModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          data={users} // This should be an array of objects with `_id` and `name`
          onSelect={handleSelectUser}
          selectedValue={null}
          object={true}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default CreateChatScreen;
