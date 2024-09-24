import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import { axiosBase } from "../services/BaseService"; // Using axiosBase
import useAuth from "../hooks/useAuth"; // Custom authentication hook
import GroupCard from "../components/ui/GroupCard"; // Import GroupCard component

const GroupsScreen = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

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
          console.log("groupscrene, useFocuseffect", response.data.groups);
          setGroups(response.data.groups);
        } catch (error) {
          //console.error("Error fetching groups:", error);
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

  // Navigate to Create Group Screen
  const handleCreateGroupPress = () => {
    navigation.navigate("UpsertGroupScreen"); // Navigate to UpsertGroupScreen
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
      <TouchableOpacity
        style={tw`bg-blue-500 p-3 rounded-lg mb-4`} // Button styling
        onPress={handleCreateGroupPress} // Navigate to the new screen
      >
        <Text style={tw`text-white text-center text-lg`}>Create New Group</Text>
      </TouchableOpacity>

      {/* List of Groups */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <GroupCard group={item} onPress={() => handleGroupPress(item._id)} />
        )}
        contentContainerStyle={tw`pb-8`}
        ListEmptyComponent={
          <Text style={tw`text-center`}>No groups found.</Text>
        }
      />
    </View>
  );
};

export default GroupsScreen;
