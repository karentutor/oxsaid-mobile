import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import { axiosBase } from "../services/BaseService"; // Using axiosBase
import useAuth from "../hooks/useAuth"; // Custom authentication hook
import GroupCard from "../components/ui/GroupCard"; // Import GroupCard component
import CreateGroupForm from "../components/ui/CreateGroupForm";
const GroupsScreen = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  //hooks
  const { auth } = useAuth(); // Accessing authentication context
  const navigation = useNavigation();

  // Fetch groups on screen focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchGroups = async () => {
        setLoading(true);
        try {
          const response = await axiosBase.get("/groups", {
            headers: { Authorization: `Bearer ${auth.access_token}` }, // Sending token in request
          });
          setGroups(response.data.groups);
          console.log(response.data.groups);
        } catch (error) {
          console.error("Error fetching groups:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchGroups();

      return () => {
        // Optional cleanup if needed
      };
    }, [auth.access_token]) // Re-run whenever `auth.access_token` changes
  );

  // Navigate to Group Details
  const handleGroupPress = (groupId) => {
    navigation.navigate("GroupProfileScreen", { groupId });
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-lg`}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-100 p-4`}>
      <Text style={tw`text-2xl font-bold mb-4`}>Groups</Text>
      {/* Create New Group Button */}
      {!showCreateGroup && (
        <>
          <TouchableOpacity
            style={tw`bg-blue-500 p-3 rounded-lg mb-4`} // Button styling
            onPress={() => setShowCreateGroup(true)} // Show the create group form
          >
            <Text style={tw`text-white text-center text-lg`}>
              Create New Group
            </Text>
          </TouchableOpacity>
          <FlatList
            data={groups}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <GroupCard
                group={item}
                onPress={() => handleGroupPress(item._id)}
              />
            )}
            contentContainerStyle={tw`pb-8`}
            ListEmptyComponent={
              <Text style={tw`text-center`}>No groups found.</Text>
            }
          />
        </>
      )}
      {/* Render CreateGroupForm when button is pressed */}
      {showCreateGroup && (
        <CreateGroupForm onClose={() => setShowCreateGroup(false)} />
      )}
    </View>
  );
};

export default GroupsScreen;
