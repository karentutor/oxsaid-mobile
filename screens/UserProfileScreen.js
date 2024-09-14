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
import { contactOptions } from "../data";

const UserProfileScreen = ({ route }) => {
  const { user } = route.params; // The user whose profile you're viewing
  const { auth } = useAuth(); // The authenticated user
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contactPreferences, setContactPreferences] = useState([]); // State for contact preferences
  const [business, setBusiness] = useState([]);
  const [showBusiness, setShowBusiness] = useState(false);
  const [posts, setPosts] = useState([]); // State to store user posts
  const navigation = useNavigation();
  const [showPosts, setShowPosts] = useState(false); // State to toggle post display
  const [showContactPreferences, setShowContactPreferences] = useState(false);

  useEffect(() => {
    // Fetch contact preferences on component mount
    const fetchContactPreferences = async () => {
      try {
        const response = await axiosBase.get(
          `/contact-preferences/${user._id}`,
          {
            headers: { Authorization: `Bearer ${auth.access_token}` },
          }
        );
        setContactPreferences(response.data);
      } catch (error) {
        console.error("Error fetching contact preferences:", error);
      }
    };

    fetchContactPreferences(); // Call the function inside useEffect
  }, [auth.user._id, auth.access_token]);

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

  // Function to toggle a contact preference
  const toggleContactPreference = async (option) => {
    const isSelected = contactPreferences.includes(option);

    let updatedPreferences = [];
    if (isSelected) {
      updatedPreferences = contactPreferences.filter((pref) => pref !== option);
    } else {
      updatedPreferences = [...contactPreferences, option];
    }

    try {
      await axiosBase.post(
        `/contact-preferences/${user._id}`,
        { contactPreferences: updatedPreferences },
        {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        }
      );
      setContactPreferences(updatedPreferences); // Update the state after the change
    } catch (error) {
      console.error("Error updating contact preferences:", error);
    }
  };

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

        {/* Toggle Switches for Contact Preferences, Business Info, and Posts */}
        <View style={tw`w-full mt-6 p-4 bg-gray-100 rounded-lg shadow-sm`}>
          <Text style={tw`text-xl font-bold mb-4`}>Show</Text>

          {/* Toggle to Show/Hide Contact Preferences */}
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <Text style={tw`text-base text-black`}>Contact Preferences</Text>
            <Switch
              value={showContactPreferences}
              onValueChange={() =>
                setShowContactPreferences(!showContactPreferences)
              }
              style={tw`ml-2`}
            />
          </View>

          {/* Toggle to Show/Hide Business Info */}
          {business && (
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <Text style={tw`text-base text-black`}>Show Business Info</Text>
              <Switch
                value={showBusiness}
                onValueChange={() => setShowBusiness(!showBusiness)}
                style={tw`ml-2`}
              />
            </View>
          )}

          {/* Toggle to Show/Hide Posts */}
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={tw`text-base text-black`}>Show Posts</Text>
            <Switch
              value={showPosts}
              onValueChange={() => setShowPosts(!showPosts)}
              style={tw`ml-2`}
            />
          </View>
        </View>

        {/* Contact Preferences Section */}
        {showContactPreferences && (
          <View style={tw`w-full p-4 bg-gray-100 rounded-lg mb-6`}>
            <Text style={tw`text-xl font-bold mb-4`}>Contact Preferences</Text>
            {contactOptions.map((option) => (
              <View key={option} style={tw`flex-row justify-between mb-4`}>
                <Text style={tw`text-base`}>{option}</Text>
                <Text style={tw`text-base`}>
                  {contactPreferences.includes(option) ? "Yes" : "No thanks"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Business Information */}
        {showBusiness && business && (
          <BusinessInformation business={business} />
        )}

        {/* Follow/Unfollow Button */}
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

        {/* User Posts */}
        {showPosts && (
          <View style={tw`mt-8 w-full`}>
            <Text style={tw`text-xl font-bold text-gray-800 mb-4 text-center`}>
              Posts
            </Text>
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
        )}
      </View>
    </ScrollView>
  );
};

export default UserProfileScreen;
