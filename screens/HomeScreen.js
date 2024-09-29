import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
  Image,
  FlatList,
  Switch,
} from "react-native";
import useAuth from "../hooks/useAuth";
import PostBox from "../components/ui/PostBox";
import PostCard from "../components/ui/PostCard";
import GroupListCard from "../components/ui/GroupListCard";
import BusinessInformation from "../components/ui/BusinessInformation"; // Import BusinessInformation component
import { axiosBase } from "../services/BaseService";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import tw from "../lib/tailwind";
import { contactOptions } from "../data";

function HomeScreen() {
  const { auth } = useAuth();
  const { access_token, user } = auth;
  const [posts, setPosts] = useState([]);
  const [business, setBusiness] = useState(null); // State to store user's business
  const navigation = useNavigation();
  const [contactPreferences, setContactPreferences] = useState([]);
  const [showContactPreferences, setShowContactPreferences] = useState(false); // State for toggling Contact Preferences visibility
  const [showPosts, setShowPosts] = useState(true); // State for toggling Posts visibility
  const [showBusinessInfo, setShowBusinessInfo] = useState(false); // State for toggling Business info
  const [groups, setGroups] = useState([]); // State for storing groups
  const [showGroups, setShowGroups] = useState(false); // State for toggling Groups visibility

  // Fetch groups when the screen is in focus
  // Fetch groups function
  const fetchGroups = async () => {
    if (!user?._id) {
      console.log("User ID is not available yet");
      return; // Exit if user ID is not available
    }

    try {
      const response = await axiosBase.get(`/groups/${user._id}/groups`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setGroups(response.data.groups); // Store groups in state
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        if (error.response.status === 404) {
          console.log("No groups found for this user.");
          setGroups([]); // Clear groups if no groups found
        } else {
          console.error(`Error fetching groups: ${error.response.status}`);
          // You can handle other specific status codes here (e.g., 500, 403, etc.)
        }
      } else if (error.request) {
        // Request was made but no response was received
        console.error("No response from server. Please check your network.");
      } else {
        // Something happened in setting up the request that triggered an error
        console.error("Error setting up request:", error.message);
      }
    }
  };

  // Fetch groups when the screen is in focus
  // useFocusEffect(
  //   useCallback(() => {
  //     if (user && access_token) {
  //       fetchGroups(); // Call the function to fetch groups when the screen is focused
  //     }
  //   }, [user, access_token]) // Dependencies
  // );

  useFocusEffect(
    useCallback(() => {
      if (user && access_token && user._id) {
        fetchGroups(); // Call the function to fetch groups when the screen is focused
      }
    }, [user, access_token]) // Dependencies
  );

  const handleDeleteGroup = async (groupId) => {
    try {
      const response = await axiosBase.delete(`/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (response.data.isSuccess) {
        Alert.alert("Group deleted", "The group was deleted successfully.");
        fetchGroups(); // Re-fetch the groups after deletion
      } else {
        Alert.alert("Error", response.data.msg);
      }
    } catch (error) {
      console.error("Error deleting group:", error.message);
      Alert.alert("Error deleting group", error.message);
    }
  };

  const handleEditGroup = (groupId) => {
    navigation.navigate("UpsertGroupScreen", { groupId }); // Navigate to EditGroupScreen
  };

  useEffect(() => {
    fetchPosts();
    fetchBusiness();
    fetchContactPreferences(); // Fetch contact preferences when the component mounts
  }, []);

  const fetchContactPreferences = async () => {
    try {
      const response = await axiosBase.get(`/contact-preferences/${user._id}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      // Update the state with fetched contact preferences (array of types)
      const fetchedPreferences = response.data.map((pref) => pref.type);
      setContactPreferences(fetchedPreferences); // Update contactPreferences state
    } catch (error) {
      console.error("Error fetching contact preferences:", error);
    }
  };

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
        { type: option, contactPreferences: updatedPreferences }, // Ensure type is sent
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      setContactPreferences(updatedPreferences); // Update the state after the change
    } catch (error) {
      console.error("Error updating contact preferences:", error);
    }
  };

  // Add navigation focus listener to refetch business information on screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchBusiness();
    });

    return unsubscribe; // Clean up the listener when the component unmounts
  }, [navigation]);

  const fetchPosts = async () => {
    try {
      const ownPostsResponse = await axiosBase.get("/posts/own", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const followedPostsResponse = await axiosBase.get("/posts/followed", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const groupPostsResponse = await axiosBase.get("/posts/groups", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      // Combine all posts into one array
      const allPosts = [
        ...ownPostsResponse.data,
        ...followedPostsResponse.data,
        ...groupPostsResponse.data,
      ];

      // Create a map of posts by their ID, prioritizing posts with a fully populated groupId.name
      const postsMap = new Map();
      allPosts.forEach((post) => {
        if (!postsMap.has(post._id)) {
          postsMap.set(post._id, post);
        } else {
          const existingPost = postsMap.get(post._id);
          // If the existing post does not have groupId.name, replace it with the new one
          if (
            existingPost.groupId &&
            typeof existingPost.groupId === "string" &&
            post.groupId?.name
          ) {
            postsMap.set(post._id, post); // Replace with the fully populated version
          }
        }
      });

      // Convert the map back into an array
      const uniquePosts = Array.from(postsMap.values());

      // Sort posts by creation date in descending order
      uniquePosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPosts(uniquePosts);
    } catch (err) {
      console.error("Error fetching posts:", err.message);
      Alert.alert("Error fetching posts", err.message);
    }
  };

  const fetchBusiness = async () => {
    try {
      const response = await axiosBase.get(`/users/business/${user._id}`, {
        headers: { Authorization: `Bearer ${access_token}` },
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

  const handleCreateBusiness = () => {
    navigation.navigate("CreateBusinessScreen", { userId: user._id });
  };

  const handlePost = async ({ text, image }) => {
    // console.log("handlePost called with text:", text, "and image:", image);

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

      // console.log("Post created successfully:", response.data);

      fetchPosts();
    } catch (err) {
      // Log the entire error response to understand the conflict
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
        // After deleting, fetch posts again to update the list
        fetchPosts();
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

  const handleUnlinkBusiness = async () => {
    try {
      const response = await axiosBase.put(
        `/users/unlink-business`,
        { userId: user._id },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      setBusiness(null); // Reset the business to null after unlinking
    } catch (error) {
      console.error("Error unlinking business:", error);
      Alert.alert("Error", "Failed to unlink business.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <FlatList
        data={groups} // Main data for the FlatList
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <>
            {/* User Profile Section */}
            <Text style={tw`text-2xl font-bold mb-4 mt-4 text-center`}>
              Home!
            </Text>

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
                <Text style={tw`text-sm text-gray-500 mb-2`}>
                  {user.occupation}
                </Text>

                {/* Preferences Form */}
                <View
                  style={tw`w-full p-4 bg-gray-100 rounded-lg shadow-md mb-8`}
                >
                  <Text style={tw`text-xl font-bold mb-4 text-center`}>
                    Show
                  </Text>

                  {/* Show/Hide Contact Preferences */}
                  <View style={tw`flex-row justify-between items-center mb-4`}>
                    <Text style={tw`text-base text-black`}>
                      Show Contact Preferences
                    </Text>
                    <Switch
                      value={showContactPreferences}
                      onValueChange={() =>
                        setShowContactPreferences(!showContactPreferences)
                      }
                    />
                  </View>

                  {/* Show/Hide Business Info */}
                  <View style={tw`flex-row justify-between items-center mb-4`}>
                    <Text style={tw`text-base text-black`}>
                      Show Business Info
                    </Text>
                    <Switch
                      value={showBusinessInfo}
                      onValueChange={() =>
                        setShowBusinessInfo(!showBusinessInfo)
                      }
                    />
                  </View>

                  {/* Show/Hide Posts */}
                  <View style={tw`flex-row justify-between items-center mb-4`}>
                    <Text style={tw`text-base text-black`}>Show Posts</Text>
                    <Switch
                      value={showPosts}
                      onValueChange={() => setShowPosts(!showPosts)}
                    />
                  </View>

                  {/* Show/Hide Groups */}
                  <View style={tw`flex-row justify-between items-center mb-4`}>
                    <Text style={tw`text-base text-black`}>Show Groups</Text>
                    <Switch
                      value={showGroups}
                      onValueChange={() => setShowGroups(!showGroups)}
                    />
                  </View>
                </View>

                {/* Conditionally Render Business Information */}
                {showBusinessInfo && business && (
                  <>
                    {business.businessName && business.businessName.name ? (
                      <Text style={tw`text-lg font-bold mb-2 text-gray-700`}>
                        {business.businessName.name}
                      </Text>
                    ) : (
                      <Text
                        style={tw`text-lg font-bold mb-2 text-gray-700 mt-8`}
                      >
                        No business name available
                      </Text>
                    )}

                    <TouchableOpacity
                      onPress={handleCreateBusiness}
                      style={tw`bg-red-500 rounded-lg py-2 px-4 mb-8`}
                    >
                      <Text
                        style={tw`text-white text-base font-bold text-center`}
                      >
                        Update Business
                      </Text>
                    </TouchableOpacity>

                    <BusinessInformation business={business} />
                  </>
                )}

                {/* Conditionally Render Posts */}
                {showPosts && (
                  <>
                    <PostBox onPost={handlePost} onCancel={() => {}} />

                    {Array.isArray(posts) && posts.length > 0 ? (
                      posts.map((post) => (
                        <PostCard
                          key={post._id}
                          post={post}
                          onDelete={() => handleDeletePost(post._id)} // Pass handleDeletePost with post._id
                        />
                      ))
                    ) : (
                      <Text>No posts to display</Text>
                    )}
                  </>
                )}
              </View>
            ) : (
              <Text>No User ID</Text>
            )}

            {/* Contact Preferences Form */}
            {showContactPreferences && (
              <View style={tw`w-full p-4 bg-blue-50 rounded-lg mb-6`}>
                {/* Changed background to light yellow */}
                <Text style={tw`text-xl font-bold mb-4 text-center`}>
                  Contact Preferences
                </Text>
                {contactOptions.map((option) => (
                  <View key={option} style={tw`flex-row justify-between mb-4`}>
                    <Text style={tw`text-base`}>{option}</Text>
                    <Switch
                      value={contactPreferences.includes(option)}
                      onValueChange={() => toggleContactPreference(option)}
                    />
                  </View>
                ))}
              </View>
            )}
          </>
        }
        renderItem={({ item }) =>
          showGroups && (
            <GroupListCard
              group={item}
              onPress={() =>
                navigation.navigate("GroupProfileScreen", { groupId: item._id })
              } // Navigate to GroupProfileScreen
              onEdit={() => handleEditGroup(item._id)}
              onDelete={() => handleDeleteGroup(item._id)}
            />
          )
        }
        ListEmptyComponent={showGroups && <Text>No group assigned</Text>}
      />
    </TouchableWithoutFeedback>
  );
}

export default HomeScreen;
