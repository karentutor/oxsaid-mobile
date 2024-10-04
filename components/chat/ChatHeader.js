// components/ChatHeader.js
import React from "react";
import { View, Text } from "react-native";
import tw from "../../lib/tailwind";

const ChatHeader = ({ chatName }) => (
  <View style={tw`p-4 bg-blue-100`}>
    <Text style={tw`text-xl font-bold text-center`}>{chatName}</Text>
  </View>
);

export default ChatHeader;
