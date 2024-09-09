import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import tw from "../lib/tailwind";
import { axiosBase } from "../services/BaseService"; // Assuming axiosBase is set up for your API requests
import FilterModal from "../components/ui/FilterModal";
import BusinessInformation from "../components/ui/BusinessInformation"; // Component to display each business
import { OCCUPATION_DATA } from "../data"; // For industry and sub-industry data
import geoData from "../data/geoDataSorted"; // For country and city data
import useAuth from "../hooks/useAuth"; // Assuming you have a hook for authentication

const BusinessesScreen = () => {
  const { auth } = useAuth(); // Get the auth context, assuming it provides the token and user
  const [businesses, setBusinesses] = useState([]); // To hold the list of businesses
  const [selectedIndustry, setSelectedIndustry] = useState(""); // Selected industry
  const [selectedSubIndustry, setSelectedSubIndustry] = useState(""); // Selected sub-industry
  const [selectedCountry, setSelectedCountry] = useState(""); // Selected country
  const [selectedCity, setSelectedCity] = useState(""); // Selected city
  const [loading, setLoading] = useState(false); // Manage loading state
  const [search, setSearch] = useState(""); // Search field
  const [modalVisible, setModalVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(null);

  // Extract industries and sub-industries from OCCUPATION_DATA
  const INDUSTRIES = OCCUPATION_DATA.map((occupation) => occupation.name);
  const getSubIndustries = (industry) => {
    const selectedOccupation = OCCUPATION_DATA.find(
      (occupation) => occupation.name === industry
    );
    return selectedOccupation
      ? selectedOccupation.sublist.map((sub) => sub.name)
      : [];
  };

  // Extract countries and cities from geoData
  const COUNTRIES = Object.keys(geoData);
  const getCities = (country) => geoData[country] || [];

  // Call API to fetch all businesses when component mounts
  useEffect(() => {
    fetchAllBusinesses();
  }, []);

  // Fetch businesses when filters or search terms change
  useEffect(() => {
    if (
      selectedIndustry ||
      selectedSubIndustry ||
      selectedCountry ||
      selectedCity ||
      search
    ) {
      fetchBusinesses();
    }
  }, [
    selectedIndustry,
    selectedSubIndustry,
    selectedCountry,
    selectedCity,
    search,
  ]);

  // Function to fetch all businesses with their details
  const fetchAllBusinesses = async () => {
    setLoading(true);
    try {
      const response = await axiosBase.get("/businesses", {
        headers: { Authorization: `Bearer ${auth.access_token}` }, // Send token in request
      });
      console.log("fetchAllBusiensses", response.data);
      setBusinesses(response.data); // Expecting data with flattened business details
    } catch (error) {
      console.error("Error fetching all businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch businesses based on filters
  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response = await axiosBase.get("/businesses/query", {
        params: {
          industry: selectedIndustry,
          subIndustry: selectedSubIndustry,
          country: selectedCountry,
          city: selectedCity,
          search: search || undefined, // Only include search if it's not empty
        },
        headers: { Authorization: `Bearer ${auth.access_token}` }, // Send token in request
      });
      console.log("fetchBusinessesfunction", response.data);
      setBusinesses(response.data); // Expecting data with flattened business details
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters and clear the screen
  const resetFilters = () => {
    setSearch("");
    setSelectedIndustry("");
    setSelectedSubIndustry("");
    setSelectedCountry("");
    setSelectedCity("");
    setBusinesses([]); // Clear businesses list
    fetchAllBusinesses(); // Fetch all businesses again
  };

  // Generate unique keys by combining timestamp with business name and address
  const generateUniqueKey = (business) => {
    return `${business.businessName.name}-${
      business.businessDetail.address
    }-${Date.now()}`;
  };

  // Open filter modal
  const openFilterModal = (filterType) => {
    setCurrentFilter(filterType);
    setModalVisible(true);
  };

  const handleFilterSelect = (value) => {
    if (currentFilter === "industry") {
      setSelectedIndustry(value);
      setSelectedSubIndustry(""); // Reset sub-industry when industry is selected
    }
    if (currentFilter === "subIndustry") setSelectedSubIndustry(value);
    if (currentFilter === "country") setSelectedCountry(value);
    if (currentFilter === "city") setSelectedCity(value);
    setModalVisible(false);
  };

  const getDataForCurrentFilter = () => {
    switch (currentFilter) {
      case "industry":
        return INDUSTRIES;
      case "subIndustry":
        return getSubIndustries(selectedIndustry);
      case "country":
        return COUNTRIES;
      case "city":
        return getCities(selectedCountry);
      default:
        return [];
    }
  };

  return (
    <ScrollView style={tw`p-4 bg-white`}>
      <View style={tw`mb-4`}>
        <Text style={tw`text-lg font-bold text-center`}>
          Oxsaid Alum Businesses
        </Text>
      </View>

      {/* Search Field */}
      <TextInput
        placeholder="Search businesses"
        value={search}
        onChangeText={(text) => setSearch(text)}
        style={tw`border border-gray-300 rounded-lg p-2 mb-4 w-full`}
      />

      {/* Filter Buttons */}
      <View style={tw`mb-4`}>
        {/* Industry Filter */}
        <TouchableOpacity
          style={tw`border border-gray-300 rounded-lg p-4 mb-2 flex-row items-center justify-between`}
          onPress={() => openFilterModal("industry")}
        >
          <Text style={tw`text-black`}>
            {selectedIndustry
              ? `Industry: ${selectedIndustry}`
              : "Select Industry"}
          </Text>
          <Text style={tw`text-black`}>▼</Text>
        </TouchableOpacity>

        {/* Sub-Industry Filter (only show if industry is selected) */}
        {selectedIndustry && (
          <TouchableOpacity
            style={tw`border border-gray-300 rounded-lg p-4 mb-2 flex-row items-center justify-between`}
            onPress={() => openFilterModal("subIndustry")}
          >
            <Text style={tw`text-black`}>
              {selectedSubIndustry
                ? `Sub-Industry: ${selectedSubIndustry}`
                : "Select Sub-Industry"}
            </Text>
            <Text style={tw`text-black`}>▼</Text>
          </TouchableOpacity>
        )}

        {/* Country Filter */}
        <TouchableOpacity
          style={tw`border border-gray-300 rounded-lg p-4 mb-2 flex-row items-center justify-between`}
          onPress={() => openFilterModal("country")}
        >
          <Text style={tw`text-black`}>
            {selectedCountry ? `Country: ${selectedCountry}` : "Select Country"}
          </Text>
          <Text style={tw`text-black`}>▼</Text>
        </TouchableOpacity>

        {/* City Filter (only show if country is selected) */}
        {selectedCountry && (
          <TouchableOpacity
            style={tw`border border-gray-300 rounded-lg p-4 mb-2 flex-row items-center justify-between`}
            onPress={() => openFilterModal("city")}
          >
            <Text style={tw`text-black`}>
              {selectedCity ? `City: ${selectedCity}` : "Select City"}
            </Text>
            <Text style={tw`text-black`}>▼</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={tw`flex flex-row justify-start items-center mb-4`}>
        <TouchableOpacity
          style={tw`border border-gray-300 rounded-lg p-2 mb-2 w-1/2 bg-secondary500 mr-2`}
          onPress={fetchAllBusinesses}
        >
          <Text style={tw`text-black text-center`}>Search All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`border border-gray-300 rounded-lg p-2 mb-2 w-1/2 bg-primary100`}
          onPress={resetFilters}
        >
          <Text style={tw`text-black text-center`}>Reset Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Display businesses */}
      {loading ? (
        <Text style={tw`text-center`}>Loading...</Text>
      ) : (
        businesses.map((business) => (
          <View key={generateUniqueKey(business)} style={tw`mb-4`}>
            <BusinessInformation business={business} />
          </View>
        ))
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={getDataForCurrentFilter()}
        onSelect={handleFilterSelect}
        selectedValue={
          currentFilter === "industry"
            ? selectedIndustry
            : currentFilter === "subIndustry"
            ? selectedSubIndustry
            : currentFilter === "country"
            ? selectedCountry
            : selectedCity
        }
      />
    </ScrollView>
  );
};

export default BusinessesScreen;
