// components/MessageList.js
import React, { useCallback } from "react";
import { FlatList, View, Text, Image, TouchableOpacity } from "react-native";
import tw from "../../lib/tailwind";

const MessageItem = ({ item, confirmDeleteMessage }) => {
  const messageDate = new Date(item.timestamp);
  const formattedTime = messageDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDate = messageDate.toLocaleDateString();

  return (
    <View
      style={[
        tw`mb-4 p-2 rounded-lg`,
        item.isSentByCurrentUser
          ? tw`bg-blue-100 self-end`
          : tw`bg-gray-200 self-start`,
      ]}
    >
      <View style={tw`flex-row items-center`}>
        {!item.isSentByCurrentUser && item.fromAvatar && (
          <Image
            source={{ uri: item.fromAvatar }}
            style={tw`w-6 h-6 rounded-full mr-2`}
          />
        )}
        <View>
          <Text style={tw`text-sm text-gray-500`}>
            {item.isSentByCurrentUser ? `To ${item.from}` : `From ${item.from}`}{" "}
            • {formattedTime}
          </Text>
          <Text style={tw`text-xs text-gray-400`}>{formattedDate}</Text>
          <Text style={tw`text-base text-black mt-1`}>{item.text}</Text>
        </View>
      </View>
      {item.isSentByCurrentUser && (
        <View style={tw`flex-row justify-end mt-2`}>
          <TouchableOpacity
            onPress={() => confirmDeleteMessage(item._id)}
            style={tw`p-1`}
          >
            <Text style={tw`text-red-500 text-xs`}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const MessageList = ({ messages, confirmDeleteMessage }) => {
  const renderItem = useCallback(
    ({ item }) => (
      <MessageItem item={item} confirmDeleteMessage={confirmDeleteMessage} />
    ),
    [confirmDeleteMessage]
  );

  return (
    <FlatList
      data={messages}
      keyExtractor={(item) =>
        item._id ? item._id.toString() : `temp-${Date.now()}`
      }
      renderItem={renderItem}
      contentContainerStyle={tw`flex-grow pt-4`}
      inverted
      keyboardShouldPersistTaps="handled"
      initialNumToRender={20}
      maxToRenderPerBatch={20}
      windowSize={21}
    />
  );
};

export default React.memo(MessageList);
