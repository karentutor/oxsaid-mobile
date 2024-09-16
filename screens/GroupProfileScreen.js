import React, { useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { axiosBase } from "../services/BaseService";
import useAuth from "../hooks/useAuth";
import tw from "twrnc";

const GroupProfileScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { groupId } = params;
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth();

  const access_token = auth.access_token;

  const handleUserPress = (userId) => {
    navigation.navigate("UserProfileScreen", { userId }); // Navigate to UserProfile
  };

  const handleDeleteGroup = async () => {
    try {
      const response = await axiosBase.delete(`/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (response.data.isSuccess) {
        Alert.alert("Group deleted", "The group was deleted successfully.");
        fetchGroup(); // Re-fetch the groups after deletion
      } else {
        Alert.alert("Error", response.data.msg);
      }
    } catch (error) {
      console.error("Error deleting group:", error.message);
      Alert.alert("Error deleting group", error.message);
    }
  };

  const handleEditGroup = () => {
    navigation.navigate("UpsertGroupScreen", { groupId }); // Navigate to EditGroupScreen
  };

  // Fetch group details
  const fetchGroup = async () => {
    setLoading(true);
    try {
      const response = await axiosBase.get(`/groups/group/${groupId}`, {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });
      console.log(response.data);
      setGroup(response.data.group);
    } catch (error) {
      console.error("Error fetching group details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId, auth.access_token]);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-lg`}>Loading...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-lg`}>No group data available.</Text>
      </View>
    );
  }

  const isAdmin = group.adminMembers.some(
    (admin) => admin._id === auth.user._id
  );

  return (
    <ScrollView
      contentContainerStyle={tw`flex-1 justify-center items-center p-4 bg-gray-100`}
    >
      {/* Group Cover Image */}
      {group.groupCoverImage && (
        <Image
          source={{ uri: group.groupCoverImage }}
          style={tw`w-full h-64 rounded-lg mb-4`}
          resizeMode="cover"
        />
      )}

      {/* Group Name */}
      <Text style={tw`text-3xl font-bold mb-2 text-center`}>{group.name}</Text>

      {/* Group Description */}
      {group.description && (
        <Text style={tw`text-lg text-gray-600 mb-4 text-center`}>
          {group.description}
        </Text>
      )}

      {/* Group Country */}
      {group.country && (
        <Text style={tw`text-base text-gray-500 mb-4 text-center`}>
          Country: {group.country}
        </Text>
      )}

      {/* Group Privacy */}
      <Text style={tw`text-base mb-4 text-center`}>
        {group.isPrivate ? "Private Group" : "Public Group"}
      </Text>

      {/* Group Members */}
      <Text style={tw`text-xl font-bold mb-2 text-center`}>Group Members</Text>
      {group.groupMembers.length > 0 ? (
        group.groupMembers.map((member, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleUserPress(member._id)}
          >
            <Text style={tw`text-base text-blue-500 mb-2 text-center`}>
              - {member.firstName} {member.lastName}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={tw`text-base text-gray-500 mb-4 text-center`}>
          No members in this group.
        </Text>
      )}

      {/* Admin Members */}
      <Text style={tw`text-xl font-bold mb-2 text-center`}>Admin Members</Text>
      {group.adminMembers.length > 0 ? (
        group.adminMembers.map((admin, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleUserPress(admin._id)}
          >
            <Text style={tw`text-base text-blue-500 mb-2 text-center`}>
              - {admin.firstName} {admin.lastName}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={tw`text-base text-gray-500 mb-4 text-center`}>
          No admin members in this group.
        </Text>
      )}

      {/* Events Section */}
      {group.events && group.events.length > 0 && (
        <View>
          <Text style={tw`text-xl font-bold mb-2 text-center`}>Events</Text>
          {group.events.map((event, index) => (
            <Text
              key={index}
              style={tw`text-base text-gray-700 mb-2 text-center`}
            >
              - {event.name}
            </Text>
          ))}
        </View>
      )}

      {/* Created At */}
      <Text style={tw`text-base text-gray-400 mt-4 text-center`}>
        Created on: {new Date(group.createdAt).toLocaleDateString()}
      </Text>

      {isAdmin && (
        <View style={tw`flex-row justify-center mt-8`}>
          <TouchableOpacity
            onPress={handleEditGroup}
            style={tw`bg-blue-500 py-2 px-6 rounded-lg mr-4`}
          >
            <Text style={tw`text-white text-center text-lg`}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteGroup}
            style={tw`bg-red-500 py-2 px-6 rounded-lg`}
          >
            <Text style={tw`text-white text-center text-lg`}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default GroupProfileScreen;
