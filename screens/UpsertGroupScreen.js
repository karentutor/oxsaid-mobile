import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // For image upload
import { axiosBase } from "../services/BaseService";
import tw from "../lib/tailwind"; // Adjust based on your Tailwind setup
import useAuth from "../hooks/useAuth"; // To get the auth token
import FilterModal from "../components/ui/FilterModal"; // Import FilterModal
import geoData from "../data/geoDataSorted"; // Your geoData with country information

const UpsertGroupScreen = ({ route, navigation }) => {
  const { groupId } = route.params || {}; // Get groupId if passed for editing
  const { auth } = useAuth(); // Get authentication info

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [isPrivate, setIsPrivate] = useState(false); // Default to false
  const [groupCoverImage, setGroupCoverImage] = useState(null); // For image upload
  //   const [countryModalVisible, setCountryModalVisible] = useState(false); // Modal state
  const [isUserModalVisible, setIsUserModalVisible] = useState(false); // For inviting users
  const [users, setUsers] = useState([]); // All users fetched from API
  const [selectedUsers, setSelectedUsers] = useState([]); // Users selected for the invite
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Fetch users from the backend used for create
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosBase.get("/users", {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [auth.access_token]);

  // Fetch group details if editing an existing group
  useEffect(() => {
    if (groupId) {
      const fetchGroupDetails = async () => {
        try {
          const response = await axiosBase.get(`/groups/group/${groupId}`, {
            headers: { Authorization: `Bearer ${auth.access_token}` },
          });
          const {
            name,
            description,
            country,
            isPrivate,
            groupCoverImage,
            groupMembers,
          } = response.data.group;

          // Pre-populate the form fields with the fetched group data
          setName(name || "");
          setDescription(description || "");
          setCountry(country || "");
          setIsPrivate(isPrivate || false);
          setGroupCoverImage(groupCoverImage || null);
          setSelectedUsers(groupMembers || []); // Set the selected users
        } catch (error) {
          console.error("Error fetching group details:", error);
        }
      };
      fetchGroupDetails(); // Call the function when groupId is present
    }
  }, [groupId, auth.access_token]);

  const handleSelectUser = (selectedUser) => {
    const foundUser = users.find(
      (user) => `${user.firstName} ${user.lastName}` === selectedUser
    );
    if (
      foundUser &&
      !selectedUsers.some((user) => user._id === foundUser._id)
    ) {
      setSelectedUsers([...selectedUsers, foundUser]);
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user._id !== userId));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setGroupCoverImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name || !description) {
      Alert.alert("Error", "Name and description are required");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    const groupMembers = selectedUsers.map((user) => user._id).join(",");
    formData.append("name", name);
    formData.append("description", description);
    formData.append("country", country);
    formData.append("isPrivate", isPrivate);
    formData.append("groupMembers", groupMembers);
    if (groupCoverImage) {
      const fileType = groupCoverImage.split(".").pop();
      formData.append("groupCoverImage", {
        uri: groupCoverImage,
        name: `groupCoverImage.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    try {
      if (groupId) {
        // Update group
        response = await axiosBase.put(`/groups/${groupId}/update`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${auth.access_token}`,
          },
        });
        Alert.alert("Success", "Group updated successfully");
      } else {
        // Create group
        response = await axiosBase.post("/groups", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${auth.access_token}`,
          },
        });
        Alert.alert("Success", "Group created successfully");
      }
      navigation.goBack(); // Navigate back after success
    } catch (error) {
      console.error("Error submitting group form:", error);
      Alert.alert("Error", "Failed to submit group form");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FlatList
      data={[]}
      ListHeaderComponent={
        <>
          <View style={tw`p-4 bg-gray-100 rounded-lg mt-4`}>
            <Text style={tw`text-2xl font-bold mb-4`}>
              {groupId ? "Edit Group" : "Create New Group"}
            </Text>

            {isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <>
                {/* Group Name Input */}
                <TextInput
                  placeholder="Group Name"
                  value={name}
                  onChangeText={setName}
                  style={tw`border p-2 mb-4`}
                />

                {/* Group Description Input */}
                <TextInput
                  placeholder="Group Description"
                  value={description}
                  onChangeText={setDescription}
                  style={tw`border p-2 mb-4 h-32`}
                  multiline={true}
                  numberOfLines={5}
                  textAlignVertical="top"
                />

                {/* Group Cover Image Section */}
                <Text style={tw`mb-2 font-bold`}>Group Cover Image</Text>
                {groupCoverImage ? (
                  <View style={tw`mb-4`}>
                    <Image
                      source={{ uri: groupCoverImage }}
                      style={{ width: 200, height: 200, resizeMode: "cover" }}
                    />
                    <View style={tw`flex-row justify-between mt-2`}>
                      <TouchableOpacity
                        style={tw`bg-yellow-500 p-2 rounded`}
                        onPress={pickImage}
                      >
                        <Text style={tw`text-white`}>Update Image</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={tw`bg-red-500 p-2 rounded`}
                        onPress={() => setGroupCoverImage(null)}
                      >
                        <Text style={tw`text-white`}>Delete Image</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={tw`border p-2 mb-4`}
                    onPress={pickImage}
                  >
                    <Text>Select Image</Text>
                  </TouchableOpacity>
                )}

                {/* Invite Members Section */}
                <Text style={tw`text-xl font-bold mb-4`}>Invite Members</Text>
                <TouchableOpacity
                  style={tw`bg-blue-500 p-3 mb-4 rounded-lg`}
                  onPress={() => setIsUserModalVisible(true)}
                >
                  <Text style={tw`text-white text-center`}>
                    Search and Invite Users
                  </Text>
                </TouchableOpacity>
                <FilterModal
                  key="user-filter-modal"
                  visible={isUserModalVisible}
                  onClose={() => setIsUserModalVisible(false)}
                  data={users.map(
                    (user) => `${user.firstName} ${user.lastName}`
                  )}
                  onSelect={handleSelectUser}
                  selectedValue={null}
                />

                {/* Selected Users Display */}
                <Text style={tw`text-lg font-bold mb-2`}>Selected Users:</Text>
                {selectedUsers && selectedUsers.length > 0 ? (
                  <FlatList
                    data={selectedUsers}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                      <View
                        style={tw`flex-row justify-between items-center p-2 border-b`}
                      >
                        <Text>
                          {item.firstName} {item.lastName}
                        </Text>
                        <TouchableOpacity
                          style={tw`bg-red-500 p-2 rounded`}
                          onPress={() => handleRemoveUser(item._id)}
                        >
                          <Text style={tw`text-white`}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                ) : (
                  <Text style={tw`text-gray-500`}>No users selected</Text>
                )}

                {/* Create or Update Group Button */}
                <TouchableOpacity
                  style={tw`bg-blue-500 p-3 mt-4 rounded-lg`}
                  onPress={handleSubmit}
                >
                  <Text style={tw`text-white text-center`}>
                    {groupId ? "Update Group" : "Create Group"}
                  </Text>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                  style={tw`bg-red-500 p-3 mt-4 rounded-lg`}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={tw`text-white text-center`}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      }
    />
  );

  //   return (
  //     <FlatList
  //       data={[]}
  //       ListHeaderComponent={
  //         <>
  //           <View style={tw`p-4 bg-gray-100 rounded-lg mt-4`}>
  //             <Text style={tw`text-2xl font-bold mb-4`}>
  //               {groupId ? "Edit Group" : "Create New Group"}
  //             </Text>

  //             {isLoading ? (
  //               <ActivityIndicator size="large" color="#0000ff" />
  //             ) : (
  //               <>
  //                 <TextInput
  //                   placeholder="Group Name"
  //                   value={name}
  //                   onChangeText={setName}
  //                   style={tw`border p-2 mb-4`}
  //                 />
  //                 <TextInput
  //                   placeholder="Group Description"
  //                   value={description}
  //                   onChangeText={setDescription}
  //                   style={tw`border p-2 mb-4 h-32`}
  //                   multiline={true}
  //                   numberOfLines={5}
  //                   textAlignVertical="top"
  //                 />
  //                 <Text style={tw`mb-2 font-bold`}>Group Cover Image</Text>
  //                 {groupCoverImage ? (
  //                   <View style={tw`mb-4`}>
  //                     <Image
  //                       source={{ uri: groupCoverImage }}
  //                       style={{ width: 200, height: 200, resizeMode: "cover" }}
  //                     />
  //                     <View style={tw`flex-row justify-between mt-2`}>
  //                       <TouchableOpacity
  //                         style={tw`bg-yellow-500 p-2 rounded`}
  //                         onPress={pickImage}
  //                       >
  //                         <Text style={tw`text-white`}>Update Image</Text>
  //                       </TouchableOpacity>
  //                       <TouchableOpacity
  //                         style={tw`bg-red-500 p-2 rounded`}
  //                         onPress={() => setGroupCoverImage(null)}
  //                       >
  //                         <Text style={tw`text-white`}>Delete Image</Text>
  //                       </TouchableOpacity>
  //                     </View>
  //                   </View>
  //                 ) : (
  //                   <TouchableOpacity
  //                     style={tw`border p-2 mb-4`}
  //                     onPress={pickImage}
  //                   >
  //                     <Text>Select Image</Text>
  //                   </TouchableOpacity>
  //                 )}

  //                 <Text style={tw`text-xl font-bold mb-4`}>Invite Members</Text>
  //                 <TouchableOpacity
  //                   style={tw`bg-blue-500 p-3 mb-4 rounded-lg`}
  //                   onPress={() => setIsUserModalVisible(true)}
  //                 >
  //                   <Text style={tw`text-white text-center`}>
  //                     Search and Invite Users
  //                   </Text>
  //                 </TouchableOpacity>
  //                 <FilterModal
  //                   key="user-filter-modal"
  //                   visible={isUserModalVisible}
  //                   onClose={() => setIsUserModalVisible(false)}
  //                   data={users.map(
  //                     (user) => `${user.firstName} ${user.lastName}`
  //                   )}
  //                   onSelect={handleSelectUser}
  //                   selectedValue={null}
  //                 />
  //                 <Text style={tw`text-lg font-bold mb-2`}>Selected Users:</Text>
  //                 {selectedUsers && selectedUsers.length > 0 ? (
  //                   <FlatList
  //                     data={selectedUsers}
  //                     keyExtractor={(item) => item._id}
  //                     renderItem={({ item }) => (
  //                       <View
  //                         style={tw`flex-row justify-between items-center p-2 border-b`}
  //                       >
  //                         <Text>
  //                           {item.firstName} {item.lastName}
  //                         </Text>
  //                         <TouchableOpacity
  //                           style={tw`bg-red-500 p-2 rounded`}
  //                           onPress={() => handleRemoveUser(item._id)}
  //                         >
  //                           <Text style={tw`text-white`}>Remove</Text>
  //                         </TouchableOpacity>
  //                       </View>
  //                     )}
  //                   />
  //                 ) : (
  //                   <Text style={tw`text-gray-500`}>No users selected</Text>
  //                 )}

  //                 {/* {selectedUsers.length > 0 ? (
  //                   <FlatList
  //                     data={selectedUsers}
  //                     keyExtractor={(item) => item._id}
  //                     renderItem={({ item }) => (
  //                       <View
  //                         style={tw`flex-row justify-between items-center p-2 border-b`}
  //                       >
  //                         <Text>
  //                           {item.firstName} {item.lastName}
  //                         </Text>
  //                         <TouchableOpacity
  //                           style={tw`bg-red-500 p-2 rounded`}
  //                           onPress={() => handleRemoveUser(item._id)}
  //                         >
  //                           <Text style={tw`text-white`}>Remove</Text>
  //                         </TouchableOpacity>
  //                       </View>
  //                     )}
  //                   />
  //                 ) : (
  //                   <Text style={tw`text-gray-500`}>No users selected</Text>
  //                 )} */}
  //                 <TouchableOpacity
  //                   style={tw`bg-blue-500 p-3 mt-4 rounded-lg`}
  //                   onPress={handleSubmit}
  //                 >
  //                   <Text style={tw`text-white text-center`}>
  //                     {groupId ? "Update Group" : "Create Group"}
  //                   </Text>
  //                 </TouchableOpacity>
  //                 <TouchableOpacity
  //                   style={tw`bg-red-500 p-3 mt-4 rounded-lg`}
  //                   onPress={() => navigation.goBack()}
  //                 >
  //                   <Text style={tw`text-white text-center`}>Cancel</Text>
  //                 </TouchableOpacity>
  //               </>
  //             )}
  //           </View>
  //         </>
  //       }
  //     />
  //   );
};

export default UpsertGroupScreen;
