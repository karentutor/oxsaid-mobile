import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import tw from "../../lib/tailwind";

const UserCard = ({ user }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("UserProfile", { user })}
      style={[
        tw`border border-gray-300 rounded-lg p-4 mt-2 flex-row items-center w-full`,
        {
          backgroundColor: "#ffffff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        },
      ]}
      activeOpacity={0.7}
    >
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
        <Text style={tw`text-base text-gray-700`}>
          College: {user.college || "N/A"}
        </Text>
        <Text style={tw`text-base text-gray-700`}>
          Matriculation Year: {user.matriculationYear || "N/A"}
        </Text>
        <Text style={tw`text-base text-gray-700`}>
          Industry: {user.occupation || "N/A"} {/* Display Industry */}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default UserCard;
