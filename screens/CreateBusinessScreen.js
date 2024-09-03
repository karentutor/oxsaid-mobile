import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { axiosBase } from "../services/BaseService";
import useAuth from "../hooks/useAuth";
import tw from "twrnc";
import geoData from "../data/geoDataSorted"; // Import the sorted geo data
import FilterModal from "../components/ui/FilterModal"; // Import the FilterModal component

function CreateBusinessScreen({ navigation }) {
  const { auth } = useAuth();
  const { user, access_token } = auth;

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("");
  const [isAlumniOwned, setIsAlumniOwned] = useState(false);
  const [visibility, setVisibility] = useState("");
  const [yearFounded, setYearFounded] = useState("");
  const [occupation, setOccupation] = useState("");
  const [subOccupation, setSubOccupation] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [picturePath, setPicturePath] = useState("");

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(null);

  // Pre-load data for country and city dropdowns
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    // Load country data once on component mount
    setCountries(Object.keys(geoData));
  }, []);

  useEffect(() => {
    // Update city list when country changes
    if (country) {
      setCities(geoData[country] || []);
    } else {
      setCities([]);
    }
  }, [country]);

  const handleSubmit = async () => {
    if (!name || !size) {
      Alert.alert("Validation Error", "Name and size are required fields.");
      return;
    }

    try {
      const businessNameResponse = await axiosBase.post(
        "/business-name",
        {
          userId: user._id,
          name,
          size: parseInt(size),
          isAlumniOwned,
          visibility,
          yearFounded: parseInt(yearFounded),
          occupation,
          subOccupation,
          websiteUrl,
          picturePath,
        },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      const businessNameId = businessNameResponse.data._id;

      const businessDetailsResponse = await axiosBase.post(
        "/business-details",
        {
          businessNameId,
          address,
          city,
          country,
          phone,
          email,
          description,
        },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      if (businessDetailsResponse.status === 201) {
        Alert.alert("Success", "Business created successfully!");
        navigation.goBack(); // Navigate back to the previous screen
      }
    } catch (error) {
      console.error("Error creating business:", error.message);
      Alert.alert("Error", "Failed to create business. Please try again.");
    }
  };

  const openFilterModal = (filterType) => {
    setCurrentFilter(filterType);
    setModalVisible(true);
  };

  const handleFilterSelect = (value) => {
    if (currentFilter === "country") setCountry(value);
    if (currentFilter === "city") setCity(value);
    setModalVisible(false);
  };

  const getDataForCurrentFilter = () => {
    switch (currentFilter) {
      case "country":
        return countries;
      case "city":
        return cities;
      default:
        return [];
    }
  };

  return (
    <ScrollView style={tw`p-4 bg-white`}>
      <View style={tw`mb-4`}>
        <Text style={tw`text-lg font-bold mb-2`}>Business Name</Text>
        <TextInput
          style={tw`border border-gray-300 p-2 rounded`}
          value={name}
          onChangeText={setName}
          placeholder="Enter business name"
        />
      </View>

      {/* Address Fields */}
      <View style={tw`mb-4`}>
        <Text style={tw`text-lg font-bold mb-2`}>Address</Text>
        <TextInput
          style={tw`border border-gray-300 p-2 rounded`}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
        />
      </View>

      {/* Country Selector */}
      <View style={tw`mb-4`}>
        <TouchableOpacity
          style={tw`border border-gray-300 rounded-lg p-2 w-full flex-row items-center justify-between`}
          onPress={() => openFilterModal("country")}
        >
          <Text style={tw`text-black`}>
            {country ? `Country: ${country}` : "Select Country"}
          </Text>
          {!country && <Text style={tw`text-black`}>▼</Text>}
        </TouchableOpacity>
      </View>

      {/* City Selector */}
      <View style={tw`mb-4`}>
        <TouchableOpacity
          style={tw`border border-gray-300 rounded-lg p-2 w-full flex-row items-center justify-between`}
          onPress={() => openFilterModal("city")}
          disabled={!country} // Disable if no country is selected
        >
          <Text style={tw`text-black`}>
            {city ? `City: ${city}` : "Select City"}
          </Text>
          {!city && <Text style={tw`text-black`}>▼</Text>}
        </TouchableOpacity>
      </View>

      {/* Other Input Fields */}
      <View style={tw`mb-4`}>
        <Text style={tw`text-lg font-bold mb-2`}>Phone</Text>
        <TextInput
          style={tw`border border-gray-300 p-2 rounded`}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
      </View>

      {/* Continue with other fields like email, description, size, etc. */}
      <View style={tw`mb-4`}>
        <Text style={tw`text-lg font-bold mb-2`}>Description</Text>
        <TextInput
          style={tw`border border-gray-300 p-2 rounded`}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter business description"
        />
      </View>

      <View style={tw`mb-4`}>
        <Text style={tw`text-lg font-bold mb-2`}>Size</Text>
        <TextInput
          style={tw`border border-gray-300 p-2 rounded`}
          value={size}
          onChangeText={setSize}
          placeholder="Enter size (number of employees)"
          keyboardType="numeric"
        />
      </View>

      {/* Submit Button */}
      <View style={tw`mt-6`}>
        <Button title="Create Business" onPress={handleSubmit} color="#f00" />
      </View>

      {/* Filter Modal for Country and City Selection */}
      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={getDataForCurrentFilter()}
        onSelect={handleFilterSelect}
        selectedValue={currentFilter === "country" ? country : city}
      />
    </ScrollView>
  );
}

export default CreateBusinessScreen;
