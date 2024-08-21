import React from "react";
import { View, Text, Image } from "react-native";
import tw from "twrnc";

const PostCard = ({ post }) => {
  return (
    <View
      style={tw`w-full mb-4 border border-gray-300 rounded-lg shadow-sm p-4`}
    >
      <View style={tw`flex-row items-center mb-2`}>
        <Image
          source={{ uri: post.userPicturePath }}
          style={tw`w-10 h-10 rounded-full mr-2`}
        />
        <View>
          <Text style={tw`text-lg font-bold`}>
            {post.firstName} {post.lastName}
          </Text>
          <Text style={tw`text-sm text-gray-500`}>{post.location}</Text>
        </View>
      </View>

      <Text style={tw`text-base mb-2`}>{post.description}</Text>

      {post.picturePath && (
        <Image
          source={{ uri: post.picturePath }}
          style={tw`w-full h-48 rounded-lg`}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

export default PostCard;
