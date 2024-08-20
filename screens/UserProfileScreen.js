import React from "react";
import { View, Text } from "react-native";
import tw from "../lib/tailwind";

const UserProfileScreen = ({ route }) => {
  const { user } = route.params;

  return (
    <View style={tw`flex-1 items-center justify-center`}>
      <Text style={tw`text-3xl font-bold`}>User Profile</Text>
      <Text style={tw`text-xl mt-4`}>
        {user.firstName} {user.lastName}
      </Text>
      {/* Additional user information can be added here */}
    </View>
  );
};

export default UserProfileScreen;
