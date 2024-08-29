import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "../../lib/tailwind";

const ChatListItem = ({ user, hasUnread, onPress }) => {
  return (
    <TouchableOpacity
      style={tw`flex-row justify-between items-center p-4 border-b border-gray-200`}
      onPress={() => onPress(user, hasUnread)} // Pass user and unread status
    >
      {/* Display user's name */}
      <Text style={tw`text-lg font-bold text-black`}>
        {user.firstName} {user.lastName}
      </Text>

      {/* Display an unread message indicator */}
      <View style={tw`flex-row items-center`}>
        <View
          style={tw`rounded-full h-3 w-3 mr-2 ${
            hasUnread ? "bg-red-500" : "bg-green-500"
          }`}
        />
        <Text
          style={tw`text-sm ${hasUnread ? "text-red-500" : "text-green-500"}`}
        >
          {hasUnread ? "Unread" : "Read"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChatListItem;
