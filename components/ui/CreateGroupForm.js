import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Alert,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // For image upload
import { axiosBase } from "../../services/BaseService";
import tw from "../../lib/tailwind"; // Adjust based on your Tailwind setup
import useAuth from "../../hooks/useAuth"; // To get the auth token
import FilterModal from "./FilterModal"; // Import FilterModal
import geoData from "../../data/geoDataSorted"; // Your geoData with country information

const CreateGroupForm = ({ onClose }) => {
  const { auth } = useAuth(); // Get authentication info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [isPrivate, setIsPrivate] = useState(false); // Default to false
  const [groupCoverImage, setGroupCoverImage] = useState(null); // For image upload
  const [countryModalVisible, setCountryModalVisible] = useState(false); // Modal state

  // Function to handle image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setGroupCoverImage(result.uri);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!name || !description) {
      Alert.alert("Error", "Name and description are required");
      return;
    }

    const formData = new FormData();

    // Append form data fields
    formData.append("name", name);
    formData.append("description", description);
    formData.append("country", country);
    formData.append("isPrivate", isPrivate);

    if (groupCoverImage) {
      // Append image if selected
      const fileType = groupCoverImage.split(".").pop();
      formData.append("groupCoverImage", {
        uri: groupCoverImage,
        name: `groupCoverImage.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    try {
      const response = await axiosBase.post("/groups", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth.access_token}`,
        },
      });

      Alert.alert("Success", "Group created successfully");
      onClose(); // Close the form after success
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "Failed to create group");
    }
  };

  return (
    <ScrollView style={tw`p-4 bg-gray-100 rounded-lg mt-4`}>
      <Text style={tw`text-2xl font-bold mb-4`}>Create New Group</Text>

      {/* Name Input */}
      <TextInput
        placeholder="Group Name"
        value={name}
        onChangeText={setName}
        style={tw`border p-2 mb-4`}
      />

      {/* Description Input */}
      <TextInput
        placeholder="Group Description"
        value={description}
        onChangeText={setDescription}
        style={tw`border p-2 mb-4`}
      />

      {/* Country Input */}
      <Text style={tw`mb-2 font-bold`}>Country</Text>
      <TouchableOpacity
        style={tw`border p-2 mb-4`}
        onPress={() => setCountryModalVisible(true)}
      >
        <Text>{country ? country : "Select country"}</Text>
      </TouchableOpacity>

      {/* FilterModal for Country */}
      <FilterModal
        key="country-filter-modal"
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        data={Object.keys(geoData)} // geoData for country selection
        onSelect={setCountry}
        selectedValue={country}
      />

      {/* Image Upload (Left Justified) */}
      <TouchableOpacity style={tw`border p-2 mb-4`} onPress={pickImage}>
        <Text>Select Cover Image</Text>
      </TouchableOpacity>

      {groupCoverImage && (
        <Image source={{ uri: groupCoverImage }} style={tw`w-full h-40 mt-4`} />
      )}

      {/* Private/Global Toggle */}
      {/* <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text>Private Group?</Text>
        <Switch
          value={isPrivate}
          onValueChange={() => setIsPrivate(!isPrivate)}
        />
      </View>  */}

      {/* Submit Button */}
      <TouchableOpacity
        style={tw`bg-blue-500 p-3 mt-4 rounded-lg`}
        onPress={handleSubmit}
      >
        <Text style={tw`text-white text-center`}>Create Group</Text>
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={tw`bg-red-500 p-3 mt-4 rounded-lg`}
        onPress={onClose}
      >
        <Text style={tw`text-white text-center`}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateGroupForm;
