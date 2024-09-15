import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";

// GroupCard component accepts group data and an onPress handler as props
const GroupCard = ({ group, onPress }) => {
  return (
    <TouchableOpacity
      style={tw`w-full mb-4 p-4 rounded-lg border border-gray-200 bg-white shadow`}
      onPress={onPress}
    >
      <View>
        <Text style={tw`text-lg font-bold`}>{group.name}</Text>
        <Text style={tw`text-gray-500`}>{group.description}</Text>
        <Text style={tw`text-sm text-gray-400 mt-2`}>
          Members: {group.groupMembers.length}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default GroupCard;
