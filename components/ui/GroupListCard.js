import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import tw from "../../lib/tailwind"; // Adjust the path if needed
import useAuth from "../../hooks/useAuth";
import { useNavigation } from "@react-navigation/native"; // Import navigation

const GroupListCard = ({ group, onEdit, onDelete }) => {
  const { auth } = useAuth();
  const navigation = useNavigation();
  let currentUserId = auth.user._id;

  // Check if the current user is an admin of the group
  const isAdmin = group.adminMembers.some(
    (admin) => admin._id === currentUserId
  );

  // Navigate to the UserProfile screen
  const handleNavigateToProfile = (userId) => {
    navigation.navigate("UserProfileScreen", { userId });
  };

  return (
    <View style={tw`bg-white p-4 rounded-lg shadow-md mb-4`}>
      {/* Group Title and Description - Centered */}
      <View style={tw`items-center mb-6`}>
        <Text style={tw`text-lg font-bold mb-2`}>{group.name}</Text>
        <Text style={tw`text-sm text-gray-500`}>{group.description}</Text>
      </View>

      {/* Image, Members, and Admins in Columns */}
      <View style={tw`flex-row justify-between`}>
        {/* Left Column: Group Image */}
        <View style={tw`flex-1 mr-4 items-center`}>
          {group.groupCoverImage ? (
            <Image
              source={{ uri: group.groupCoverImage }}
              style={tw`w-24 h-24 rounded-full mb-4`}
            />
          ) : (
            <View
              style={tw`w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-4`}
            >
              <Text style={tw`text-gray-500`}>No Image</Text>
            </View>
          )}
        </View>

        {/* Middle Column: Members */}
        <View style={tw`flex-1 mx-4`}>
          <Text style={tw`text-sm font-bold text-gray-700 mb-2`}>Members:</Text>
          {group.groupMembers.length > 0 ? (
            <View>
              {group.groupMembers.map((member) => (
                <TouchableOpacity
                  key={member._id}
                  onPress={() => handleNavigateToProfile(member._id)}
                >
                  <Text style={tw`text-sm text-blue-500`}>
                    {member.firstName} {member.lastName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={tw`text-sm text-gray-600`}>No members available</Text>
          )}
        </View>

        {/* Right Column: Admins */}
        <View style={tw`flex-1 ml-4`}>
          <Text style={tw`text-sm font-bold text-gray-700 mb-2`}>Admins:</Text>
          {group.adminMembers.length > 0 ? (
            <View>
              {group.adminMembers.map((admin) => (
                <TouchableOpacity
                  key={admin._id}
                  onPress={() => handleNavigateToProfile(admin._id)}
                >
                  <Text style={tw`text-sm text-blue-500`}>
                    {admin.firstName} {admin.lastName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={tw`text-sm text-gray-600`}>No admins available</Text>
          )}
        </View>
      </View>

      {/* Conditionally render action buttons if the current user is an admin */}
      {/* {isAdmin && (
        <View style={tw`flex-row justify-center mt-8`}>
          <TouchableOpacity
            onPress={onEdit}
            style={tw`bg-blue-500 py-2 px-8 rounded-lg mr-6`}
          >
            <Text style={tw`text-white text-lg`}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={tw`bg-red-500 py-2 px-8 rounded-lg`}
          >
            <Text style={tw`text-white text-lg`}>Delete</Text>
          </TouchableOpacity>
        </View>
      )} */}
    </View>
  );
};

export default GroupListCard;
