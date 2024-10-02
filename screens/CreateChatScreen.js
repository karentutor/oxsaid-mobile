import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Button,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { axiosBase } from "../services/BaseService";
import useAuth from "../hooks/useAuth";
import FilterModal from "../components/ui/FilterModal"; // Import FilterModal
import tw from "../lib/tailwind";

const CreateChatScreen = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [chatName, setChatName] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const { auth } = useAuth();
  const navigation = useNavigation();

  // Fetch all users for chat creation
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosBase.get("/users", {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        });

        // Simplify users data before setting state
        const simplifiedUsers = response.data
          .filter((user) => user._id !== auth.user._id)
          .map((user) => ({
            _id: user._id,
            name: `${user.firstName} ${user.lastName}`, // Combine first and last name into `name`
          }));

        setUsers(simplifiedUsers); // Set the simplified data
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [auth.user._id]);

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

  // Create a new chat
  const handleCreateChat = () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one user.");
      return;
    }

    if (selectedUsers.length > 1 && !chatName.trim()) {
      alert("Please enter a group chat name.");
      return;
    }

    // Hand off the selected users and navigate to ChatScreen
    const userIds = selectedUsers.map((user) => user._id);
    navigation.navigate("ChatScreen", {
      userIds,
      chatName: selectedUsers.length > 1 ? chatName : null,
    });

    resetState();
  };

  // Reset all state variables to initial values
  const resetState = () => {
    setSelectedUsers([]);
    setChatName("");
    setIsModalVisible(false);
  };

  return (
    <View style={tw`flex-1`}>
      <ScrollView contentContainerStyle={tw`flex-grow p-6`}>
        {/* Title */}
        <Text style={tw`text-center font-bold text-lg mb-5`}>
          Create a New Chat
        </Text>

        {/* Step 1: Select Users */}
        <View style={tw`items-start mb-2`}>
          <Text style={tw`text-base`}>1. Select 1 or Many Users:</Text>
        </View>
        <Button title="Select Users" onPress={() => setIsModalVisible(true)} />

        {/* Show selected users */}
        {selectedUsers.length > 0 && (
          <View style={tw`mt-4`}>
            <Text style={tw`text-lg mb-2`}>Selected:</Text>
            {selectedUsers.map((user) => (
              <View
                key={user._id}
                style={tw`flex-row items-center justify-between p-2 bg-gray-100 mb-2 rounded-lg`}
              >
                <Text style={tw`text-base`}>{user.name}</Text>
                <TouchableOpacity onPress={() => handleRemoveUser(user._id)}>
                  <Text style={tw`text-red-500`}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Step 2: Enter Group Title */}
        {selectedUsers.length > 1 && (
          <View style={tw`items-start mt-4`}>
            <Text style={tw`text-base mb-1`}>2. Enter Group Title</Text>
            <TextInput
              style={tw`border border-gray-300 rounded p-2 w-full`}
              value={chatName}
              onChangeText={setChatName}
              placeholder="Enter Group Chat Name"
            />
          </View>
        )}

        {/* Create Chat Button (Visible only when both step 1 and step 2 are completed) */}
        {selectedUsers.length > 0 &&
          (selectedUsers.length === 1 ||
            (selectedUsers.length > 1 && chatName.trim())) && (
            <TouchableOpacity
              onPress={handleCreateChat}
              style={tw`bg-blue-500 p-3 rounded mt-4`}
            >
              <Text style={tw`text-white text-center`}>Create Chat</Text>
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
          style={tw`bg-red-500 p-3 rounded`}
        >
          <Text style={tw`text-white text-center`}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Modal for selecting users */}
      <FilterModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        data={users} // This will be an array of objects with `_id` and `name`
        onSelect={handleSelectUser}
        selectedValue={null}
        object={true}
      />
    </View>
  );
};

export default CreateChatScreen;
