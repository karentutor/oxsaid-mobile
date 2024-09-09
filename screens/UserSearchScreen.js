import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { axiosBase } from "../services/BaseService";
import useAuth from "../hooks/useAuth";
import tw from "../lib/tailwind";
import FilterModal from "../components/ui/FilterModal";
import {
  OCCUPATION_DATA,
  COLLEGE_DATA,
  MATRICULATION_YEAR_DATA,
} from "../data";
import geoData from "../data/geoDataSorted"; // Import geoData for location and city
import UserCard from "../components/ui/UserCard"; // Import the UserCard component

const UserSearchScreen = () => {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [college, setCollege] = useState("");
  const [matriculationYear, setMatriculationYear] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState(""); // New state for location
  const [city, setCity] = useState(""); // New state for city
  const [friends, setFriends] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(null);
  const { auth } = useAuth();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axiosBase.get(
          `/users/${auth.user._id}/friends`,
          {
            headers: { Authorization: `Bearer ${auth.access_token}` },
          }
        );
        setFriends(response.data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, [auth.user._id, auth.access_token]);

  useEffect(() => {
    const searchByKeyword = async () => {
      setLoading(true);

      const queryParams = new URLSearchParams();

      // Determine what to send based on the search and filters
      if (search) {
        queryParams.append("search", search);
      } else if (
        !college &&
        !matriculationYear &&
        !industry &&
        !location &&
        !city
      ) {
        queryParams.append("search", "all"); // Only send 'all' if no filters are selected
      }

      if (college) queryParams.append("college", college);
      if (matriculationYear)
        queryParams.append("matriculationYear", matriculationYear);
      if (industry) queryParams.append("occupation", industry);
      if (location) queryParams.append("location", location); // Add location to search query
      if (city) queryParams.append("city", city); // Add city to search query

      const queryString = queryParams.toString();

      try {
        const response = await axiosBase.get(`/users/query?${queryString}`, {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        });

        if (response) {
          const filteredData = response.data.filter(
            (item) => item._id !== auth.user._id
          );

          setOptions(response.data);
          // const updatedOptions = filteredData.map((option) => ({
          //   ...option,
          //   isFollowed: friends.includes(option._id), // Just add `isFollowed`, do not filter based on friends
          // }));

          // console.log("here two", updatedOptions);
          // setOptions(updatedOptions); // Update state with all users, regardless of follow status
        }
      } catch (error) {
        console.error("Search error:", error);
      }
      setLoading(false);
    };

    searchByKeyword();
  }, [
    search,
    auth.access_token,
    auth.user._id,
    college,
    matriculationYear,
    industry,
    location,
    city,
    friends,
  ]);

  const resetFilters = () => {
    setSearch("");
    setCollege("");
    setMatriculationYear("");
    setIndustry("");
    setLocation(""); // Reset location
    setCity(""); // Reset city
    setOptions([]);
  };

  const searchAllUsers = () => {
    setSearch("");
    setCollege("");
    setMatriculationYear("");
    setIndustry("");
    setLocation("");
    setCity("");
  };

  const openFilterModal = (filterType) => {
    setCurrentFilter(filterType);
    setModalVisible(true);
  };

  const handleFilterSelect = (value) => {
    if (currentFilter === "college") setCollege(value);
    if (currentFilter === "matriculationYear") setMatriculationYear(value);
    if (currentFilter === "industry") setIndustry(value);
    if (currentFilter === "location") {
      setLocation(value);
      setCity(""); // Reset city when location changes
    }
    if (currentFilter === "city") setCity(value);
    setModalVisible(false);
  };

  const getDataForCurrentFilter = () => {
    switch (currentFilter) {
      case "college":
        return COLLEGE_DATA.map((option) => option.name);
      case "matriculationYear":
        return MATRICULATION_YEAR_DATA.map((option) => option.toString());
      case "industry":
        return OCCUPATION_DATA.map((option) => option.name);
      case "location":
        return Object.keys(geoData); // Get list of countries
      case "city":
        return geoData[location] || []; // Get cities based on selected location
      default:
        return [];
    }
  };

  return (
    <View style={tw`flex-1 items-center justify-start pt-10`}>
      <View style={tw`w-full px-6 flex-1`}>
        <TextInput
          placeholder="Search"
          value={search}
          onChangeText={(text) => setSearch(text)}
          style={tw`border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500 w-full mb-4`}
        />
        <View style={tw`flex flex-wrap justify-start items-center mb-4`}>
          {/* College Filter */}
          <TouchableOpacity
            style={tw`border border-gray-300 rounded-lg p-2 mb-2 w-full flex-row items-center justify-between`}
            onPress={() => openFilterModal("college")}
          >
            <Text style={tw`text-black`}>
              {college ? `College: ${college}` : "Select College"}
            </Text>
          </TouchableOpacity>
          {/* Matriculation Year Filter */}
          <TouchableOpacity
            style={tw`border border-gray-300 rounded-lg p-2 mb-2 w-full flex-row items-center justify-between`}
            onPress={() => openFilterModal("matriculationYear")}
          >
            <Text style={tw`text-black`}>
              {matriculationYear
                ? `Year: ${matriculationYear}`
                : "Select Matriculation Year"}
            </Text>
          </TouchableOpacity>
          {/* Industry Filter */}
          <TouchableOpacity
            style={tw`border border-gray-300 rounded-lg p-2 mb-2 w-full flex-row items-center justify-between`}
            onPress={() => openFilterModal("industry")}
          >
            <Text style={tw`text-black`}>
              {industry ? `Industry: ${industry}` : "Select Industry"}
            </Text>
          </TouchableOpacity>
          {/* Location Filter */}
          <TouchableOpacity
            style={tw`border border-gray-300 rounded-lg p-2 mb-2 w-full flex-row items-center justify-between`}
            onPress={() => openFilterModal("location")}
          >
            <Text style={tw`text-black`}>
              {location ? `Location: ${location}` : "Select Location"}
            </Text>
          </TouchableOpacity>
          {/* City Filter (only show if location is selected) */}
          {location && (
            <TouchableOpacity
              style={tw`border border-gray-300 rounded-lg p-2 mb-2 w-full flex-row items-center justify-between`}
              onPress={() => openFilterModal("city")}
            >
              <Text style={tw`text-black`}>
                {city ? `City: ${city}` : "Select City"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={tw`flex flex-row justify-start items-center mb-4`}>
          <TouchableOpacity
            style={tw`border border-gray-300 rounded-lg p-2 mb-2 w-1/2 bg-secondary500 mr-2`}
            onPress={searchAllUsers}
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

        <FlatList
          data={options}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <UserCard user={item} />}
          ListHeaderComponent={
            loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
          }
          contentContainerStyle={tw`pb-1`}
          style={tw`mt-4 flex-grow`}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={getDataForCurrentFilter()}
        onSelect={handleFilterSelect}
        selectedValue={
          currentFilter === "college"
            ? college
            : currentFilter === "matriculationYear"
            ? matriculationYear
            : currentFilter === "industry"
            ? industry
            : currentFilter === "location"
            ? location
            : city
        }
      />
    </View>
  );
};

export default UserSearchScreen;
