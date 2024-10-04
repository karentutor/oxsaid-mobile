// components/MessageInput.js
import React from "react";
import { View, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import tw from "../../lib/tailwind";

const MessageInput = ({ inputMessage, setInputMessage, sendMessage }) => {
  return (
    <View style={tw`flex-row items-center p-4 border-t border-gray-300`}>
      <TextInput
        style={tw`flex-1 border border-gray-300 rounded-full p-2 mr-2 bg-white`}
        placeholder="Type your message..."
        value={inputMessage}
        onChangeText={setInputMessage}
        returnKeyType="send"
        onSubmitEditing={sendMessage}
      />
      <TouchableOpacity onPress={sendMessage} style={tw`p-2`}>
        <Text style={tw`text-xl text-blue-500`}>➡️</Text>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(MessageInput);
