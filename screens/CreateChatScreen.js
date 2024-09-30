import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
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
        console.log(response);

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
  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one user.");
      return;
    }

    if (selectedUsers.length > 1 && !chatName.trim()) {
      alert("Please enter a group chat name.");
      return;
    }

    try {
      const response = await axiosBase.post("/chats", {
        name: selectedUsers.length > 1 ? chatName : null,
        members: [auth.user._id, ...selectedUsers.map((user) => user._id)],
        isGroupChat: selectedUsers.length > 1,
      });

      if (response.data.isSuccess) {
        alert("Chat created successfully!");
        navigation.goBack(); // Navigate back to the chat list after successful creation
      } else {
        alert("Error creating chat: " + response.data.message);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("Error creating chat.");
    }
  };

  return (
    <View style={tw`flex-1 p-6`}>
      <Text style={tw`text-lg mb-4`}>Create a New Chat</Text>

      {/* Open FilterModal Button */}
      <Button title="Select Users" onPress={() => setIsModalVisible(true)} />

      {/* Show selected users */}
      {selectedUsers.length > 0 && (
        <View style={tw`mt-4`}>
          <Text style={tw`text-lg mb-2`}>Selected Users:</Text>
          {selectedUsers.map((user) => (
            <View
              key={user._id}
              style={tw`flex-row items-center justify-between p-2 bg-gray-100 mb-2 rounded-lg`}
            >
              <Text style={tw`text-base`}>{user.name}</Text>
              {/* Use user.name */}
              <TouchableOpacity onPress={() => handleRemoveUser(user._id)}>
                <Text style={tw`text-red-500`}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Group Chat Name Input */}
      {selectedUsers.length > 1 && (
        <TextInput
          style={tw`border border-gray-300 rounded p-2 mt-4`}
          value={chatName}
          onChangeText={setChatName}
          placeholder="Enter Group Chat Name"
        />
      )}

      {/* Create Chat Button */}
      <Button title="Create Chat" onPress={handleCreateChat} style={tw`mt-4`} />

      {/* Cancel Button */}
      <Button
        title="Cancel"
        onPress={() => navigation.goBack()}
        style={tw`mt-4`}
      />

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
