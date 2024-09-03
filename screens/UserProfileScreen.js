import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { axiosBase } from "../services/BaseService";
import useAuth from "../hooks/useAuth";
import tw from "../lib/tailwind";
import { useNavigation } from "@react-navigation/native";
import PostCard from "../components/ui/PostCard"; // Import the PostCard component

const UserProfileScreen = ({ route }) => {
  const { user } = route.params; // The user whose profile you're viewing
  const { auth } = useAuth(); // The authenticated user
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]); // State to store user posts
  const navigation = useNavigation();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await axiosBase.get(
          `/users/${auth.user._id}/friends`,
          {
            headers: { Authorization: `Bearer ${auth.access_token}` },
          }
        );
        const friendIds = response.data;
        setIsConnected(friendIds.includes(user._id));
        setLoading(false);
      } catch (error) {
        console.error("Error checking connection status:", error);
        setLoading(false);
      }
    };

    checkConnection();
    fetchUserPosts(); // Fetch user posts on component mount
  }, [auth.user._id, auth.access_token, user._id]);

  // Function to fetch user's posts
  const fetchUserPosts = async () => {
    try {
      const response = await axiosBase.get(`/posts/${user._id}`, {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      Alert.alert("Error", "Failed to load user posts.");
    }
  };

  const handleConnect = async () => {
    try {
      await axiosBase.post(
        `/users/follow/${user._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        }
      );
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting with user:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await axiosBase.post(
        `/users/unfollow/${user._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        }
      );
      setIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting from user:", error);
    }
  };

  const handleChatPress = async () => {
    try {
      const response = await axiosBase.post(
        `/chats/create-or-get`,
        {
          userId: auth.user._id,
          recipientId: user._id,
        },
        {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        }
      );

      const { _id: chatId } = response.data;

      navigation.navigate("Chats", {
        screen: "Chat",
        params: {
          chatId,
          userId: auth.user._id,
          userName: `${user.firstName} ${user.lastName}`,
        },
      });
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  return (
    <ScrollView style={tw`flex-1 p-4`}>
      <View style={tw`items-center justify-center`}>
        {/* User Profile Header */}
        <Text style={tw`text-3xl font-bold mb-4`}>User Profile</Text>

        {/* User Picture */}
        {user.picturePath ? (
          <Image
            source={{ uri: user.picturePath }}
            style={tw`w-32 h-32 rounded-full mb-4`}
          />
        ) : (
          <View style={tw`w-32 h-32 rounded-full bg-gray-300 mb-4`} />
        )}

        {/* User Details */}
        <View style={tw`items-center`}>
          <Text style={tw`text-xl font-bold text-black`}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={tw`text-base text-gray-700 mt-2`}>
            College: {user.college || "N/A"}
          </Text>
          <Text style={tw`text-base text-gray-700 mt-2`}>
            Matriculation Year: {user.matriculationYear || "N/A"}
          </Text>
          <Text style={tw`text-base text-gray-700 mt-2`}>
            Industry: {user.occupation || "N/A"}
          </Text>
        </View>

        {/* Connect Button */}
        {!loading && (
          <TouchableOpacity
            style={tw`mt-6 bg-primary500 px-4 py-2 rounded-lg`}
            onPress={isConnected ? handleDisconnect : handleConnect}
          >
            <Text style={tw`text-white text-lg font-bold`}>
              {isConnected ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}

        {/* User Posts */}
        <View style={tw`mt-6 w-full`}>
          <Text style={tw`text-xl font-bold mb-4`}>User's Posts</Text>
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post._id} post={post} onDelete={() => {}} /> // Display posts using PostCard component
            ))
          ) : (
            <Text>No posts to display</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default UserProfileScreen;
