import React from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import tw from "twrnc";
import useAuth from "../../hooks/useAuth";

const PostCard = ({ post, onDelete }) => {
  const { auth } = useAuth();

  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(post._id),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View
      style={tw`w-full mb-4 border border-gray-300 rounded-lg shadow-sm p-4`}
    >
      <View style={tw`flex-row items-center mb-2`}>
        <Image
          source={{ uri: post.userPicturePath }}
          style={tw`w-10 h-10 rounded-full mr-2`}
        />
        <View style={tw`flex-1`}>
          <Text style={tw`text-lg font-bold`}>
            {post.firstName} {post.lastName}
          </Text>
          <Text style={tw`text-sm text-gray-500`}>{post.location}</Text>
        </View>

        {/* Render delete button only if the post belongs to the logged-in user */}
        {post.userId === auth.user._id && (
          <TouchableOpacity onPress={handleDelete}>
            <Icon name="trash" size={20} color="red" />
          </TouchableOpacity>
        )}
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
