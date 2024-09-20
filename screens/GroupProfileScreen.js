import React, { useCallback, useState } from "react";
import {
  Alert,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import PostBox from "../components/ui/PostBox";
import PostCard from "../components/ui/PostCard";
import { axiosBase } from "../services/BaseService";
import useAuth from "../hooks/useAuth";
import tw from "../lib/tailwind";

const GroupProfileScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { groupId } = params;
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]); // State to store posts
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState(false); // Track if user is a member
  const [isMemberAdmin, setIsMemberAdmin] = useState(false); // Track if user is an admin
  const [isInvited, setIsInvited] = useState(false); // Track if user is invited

  const { auth } = useAuth();
  const access_token = auth.access_token;

  const handleUserPress = (userId) => {
    navigation.navigate("UserProfileScreen", { userId }); // Navigate to UserProfile
  };

  const handleRequestToJoin = async () => {
    try {
      const response = await axiosBase.post(
        `/groups/${groupId}/request-join`,
        {},
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      if (response.data.isSuccess) {
        Alert.alert(
          "Request Sent",
          "Your request to join the group has been sent."
        );
        // Optionally refresh the group data after sending the request
        fetchGroup();
      } else {
        Alert.alert("Error", response.data.msg);
      }
    } catch (error) {
      console.error("Error requesting to join group:", error.message);
      Alert.alert("Error", "Could not request to join the group.");
    }
  };

  const handleAcceptInvitation = async () => {
    try {
      const response = await axiosBase.post(
        `/groups/${groupId}/accept-invite`,
        {},
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      if (response.data.isSuccess) {
        Alert.alert("Success", "You have successfully joined the group.");
        setIsMember(true); // Update the state to mark the user as a member
        fetchGroup(); // Optionally refresh the group data after accepting the invite
      } else {
        Alert.alert("Error", response.data.msg);
      }
    } catch (error) {
      console.error("Error accepting invitation:", error.message);
      Alert.alert("Error", "Could not accept the invitation.");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const response = await axiosBase.delete(`/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (response.data.isSuccess) {
        Alert.alert("Group deleted", "The group was deleted successfully.");
        navigation.navigate("Groups");
        // fetchGroup(); // Re-fetch the groups after deletion
      } else {
        Alert.alert("Error", response.data.msg);
      }
    } catch (error) {
      console.error("Error deleting group:", error.message);
      Alert.alert("Error deleting group", error.message);
    }
  };

  const handleEditGroup = () => {
    navigation.navigate("UpsertGroupScreen", { groupId }); // Navigate to EditGroupScreen
  };

  // Fetch group details
  const fetchGroup = async () => {
    setLoading(true);
    try {
      const response = await axiosBase.get(`/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });

      setIsMember(response.data.isMember); // Check if user is a member
      setIsMemberAdmin(response.data.isAdmin); // Check if user is an admin
      setGroup(response.data.group);
      setIsInvited(response.data.isInvited); // Check if user has an invite
    } catch (error) {
      console.error("Error fetching group details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch group posts

  const fetchGroupPosts = async () => {
    try {
      setLoading(true); // Set loading to true before data fetch
      const response = await axiosBase.get(`/groups/${groupId}/posts`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setPosts(response.data.posts);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Gracefully handle the case where there are no posts (404 error)
        setPosts([]); // Set an empty post array
      } else {
        console.error("Error fetching group posts:", error.message);
        Alert.alert("Error", "Could not fetch posts.");
      }
    } finally {
      setLoading(false); // Ensure loading is turned off
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroup(); // This will be called when the screen comes into focus
      fetchGroupPosts();
    }, [groupId, auth.access_token])
  );

  const handlePost = async ({ text, image }) => {
    try {
      const formData = new FormData();
      formData.append("userId", auth.user._id);
      formData.append("description", text);
      formData.append("groupId", groupId); // Include group ID in the post

      if (image) {
        const fileName = image.split("/").pop();
        const fileType = fileName.split(".").pop();
        formData.append("picture", {
          uri: image,
          name: fileName,
          type: `image/${fileType}`,
        });
      }

      await axiosBase.post(`/groups/${groupId}/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${access_token}`,
        },
      });

      fetchGroupPosts(); // Refresh posts after successful submission
    } catch (err) {
      Alert.alert("Error creating post", err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await axiosBase.delete(`/groups/posts/${postId}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (response.status === 200) {
        // Check the status code instead of isSuccess
        fetchGroupPosts(); // Refresh posts after deletion
        Alert.alert("Post deleted", "The post was deleted successfully.");
      } else {
        Alert.alert("Error", response.data.message); // Use response.data.message
      }
    } catch (err) {
      Alert.alert("Error deleting post", err.message);
    }
  };

  // const handleEditPost = (postId) => {
  //   // Navigate to EditPostScreen with postId
  //   navigation.navigate("EditPostScreen", { postId });
  // };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-lg`}>Loading...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-lg`}>No group data available.</Text>
      </View>
    );
  }

  const isAdmin = group.adminMembers.some(
    (admin) => admin._id === auth.user._id
  );

  const renderGroupDetails = () => (
    <>
      {/* Group Cover Image */}
      {group.groupCoverImage && (
        <Image
          source={{ uri: group.groupCoverImage }}
          style={tw`w-full h-64 rounded-lg mb-4`}
          resizeMode="cover"
        />
      )}

      {/* Group Name */}
      <Text style={tw`text-3xl font-bold mb-2 text-center`}>{group.name}</Text>

      {/* Group Description */}
      {group.description && (
        <Text style={tw`text-lg text-gray-600 mb-4 text-center`}>
          {group.description}
        </Text>
      )}

      {/* Group Country */}
      {group.country && (
        <Text style={tw`text-base text-gray-500 mb-4 text-center`}>
          Country: {group.country}
        </Text>
      )}

      {/* Group Privacy */}
      <Text style={tw`text-base mb-4 text-center`}>
        {group.isPrivate ? "Private Group" : "Public Group"}
      </Text>

      {/* Group Members */}
      <Text style={tw`text-xl font-bold mb-2 text-center`}>Group Members</Text>
      {group.groupMembers.length > 0 ? (
        group.groupMembers.map((member, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleUserPress(member._id)}
          >
            <Text style={tw`text-base text-blue-500 mb-2 text-center`}>
              - {member.firstName} {member.lastName}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={tw`text-base text-gray-500 mb-4 text-center`}>
          No members in this group.
        </Text>
      )}

      {/* Admin Members */}
      <Text style={tw`text-xl font-bold mb-2 text-center`}>Admin Members</Text>
      {group.adminMembers.length > 0 ? (
        group.adminMembers.map((admin, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleUserPress(admin._id)}
          >
            <Text style={tw`text-base text-blue-500 mb-2 text-center`}>
              - {admin.firstName} {admin.lastName}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={tw`text-base text-gray-500 mb-4 text-center`}>
          No admin members in this group.
        </Text>
      )}

      {/* Events Section
      {group.events && group.events.length > 0 && (
        <View>
          <Text style={tw`text-xl font-bold mb-2 text-center`}>Events</Text>
          {group.events.map((event, index) => (
            <Text
              key={index}
              style={tw`text-base text-gray-700 mb-2 text-center`}
            >
              - {event.name}
            </Text>
          ))}
        </View>
      )} */}

      {/* Created At */}
      <Text style={tw`text-base text-gray-400 mt-4 text-center`}>
        Created on: {new Date(group.createdAt).toLocaleDateString()}
      </Text>

      {isAdmin && (
        <View style={tw`flex-row justify-center mt-8`}>
          <TouchableOpacity
            onPress={handleEditGroup}
            style={tw`bg-blue-500 py-2 px-6 rounded-lg mr-4`}
          >
            <Text style={tw`text-white text-center text-lg`}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteGroup}
            style={tw`bg-red-500 py-2 px-6 rounded-lg`}
          >
            <Text style={tw`text-white text-center text-lg`}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Post Box */}
      {(isMember || isMemberAdmin) && (
        <PostBox onPost={handlePost} onCancel={() => console.log("Canceled")} />
      )}
    </>
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={() => (
        <>
          {renderGroupDetails()}

          {/* Accept Invitation, Leave Group, or Request to Join */}
          {!isMember ? (
            isInvited ? (
              <TouchableOpacity
                onPress={handleAcceptInvitation}
                style={tw`bg-green-500 py-2 px-6 rounded-lg mt-4 mx-auto`}
              >
                <Text style={tw`text-white text-center text-lg`}>
                  Accept Invitation
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleRequestToJoin}
                style={tw`bg-blue-500 py-2 px-6 rounded-lg mt-4 mx-auto`}
              >
                <Text style={tw`text-white text-center text-lg`}>
                  Request to Join
                </Text>
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity
              onPress={handleLeaveGroup}
              style={tw`bg-red-500 py-2 px-6 rounded-lg mt-4 mx-auto`}
            >
              <Text style={tw`text-white text-center text-lg`}>
                Leave Group
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onDelete={() => {
            if (isMemberAdmin || item.userId === auth.user._id) {
              handleDeletePost(item._id);
            } else {
              Alert.alert("Permission denied", "You can't delete this post.");
            }
          }}
        />
      )}
    />
  );
};

export default GroupProfileScreen;
