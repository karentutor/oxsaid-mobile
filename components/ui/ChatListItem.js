// components/ui/ChatListItem.js

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "../../lib/tailwind";

const ChatListItem = ({ displayName, hasUnread, latestMessage, onPress }) => {
  return (
    <TouchableOpacity
      style={tw`flex-row justify-between items-center p-4 border-b border-gray-200`}
      onPress={onPress}
    >
      {/* Display user's name or chat name */}
      <View style={tw`flex-1`}>
        <Text style={tw`text-lg font-bold text-black`}>{displayName}</Text>
        {/* Display the latest message */}
        {latestMessage && (
          <Text style={tw`text-sm text-gray-600`}>{latestMessage}</Text>
        )}
      </View>

      {/* Display an unread message indicator */}
      {hasUnread && (
        <View style={tw`ml-2`}>
          <View style={tw`rounded-full h-3 w-3 bg-red-500`} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ChatListItem;
