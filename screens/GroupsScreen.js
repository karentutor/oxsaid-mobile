import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import { axiosBase } from "../services/BaseService"; // Using axiosBase
import useAuth from "../hooks/useAuth"; // Custom authentication hook

const GroupsScreen = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth(); // Accessing authentication context
  const navigation = useNavigation();

  // Fetch groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const response = await axiosBase.get("/groups", {
          headers: { Authorization: `Bearer ${auth.access_token}` }, // Sending token in request
        });
        setGroups(response.data.groups);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [auth.access_token]);

  // Navigate to Group Details
  const handleGroupPress = (groupId) => {
    navigation.navigate("GroupDetails", { groupId });
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={tw`w-full mb-4 p-4 rounded-lg border border-gray-200 bg-white shadow`}
      onPress={() => handleGroupPress(item._id)}
    >
      <Text style={tw`text-lg font-bold`}>{item.name}</Text>
      <Text style={tw`text-gray-500`}>{item.description}</Text>
      <Text style={tw`text-sm text-gray-400 mt-2`}>
        Members: {item.groupMembers.length}
      </Text>
    </TouchableOpacity>
  );

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
      <FlatList
        data={groups}
        keyExtractor={(item) => item._id}
        renderItem={renderGroupItem}
        contentContainerStyle={tw`pb-8`}
        ListEmptyComponent={
          <Text style={tw`text-center`}>No groups found.</Text>
        }
      />
    </View>
  );
};

export default GroupsScreen;
