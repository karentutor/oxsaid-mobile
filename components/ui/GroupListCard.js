import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import tw from "../../lib/tailwind"; // Adjust the path if needed
import useAuth from "../../hooks/useAuth";
import { useNavigation } from "@react-navigation/native"; // Import navigation

const GroupListCard = ({ group, onEdit, onDelete }) => {
  const { auth } = useAuth();
  const navigation = useNavigation(); // Access the navigation object
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
      {/* Group Image - Centered */}
      <View style={tw`items-center`}>
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

      {/* Group Name and Description - Centered */}
      <View style={tw`items-center`}>
        <Text style={tw`text-lg font-bold mb-2`}>{group.name}</Text>
        <Text style={tw`text-sm text-gray-500 mb-4`}>{group.description}</Text>
      </View>

      {/* Line for Members */}
      <View style={tw`mt-4`}>
        <Text style={tw`text-sm font-bold text-gray-700`}>Members:</Text>
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

      {/* Line for Admins */}
      <View style={tw`mt-4`}>
        <Text style={tw`text-sm font-bold text-gray-700`}>Admins:</Text>
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

      {/* Conditionally render action buttons if the current user is an admin */}
      {isAdmin && (
        <View style={tw`flex-row justify-between mt-4`}>
          <TouchableOpacity
            onPress={onEdit}
            style={tw`bg-blue-500 py-1 px-4 rounded-lg`}
          >
            <Text style={tw`text-white`}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={tw`bg-red-500 py-1 px-4 rounded-lg`}
          >
            <Text style={tw`text-white`}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default GroupListCard;
