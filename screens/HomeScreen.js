import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import useAuth from "../hooks/useAuth";
import PostBox from "../components/ui/PostBox";
import PostCard from "../components/ui/PostCard";
import BusinessInformation from "../components/ui/BusinessInformation"; // Import BusinessInformation component
import { axiosBase } from "../services/BaseService";
import { useNavigation } from "@react-navigation/native";
import tw from "../lib/tailwind";

function HomeScreen() {
  const { auth } = useAuth();
  const { access_token, user } = auth;
  const [posts, setPosts] = useState([]);
  const [business, setBusiness] = useState(null); // State to store user's business
  const navigation = useNavigation();
  const [showBusinessInfo, setShowBusinessInfo] = useState(false); // State for toggling Business info

  // Fetch posts and business information when the component mounts
  useEffect(() => {
    fetchPosts();
    fetchBusiness();
  }, []);

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

      const allPosts = [
        ...ownPostsResponse.data,
        ...followedPostsResponse.data,
      ];
      allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(allPosts);
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
    navigation.navigate("CreateBusiness", { userId: user._id });
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

            {/* Display user's occupation directly under their name */}
            <Text style={tw`text-sm text-gray-500 mb-2`}>
              {user.occupation}
            </Text>

            {/* Conditionally render business information or prompt to add work */}
            {business && business.businessName && business.businessDetail ? (
              <>
                {/* Always show Business Name */}
                <Text style={tw`text-lg font-bold mb-2 text-gray-700`}>
                  {business.businessName.name}
                </Text>

                {/* Show Business/Hide Business toggle */}
                <TouchableOpacity
                  onPress={() => setShowBusinessInfo(!showBusinessInfo)}
                >
                  <Text style={tw`text-center text-blue-500 mb-2 text-base`}>
                    {showBusinessInfo ? "Hide Business" : "Show Business"}
                  </Text>
                </TouchableOpacity>

                {/* Update Business text */}
                <TouchableOpacity onPress={handleUnlinkBusiness}>
                  <Text
                    style={tw`text-red-500 text-base font-bold text-sm mb-5`}
                  >
                    Update Business
                  </Text>
                </TouchableOpacity>

                {/* Business Information Card */}
                {showBusinessInfo && (
                  <BusinessInformation business={business} />
                )}
              </>
            ) : (
              <View style={tw`items-center mt-4`}>
                <Text style={tw`text-base text-gray-700 mt-2`}>
                  Where do you Work?
                </Text>
                <TouchableOpacity
                  style={tw`mt-2 bg-red-500 px-2 py-1 rounded-lg`}
                  onPress={handleCreateBusiness}
                >
                  <Text style={tw`text-white text-lg font-bold`}>My Work</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <Text>No User ID</Text>
        )}

        <PostBox onPost={handlePost} onCancel={() => {}} />

        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={fetchPosts} />
          ))
        ) : (
          <Text>No posts to display</Text>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

export default HomeScreen;
