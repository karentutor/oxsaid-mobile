import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import tw from "../../lib/tailwind";

const UserCard = ({ user }) => {
  const navigation = useNavigation();

  const handleChat = () => {
    navigation.navigate("ChatScreen", { user }); // Updated navigation name to "Chat"
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
          onPress={() => console.log("Email button clicked")}
          style={tw`bg-secondary500 rounded-lg p-2 w-1/2`}
        >
          <Text style={tw`text-center`}>Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserCard;
