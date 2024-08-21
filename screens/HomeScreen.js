import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import useAuth from "../hooks/useAuth";
import tw from "twrnc";
import PostBox from "../components/ui/PostBox";
import PostCard from "../components/ui/PostCard";
import { axiosBase } from "../services/BaseService"; // Ensure consistent axios usage

function HomeScreen() {
  const { auth } = useAuth();
  const { access_token, user } = auth;
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Fetch logged-in user's own posts
      const ownPostsResponse = await axiosBase.get("/posts/own", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      // Fetch posts from users the logged-in user is following
      const followedPostsResponse = await axiosBase.get("/posts/followed", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      // Combine the posts
      const allPosts = [
        ...ownPostsResponse.data,
        ...followedPostsResponse.data,
      ];

      // Sort posts by creation date (if needed)
      allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPosts(allPosts);
    } catch (err) {
      console.error("Error fetching posts:", err.message);
      Alert.alert("Error fetching posts", err.message);
    }
  };

  const handlePost = async ({ text, image }) => {
    console.log("handlePost called with text:", text, "and image:", image);

    try {
      const formData = new FormData();
      formData.append("userId", user._id);
      formData.append("description", text);

      if (image) {
        const fileName = image.split("/").pop();
        const fileType = fileName.split(".").pop();
        formData.append("picture", {
          uri: image,
          name: fileName,
          type: `image/${fileType}`,
        });
      }

      const response = await axiosBase.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${access_token}`,
        },
      });

      console.log("Post created successfully:", response.data);

      fetchPosts(); // Refresh the posts after creating a new one
    } catch (err) {
      if (err.response) {
        console.error(
          "Server responded with a 409 status code:",
          err.response.data
        );
      } else {
        console.error("Error creating post:", err.message);
      }
      Alert.alert("Error creating post", err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await axiosBase.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (response.data.isSuccess) {
        setPosts(posts.filter((post) => post._id !== postId));
        Alert.alert("Post deleted", "Your post was deleted successfully.");
      } else {
        Alert.alert("Error", response.data.msg);
      }
    } catch (err) {
      console.error("Error deleting post:", err.message);
      Alert.alert("Error deleting post", err.message);
    }
  };

  const handleCancel = () => {
    Alert.alert("Post creation canceled");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={tw`flex-1 p-8 bg-white`}>
        <Text style={tw`text-2xl font-bold mb-4 text-center`}>Home!</Text>

        {user ? (
          <View style={tw`items-center mb-8`}>
            {user.picturePath ? (
              <Image
                source={{ uri: user.picturePath }}
                style={tw`w-24 h-24 rounded-full mb-4`}
              />
            ) : (
              <View
                style={tw`w-24 h-24 rounded-full mb-4 bg-gray-300 flex items-center justify-center`}
              >
                <Text style={tw`text-lg text-gray-500`}>No Image</Text>
              </View>
            )}

            <Text style={tw`text-xl font-bold`}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={tw`text-sm text-gray-500`}>{user.email}</Text>
            <Text style={tw`text-sm text-gray-500 mb-4`}>
              {user.occupation}
            </Text>
          </View>
        ) : (
          <Text>No User ID</Text>
        )}

        <PostBox onPost={handlePost} onCancel={handleCancel} />

        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
          ))
        ) : (
          <Text>No posts to display</Text>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

export default HomeScreen;
