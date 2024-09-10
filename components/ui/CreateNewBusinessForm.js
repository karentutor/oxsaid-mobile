import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView, // Import KeyboardAvoidingView
  Platform, // Import Platform to handle different OS behaviors
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import tw from "../../lib/tailwind";
import FilterModal from "./FilterModal";
import { companysizeData, OCCUPATION_DATA } from "../../data";
import geoData from "../../data/geoDataSorted";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation

const CreateNewBusinessForm = ({
  onSubmit,
  onClose,
  addLocationMode = false, // Default to false
  selectedBusiness = null, // Default to null for creating a new business
}) => {
  const navigation = useNavigation(); // Get navigation prop

  // State for modals visibility
  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [occupationModalVisible, setOccupationModalVisible] = useState(false);
  const [subOccupationModalVisible, setSubOccupationModalVisible] =
    useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  // Form state
  const [name, setName] = useState(selectedBusiness?.businessName?.name || "");
  const [size, setSize] = useState(selectedBusiness?.size || "");
  const [isAlumniOwned, setIsAlumniOwned] = useState(
    selectedBusiness?.isAlumniOwned || false
  );
  const [yearFounded, setYearFounded] = useState(
    selectedBusiness?.yearFounded || ""
  );
  const [occupation, setOccupation] = useState(
    selectedBusiness?.occupation || ""
  );
  const [subOccupation, setSubOccupation] = useState(
    selectedBusiness?.subOccupation || ""
  );
  const [websiteUrl, setWebsiteUrl] = useState(
    selectedBusiness?.websiteUrl || ""
  );
  const [address, setAddress] = useState(selectedBusiness?.address || "");
  const [city, setCity] = useState(selectedBusiness?.city || "");
  const [country, setCountry] = useState(selectedBusiness?.country || "");
  const [phone, setPhone] = useState(selectedBusiness?.phone || "");
  const [email, setEmail] = useState(selectedBusiness?.email || "");
  const [description, setDescription] = useState(
    selectedBusiness?.description || ""
  );
  const [image, setImage] = useState(null);

  // Function to generate a dynamic image name
  const generateImageName = (businessName) => {
    // Remove spaces and special characters from the business name
    const sanitizedBusinessName = businessName
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");

    // Generate a timestamp to ensure uniqueness
    const timestamp = Date.now();

    // Return the dynamically generated file name
    return `${sanitizedBusinessName}_${timestamp}.jpg`;
  };

  // In your handleSubmit function
  const handleSubmit = () => {
    // Append other form fields as usual
    if (!email) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    // Create a new business object
    const businessData = {
      name,
      size,
      isAlumniOwned,
      yearFounded,
      occupation,
      subOccupation,
      websiteUrl,
      address,
      city,
      country,
      phone,
      email,
      description,
    };

    // If an image is selected, include it in the object
    if (image) {
      const imageFile = {
        uri: image,
        type: "image/jpeg", // Adjust based on your image file type
        name: generateImageName(name), // Generate the image file name dynamically
      };
      businessData.image = imageFile;
    }

    // Send the businessData object to the parent component
    onSubmit(businessData);
  };

  // // Handle form submission
  // const handleSubmit = () => {
  //   if (!email) {
  //     Alert.alert("Error", "Please fill in all required fields.");
  //     return;
  //   }

  //   onSubmit({
  //     name,
  //     size,
  //     isAlumniOwned,
  //     yearFounded,
  //     occupation,
  //     subOccupation,
  //     websiteUrl,
  //     picturePath: image,
  //     address,
  //     city,
  //     country,
  //     phone,
  //     email,
  //     description,
  //   });
  // };

  // Function to handle image picking
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera roll access is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior based on platform
    //   style={tw`flex-1`}
    // >
    <ScrollView style={tw`p-4 bg-white`} removeClippedSubviews={true}>
      {/* Display company name when adding a new location */}
      {addLocationMode && selectedBusiness && (
        <Text style={tw`text-xl font-bold text-center mb-4`}>
          Adding a new location to {selectedBusiness.businessName.name}
        </Text>
      )}

      <Text style={tw`text-lg font-bold mb-4`}>
        {addLocationMode ? "Add New Location" : "Create New Business"}
      </Text>

      {/* Business Name (only show when not in addLocationMode) */}
      {!addLocationMode && (
        <>
          <Text style={tw`mb-2 font-bold`}>
            Business Name <Text style={tw`text-red-500`}>*</Text>
          </Text>
          <TextInput
            style={tw`border p-2 mb-4`}
            value={name}
            onChangeText={setName}
            placeholder="Enter business name"
          />
        </>
      )}

      {/* Business Size (only show when not in addLocationMode) */}
      {!addLocationMode && (
        <>
          <Text style={tw`mb-2 font-bold`}>
            Business Size <Text style={tw`text-red-500`}>*</Text>
          </Text>
          <TouchableOpacity
            style={tw`border p-2 mb-4`}
            onPress={() => setSizeModalVisible(true)}
          >
            <Text>{size ? size : "Select business size"}</Text>
          </TouchableOpacity>

          {/* FilterModal for Business Size */}
          <FilterModal
            visible={sizeModalVisible}
            onClose={() => setSizeModalVisible(false)}
            data={companysizeData.map((item) => item.name)}
            onSelect={setSize}
            selectedValue={size}
          />
        </>
      )}

      {/* Alumni Owned (only show when not in addLocationMode) */}
      {!addLocationMode && (
        <>
          <Text style={tw`mb-2 font-bold`}>Majority Alumni Owned</Text>
          <TouchableOpacity
            style={tw`border p-2 mb-4`}
            onPress={() => setIsAlumniOwned(!isAlumniOwned)}
          >
            <Text>{isAlumniOwned ? "Yes" : "No"}</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Year Founded (only show when not in addLocationMode) */}
      {!addLocationMode && (
        <>
          <Text style={tw`mb-2 font-bold`}>
            Year Founded <Text style={tw`text-red-500`}>*</Text>
          </Text>
          <TextInput
            style={tw`border p-2 mb-4`}
            value={yearFounded}
            onChangeText={setYearFounded}
            placeholder="Enter year founded"
            keyboardType="numeric"
          />
        </>
      )}

      {/* Occupation (only show when not in addLocationMode) */}
      {!addLocationMode && (
        <>
          <Text style={tw`mb-2 font-bold`}>
            Occupation <Text style={tw`text-red-500`}>*</Text>
          </Text>
          <TouchableOpacity
            style={tw`border p-2 mb-4`}
            onPress={() => setOccupationModalVisible(true)}
          >
            <Text>{occupation ? occupation : "Select occupation"}</Text>
          </TouchableOpacity>

          {/* FilterModal for Occupation */}
          <FilterModal
            visible={occupationModalVisible}
            onClose={() => setOccupationModalVisible(false)}
            data={OCCUPATION_DATA.map((occ) => occ.name)}
            onSelect={setOccupation}
            selectedValue={occupation}
          />
        </>
      )}

      {/* Sub-Occupation (only show when occupation is selected and not in addLocationMode) */}
      {occupation && !addLocationMode && (
        <>
          <Text style={tw`mb-2 font-bold`}>Sub Occupation</Text>
          <TouchableOpacity
            style={tw`border p-2 mb-4`}
            onPress={() => setSubOccupationModalVisible(true)}
          >
            <Text>
              {subOccupation ? subOccupation : "Select sub occupation"}
            </Text>
          </TouchableOpacity>

          {/* FilterModal for Sub-Occupation */}
          <FilterModal
            visible={subOccupationModalVisible}
            onClose={() => setSubOccupationModalVisible(false)}
            data={OCCUPATION_DATA.find(
              (occ) => occ.name === occupation
            )?.sublist.map((sub) => sub.name)}
            onSelect={setSubOccupation}
            selectedValue={subOccupation}
          />
        </>
      )}

      {/* Country */}
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
        data={Object.keys(geoData)}
        onSelect={setCountry}
        selectedValue={country}
      />

      {/* City */}
      {country && (
        <>
          <Text style={tw`mb-2 font-bold`}>City</Text>
          <TouchableOpacity
            style={tw`border p-2 mb-4`}
            onPress={() => setCityModalVisible(true)}
          >
            <Text>{city ? city : "Select city"}</Text>
          </TouchableOpacity>

          {/* FilterModal for City */}
          <FilterModal
            key="city-filter-modal"
            visible={cityModalVisible}
            onClose={() => setCityModalVisible(false)}
            data={geoData[country]}
            onSelect={setCity}
            selectedValue={city}
          />
        </>
      )}

      {/* Address */}
      <Text style={tw`mb-2 font-bold`}>Address</Text>
      <TextInput
        style={tw`border p-2 mb-4`}
        value={address}
        onChangeText={setAddress}
        placeholder="Enter address"
      />

      {/* Phone */}
      <Text style={tw`mb-2 font-bold`}>Phone</Text>
      <TextInput
        style={tw`border p-2 mb-4`}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
      />

      {/* Email */}
      <Text style={tw`mb-2 font-bold`}>
        Email <Text style={tw`text-red-500`}>*</Text>
      </Text>
      <TextInput
        style={tw`border p-2 mb-4`}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        keyboardType="email-address"
      />

      {/* Website URL (only show when not in addLocationMode) */}
      {!addLocationMode && (
        <>
          <Text style={tw`mb-2 font-bold`}>Website URL</Text>
          <TextInput
            style={tw`border p-2 mb-4`}
            value={websiteUrl}
            onChangeText={(text) => setWebsiteUrl(text.toLowerCase())}
            placeholder="Enter website URL"
            keyboardType="url"
          />
        </>
      )}

      {/* Description */}
      <Text style={tw`mb-2 font-bold`}>Description</Text>
      <TextInput
        style={tw`border p-2 mb-4`}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter business description"
        multiline
      />

      {/* Image Picker Section */}
      {!addLocationMode && (
        <>
          <Text style={tw`mb-2 font-bold`}>Business Image</Text>
          {image ? (
            <View style={tw`mb-4`}>
              <Image
                source={{ uri: image }}
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
                  onPress={() => setImage(null)}
                >
                  <Text style={tw`text-white`}>Delete Image</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={tw`border p-2 mb-4`} onPress={pickImage}>
              <Text>Select Image</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Submit and Cancel buttons */}
      <TouchableOpacity
        style={tw`bg-blue-500 p-4 rounded`}
        onPress={handleSubmit}
      >
        <Text style={tw`text-center text-white`}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={tw`mt-4 p-4 rounded bg-red-500`}
        onPress={onClose}
      >
        <Text style={tw`text-center text-white`}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
    // </KeyboardAvoidingView>
  );
};

export default CreateNewBusinessForm;
