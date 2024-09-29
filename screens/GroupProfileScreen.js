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
  const [hasRequestedJoin, setHasRequestedJoin] = useState(false);
  const [hasDeclined, setHasDeclined] = useState(false);

  const { auth } = useAuth();
  const access_token = auth.access_token;

  const getUserMembershipState = (userId, group) => {
    if (group.adminMembers.some((admin) => admin._id === userId)) {
      return "Admin";
    } else if (group.groupMembers.some((member) => member._id === userId)) {
      return "Member";
    } else if (
      group.declinedMembers.some((declined) => declined._id === userId)
    ) {
      return "Declined";
    } else if (group.invitedMembers.some((invited) => invited._id === userId)) {
      return "Invited";
    } else if (
      group.requestJoinMembers.some((requester) => requester._id === userId)
    ) {
      return "Requested to Join";
    } else if (group.ignoredMembers.some((ignored) => ignored._id === userId)) {
      return "Ignored";
    } else {
      return "Not Involved";
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await axiosBase.put(
        `/groups/${groupId}/leave`,
        {},
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      if (response.data.isSuccess) {
        Alert.alert("Group Left", "You have successfully left the group.");
        setIsMember(false); // Update state to reflect that the user is no longer a member
        fetchGroup();
      } else {
        Alert.alert("Error", response.data.msg);
      }
    } catch (error) {
      console.log("Error leaving group:", error.message);
      Alert.alert("Error", "Could not leave the group.");
    }
  };

  const handleUserPress = (userId) => {
    navigation.navigate("UserProfileScreen", { userId }); // Navigate to UserProfile
  };

  const handleRequestToJoin = async () => {
    try {
      const response = await axiosBase.put(
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
        setHasRequestedJoin(true); // Update state immediately
        // Remove fetchGroup() to avoid overwriting the state
      } else {
        Alert.alert("Error", response.data.msg);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        Alert.alert("Error", "You have already requested to join this group.");
        setHasRequestedJoin(true); // Even on error, make sure the state reflects this
      } else {
        console.log("Error requesting to join group:", error.message);
        Alert.alert("Error", "Could not request to join the group.");
      }
    }
  };

  const handleAcceptInvitation = async () => {
    try {
      const response = await axiosBase.put(
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

  const onDeleteGroup = async () => {
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

  const handleDeleteGroup = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this group?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDeleteGroup },
      ]
    );
  };

  const handleEditGroup = () => {
    navigation.navigate("UpsertGroupScreen", { groupId }); // Navigate to EditGroupScreen
  };

  // Fetch group details
  const fetchGroup = async () => {
    setLoading(true);
    try {
      const response = await axiosBase.get(`/groups/${groupId}/group`, {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });

      const groupData = response.data.group;
      setGroup(groupData);

      // Determine user membership state
      const userMembershipState = getUserMembershipState(
        auth.user._id,
        groupData
      );

      // Log the user membership state for debugging
      console.log("User membership state:", userMembershipState);

      // Update state based on membership state
      setIsMember(userMembershipState === "Member");
      setIsMemberAdmin(userMembershipState === "Admin");
      setIsInvited(userMembershipState === "Invited");
      setHasRequestedJoin(userMembershipState === "Requested to Join");
      setHasDeclined(userMembershipState === "Declined");
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

  const handleAcceptJoinRequest = async (userId) => {
    try {
      const response = await axiosBase.put(
        `/groups/${groupId}/accept-join-request/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      if (response.data.isSuccess) {
        Alert.alert(
          "Success",
          "User has been successfully added to the group."
        );
        fetchGroup(); // Refresh group data
      } else {
        Alert.alert("Error", response.data.msg);
      }
    } catch (error) {
      console.error("Error accepting join request:", error.message);
      Alert.alert("Error", "Could not accept join request.");
    }
  };

  const handleIgnoreJoinRequest = async (userId) => {
    try {
      const response = await axiosBase.put(
        `/groups/${groupId}/ignore-join-request/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      if (response.data.isSuccess) {
        Alert.alert("Success", "User join request has been ignored.");
        fetchGroup(); // Refresh group data
      } else {
        Alert.alert("Error", response.data.msg);
      }
    } catch (error) {
      console.error("Error ignoring join request:", error.message);
      Alert.alert("Error", "Could not ignore join request.");
    }
  };

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

  // Render buttons based on the user’s state
  const renderButtons = () => {
    if (isMember || isMemberAdmin) {
      // If the user is already a member or admin, they should not see join/invite buttons
      return (
        !isMemberAdmin && (
          <TouchableOpacity
            onPress={handleLeaveGroup}
            style={tw`bg-red-500 py-2 px-6 rounded-lg mt-4 mx-auto`}
          >
            <Text style={tw`text-white text-center text-lg`}>Leave Group</Text>
          </TouchableOpacity>
        )
      );
    } else {
      if (hasDeclined) {
        return (
          <TouchableOpacity
            disabled
            style={tw`bg-gray-500 py-2 px-6 rounded-lg mt-4 mx-auto`}
          >
            <Text style={tw`text-white text-center text-lg`}>You Declined</Text>
          </TouchableOpacity>
        );
      }
      if (isInvited) {
        return (
          <TouchableOpacity
            onPress={handleAcceptInvitation}
            style={tw`bg-green-500 py-2 px-6 rounded-lg mt-4 mx-auto`}
          >
            <Text style={tw`text-white text-center text-lg`}>
              Accept Invitation
            </Text>
          </TouchableOpacity>
        );
      }
      if (hasRequestedJoin) {
        return (
          <TouchableOpacity
            disabled
            style={tw`bg-gray-500 py-2 px-6 rounded-lg mt-4 mx-auto`}
          >
            <Text style={tw`text-white text-center text-lg`}>Request Sent</Text>
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          onPress={handleRequestToJoin}
          style={tw`bg-blue-500 py-2 px-6 rounded-lg mt-4 mx-auto`}
        >
          <Text style={tw`text-white text-center text-lg`}>
            Request to Join
          </Text>
        </TouchableOpacity>
      );
    }
  };

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

      {/* Call renderButtons here */}
      {renderButtons()}

      {/* Render Join Requests */}
      {renderJoinRequests()}
      {/* Post Box */}
      {(isMember || isMemberAdmin) && (
        <PostBox onPost={handlePost} onCancel={() => console.log("Canceled")} />
      )}
    </>
  );

  const renderJoinRequests = () => {
    if (!isMemberAdmin || group.requestJoinMembers.length === 0) {
      return null; // Only show if the user is an admin and there are join requests
    }

    return (
      <View style={tw`mt-6`}>
        <Text style={tw`text-xl font-bold mb-4 text-center`}>
          Join Requests
        </Text>
        {group.requestJoinMembers.map((member, index) => (
          <View
            key={index}
            style={tw`flex-row justify-between items-center mb-4 mx-6`}
          >
            <Text style={tw`text-lg`}>
              {member.firstName} {member.lastName}
            </Text>
            <View style={tw`flex-row`}>
              <TouchableOpacity
                onPress={() => handleAcceptJoinRequest(member._id)}
                style={tw`bg-green-500 py-2 px-4 rounded-lg mr-2`}
              >
                <Text style={tw`text-white`}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleIgnoreJoinRequest(member._id)}
                style={tw`bg-gray-500 py-2 px-4 rounded-lg`}
              >
                <Text style={tw`text-white`}>Ignore</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={() => <>{renderGroupDetails()}</>}
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
