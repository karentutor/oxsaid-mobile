import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { axiosBase } from "../services/BaseService";
import useAuth from "../hooks/useAuth";
import tw from "../lib/tailwind";
import { useNavigation } from "@react-navigation/native";
import PostCard from "../components/ui/PostCard"; // Import the PostCard component
import BusinessInformation from "../components/ui/BusinessInformation"; // Adjust the import path accordingly

const UserProfileScreen = ({ route }) => {
  const { user } = route.params; // The user whose profile you're viewing
  const { auth } = useAuth(); // The authenticated user
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState([]);
  const [showBusiness, setShowBusiness] = useState(false);
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

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await axiosBase.get(`/users/business/${user._id}`, {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        });
        console.log(response.data);
        setBusiness(response.data); // Store business info in state for display
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setBusiness(null); // If no business found, reset the state
        } else {
          console.error("Error fetching business:", error.message);
        }
      }
    };

    if (user._id && auth.access_token) {
      fetchBusiness(); // Fetch business data when component mounts or dependencies change
    }
  }, [user._id, auth.access_token]); // Dependency array to rerun the effect if user._id or access_token changes

  return (
    <ScrollView style={tw`flex-1 p-4 bg-white`}>
      <View style={tw`items-center`}>
        {/* User Profile Header */}
        <Text style={tw`text-3xl font-bold text-primary500 mb-6`}>Profile</Text>

        {/* User Picture */}
        {user.picturePath ? (
          <Image
            source={{ uri: user.picturePath }}
            style={tw`w-40 h-40 rounded-full mb-4 shadow-lg`}
          />
        ) : (
          <View style={tw`w-40 h-40 rounded-full bg-gray-300 mb-4 shadow-lg`} />
        )}

        {/* User Details */}
        <View
          style={tw`items-center bg-gray-50 p-4 rounded-lg shadow-sm w-full`}
        >
          <Text style={tw`text-2xl font-bold text-black mb-2`}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={tw`text-base text-gray-700 mb-2`}>
            College: {user.college || "N/A"}
          </Text>
          <Text style={tw`text-base text-gray-700 mb-2`}>
            Matriculation Year: {user.matriculationYear || "N/A"}
          </Text>
          <Text style={tw`text-base text-gray-700 mb-2`}>
            Industry: {user.occupation || "N/A"}
          </Text>
        </View>

        {/* Connect Button */}
        {!loading && (
          <TouchableOpacity
            style={tw`mt-6 px-4 py-2 rounded-full shadow-md ${
              isConnected ? "bg-yellow-500" : "bg-red-500"
            }`}
            onPress={isConnected ? handleDisconnect : handleConnect}
          >
            <Text style={tw`text-white text-base font-bold`}>
              {isConnected ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Toggle to Show/Hide Business */}
        {business && (
          <View style={tw`mt-6 flex-row items-center`}>
            <Text style={tw`text-base text-black font-bold`}>
              Show Business Info
            </Text>
            <Switch
              value={showBusiness}
              onValueChange={() => setShowBusiness(!showBusiness)}
              style={tw`ml-2`}
            />
          </View>
        )}

        {/* Business Information */}
        {showBusiness && business && (
          <BusinessInformation business={business} />
        )}

        {/* User Posts */}
        <View style={tw`mt-8 w-full`}>
          <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>Posts</Text>
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post._id} post={post} onDelete={() => {}} />
            ))
          ) : (
            <Text style={tw`text-gray-600 text-center`}>
              No posts to display
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default UserProfileScreen;
