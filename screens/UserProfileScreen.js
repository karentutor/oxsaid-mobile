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
import { axiosBase } from "../services/BaseService"; // Updated import

function HomeScreen() {
  const { auth } = useAuth();
  const { access_token, user } = auth;
  const [posts, setPosts] = useState([]); // Ensure posts is initialized as an array

  useEffect(() => {
    fetchOwnPosts();
  }, []);

  const fetchOwnPosts = async () => {
    try {
      const response = await axiosBase.get("/posts/own", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      console.log("Fetched posts:", response.data);
      setPosts(response.data); // Assuming response.data is an array
    } catch (err) {
      console.error("Error fetching posts:", err.message);
      Alert.alert("Error fetching posts", err.message);
    }
  };

  const handlePost = async ({ text, image }) => {
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

      // Log the FormData object to inspect its contents
      console.log("FormData content:");
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await axiosBase.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${access_token}`,
        },
      });

      // Log the response from the server
      console.log("Post created successfully:", response.data);

      // Re-fetch posts after a new one is created
      fetchOwnPosts();
    } catch (err) {
      // Log the error response
      console.error("Error creating post:", err.message);
      Alert.alert("Error creating post", err.message);
    }
  };

  const handleCancel = () => {
    Alert.alert("Post creation canceled");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={tw`flex-1 p-8 bg-white`}>
        <Text style={tw`text-2xl font-bold mb-4 text-center`}>Home!</Text>

        {/* User Information */}
        {user ? (
          <View style={tw`items-center mb-8`}>
            {/* User Photo */}
            <Image
              source={{ uri: user.picturePath }}
              style={tw`w-24 h-24 rounded-full mb-4`}
            />

            {/* User Details */}
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

        {/* PostBox Component */}
        <PostBox onPost={handlePost} onCancel={handleCancel} />

        {/* Display Posts */}
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        ) : (
          <Text>No posts to display</Text>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

export default HomeScreen;
