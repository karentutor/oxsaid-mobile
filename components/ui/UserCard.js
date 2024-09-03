// UserCard.js

import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import tw from "../../lib/tailwind";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import an icon library, e.g., MaterialIcons

const UserCard = ({ user }) => {
  const navigation = useNavigation();

  const handleChat = () => {
    navigation.navigate("ChatScreen", { user });
  };

  const handleEmail = () => {
    // Navigate to EmailScreen with user details
    navigation.navigate("EmailScreen", { user });
  };

  return (
    <View
      style={[
        tw`border border-gray-300 rounded-lg p-4 mt-2 w-full`,
        {
          backgroundColor: "#ffffff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        },
      ]}
    >
      {/* Top Right Arrow and "View" Text */}
      <TouchableOpacity style={tw`absolute top-2 right-2 items-center`}>
        <Icon name="arrow-forward-ios" size={20} color="gray" />
        {/* <Text style={tw`text-gray-500 text-xs`}>View</Text> */}
      </TouchableOpacity>

      {/* User Details */}
      <TouchableOpacity
        onPress={() => navigation.navigate("UserProfile", { user })}
      >
        <View style={tw`flex-row items-center`}>
          {/* User Picture */}
          {user.picturePath ? (
            <Image
              source={{ uri: user.picturePath }}
              style={tw`w-16 h-16 rounded-full mr-4`}
            />
          ) : (
            <View style={tw`w-16 h-16 rounded-full bg-gray-300 mr-4`} />
          )}

          {/* User Details */}
          <View style={tw`flex-1`}>
            <Text style={tw`text-xl font-bold text-black`}>
              {user.firstName} {user.lastName}
            </Text>
            {/* Additional User Info */}
          </View>
        </View>
      </TouchableOpacity>

      {/* Buttons for Chat and Email */}
      <View style={tw`flex-row justify-center mt-4`}>
        <TouchableOpacity
          onPress={handleChat}
          style={tw`bg-blue-500 rounded-lg p-2 w-1/2 mr-2`}
        >
          <Text style={tw`text-white text-center`}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleEmail} // Updated to navigate to EmailScreen
          style={tw`bg-secondary500 rounded-lg p-2 w-1/2`}
        >
          <Text style={tw`text-center`}>Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserCard;
