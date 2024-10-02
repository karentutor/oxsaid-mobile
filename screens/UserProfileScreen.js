// UserProfileScreen.js

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
  const { user: initialUser } = route.params || {}; // Check if 'user' is passed
  const { userId } = route.params || {}; // Check if 'userId' is passed
  const { auth } = useAuth(); // The authenticated user
  const [user, setUser] = useState(initialUser || null); // Set 'user' if passed, otherwise set to null
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contactPreferences, setContactPreferences] = useState([]); // State for contact preferences
  const [business, setBusiness] = useState([]);
  const [showBusiness, setShowBusiness] = useState(false);
  const [posts, setPosts] = useState([]); // State to store user posts
  const navigation = useNavigation();
  const [showPosts, setShowPosts] = useState(false); // State to toggle post display
  const [showContactPreferences, setShowContactPreferences] = useState(true);

  // Fetch user if only userId is available
  useEffect(() => {
    const fetchUser = async () => {
      if (!user && userId) {
        try {
          const response = await axiosBase.get(`/users/${userId}`, {
            headers: { Authorization: `Bearer ${auth.access_token}` },
          });
          setUser(response.data.user); // Set the fetched user data to state
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUser(); // Fetch the user if necessary
  }, [userId, auth.access_token]);

  // Fetch contact preferences
  useEffect(() => {
    if (!user || !user._id) return; // Prevent further execution if user is null

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
  }, [user, auth.access_token]);

  // Check connection with the user and fetch posts
  useEffect(() => {
    if (!user || !user._id) return; // Ensure user is defined before making API calls

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
  }, [auth.user._id, auth.access_token, user]);

  // Function to fetch user's posts
  const fetchUserPosts = async () => {
    if (!user || !user._id) return; // Ensure user is defined before making API calls

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

  // Ensure that all calls using user._id are protected
  const handleConnect = async () => {
    if (!user || !user._id) return; // Ensure user is defined before making API calls

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
    if (!user || !user._id) return; // Ensure user is defined before making API calls

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

  // Fetch business information
  useEffect(() => {
    if (!user || !user._id || !auth.access_token) return; // Ensure user is defined

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

    fetchBusiness(); // Fetch business data when component mounts or dependencies change
  }, [user, auth.access_token]); // Dependency array to rerun the effect if user or access_token changes

  const handleChat = async () => {
    if (!user || !user._id) {
      Alert.alert("Error", "User data is missing.");
      return;
    }

    try {
      const payload = {
        fromId: auth.user._id,
        toIds: [user._id], // Single recipient for private chat
      };

      const response = await axiosBase.post("/chats", payload, {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });

      const chat = response.data;

      if (!chat || !chat._id) {
        throw new Error("Failed to create or retrieve valid chat.");
      }

      // Set chatName to the other user's full name
      const chatName = `${user.firstName} ${user.lastName}`;

      navigation.navigate("ChatScreen", {
        initialChatId: chat._id,
        initialChatName: chatName,
        initialOtherUser: user,
      });
    } catch (error) {
      console.error("Error creating or retrieving chat:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create or retrieve chat."
      );
    }
  };

  const handleEmail = () => {
    navigation.navigate("EmailScreen", { user });
  };

  return (
    <ScrollView style={tw`flex-1 p-4 bg-white`}>
      {user && user._id ? (
        <View style={tw`items-center`}>
          {/* User Profile Header */}
          <Text style={tw`text-3xl font-bold text-primary500 mb-6`}>
            Profile
          </Text>

          {/* User Picture */}
          {user.picturePath ? (
            <Image
              source={{ uri: user.picturePath }}
              style={tw`w-40 h-40 rounded-full mb-4 shadow-lg`}
            />
          ) : (
            <View
              style={tw`w-40 h-40 rounded-full bg-gray-300 mb-4 shadow-lg`}
            />
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

          {/* Follow/Unfollow Button */}
          {!loading && (
            <>
              {/* Chat and Email Buttons */}
              <View style={tw`flex-row justify-center mt-6`}>
                <TouchableOpacity
                  onPress={handleChat}
                  style={tw`bg-blue-500 rounded-lg p-2 w-1/2 mr-2`}
                >
                  <Text style={tw`text-white text-center`}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleEmail}
                  style={tw`bg-secondary500 rounded-lg p-2 w-1/2`}
                >
                  <Text style={tw`text-center`}>Email</Text>
                </TouchableOpacity>
              </View>

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
            </>
          )}

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
              <Text style={tw`text-xl font-bold mb-4`}>
                Contact Preferences
              </Text>
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

          {/* User Posts */}
          {showPosts && (
            <View style={tw`mt-8 w-full`}>
              <Text
                style={tw`text-xl font-bold text-gray-800 mb-4 text-center`}
              >
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
      ) : (
        <Text style={tw`text-center mt-8 text-gray-600`}>
          Loading user data...
        </Text>
      )}
    </ScrollView>
  );
};

export default UserProfileScreen;
