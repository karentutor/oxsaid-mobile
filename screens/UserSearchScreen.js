import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { axiosBase } from "../services/BaseService";
import useAuth from "../hooks/useAuth";
import tw from "../lib/tailwind";
import FilterModal from "../components/ui/FilterModal";
import UserCard from "../components/ui/UserCard"; // Import the UserCard component

const UserSearchScreen = () => {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [college, setCollege] = useState("");
  const [matriculationYear, setMatriculationYear] = useState("");
  const [industry, setIndustry] = useState("");
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

      if (college) queryParams.append("college", college);
      if (matriculationYear)
        queryParams.append("matriculationYear", matriculationYear);
      if (industry) queryParams.append("occupation", industry);
      queryParams.append("search", search || "all");

      const queryString = queryParams.toString();

      try {
        const response = await axiosBase.get(`/users/query?${queryString}`, {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        });
        if (response) {
          const filteredData = response.data.filter(
            (item) => item._id !== auth.user._id
          );
          // Simulate 90 users by repeating the filtered data
          const repeatedData = Array(30).fill(filteredData).flat();
          const updatedOptions = repeatedData.map((option) => ({
            ...option,
            isFollowed: friends.includes(option._id),
          }));
          setOptions(updatedOptions);
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
    friends,
  ]);

  const resetFilters = () => {
    setSearch("");
    setCollege("");
    setMatriculationYear("");
    setIndustry("");
    setOptions([]);
  };

  const searchAllUsers = async () => {
    setLoading(true);

    try {
      const response = await axiosBase.get(`/users/query?search=all`, {
        headers: { Authorization: `Bearer ${auth.access_token}` },
      });

      if (response) {
        const filteredData = response.data.filter(
          (item) => item._id !== auth.user._id
        );
        // Simulate 90 users by repeating the filtered data
        const repeatedData = Array(30).fill(filteredData).flat();
        const updatedOptions = repeatedData.map((option) => ({
          ...option,
          isFollowed: friends.includes(option._id),
        }));
        setOptions(updatedOptions);
      }
    } catch (error) {
      console.error("Search all error:", error);
    }

    setLoading(false);
  };

  const openFilterModal = (filterType) => {
    setCurrentFilter(filterType);
    setModalVisible(true);
  };

  const handleFilterSelect = (value) => {
    if (currentFilter === "college") setCollege(value);
    if (currentFilter === "matriculationYear") setMatriculationYear(value);
    if (currentFilter === "industry") setIndustry(value);
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
      default:
        return [];
    }
  };

  return (
    <View style={tw`flex-1 items-center justify-start pt-5`}>
      <View style={tw`w-full px-6`}>
        <TextInput
          placeholder="Search"
          value={search}
          onChangeText={(text) => setSearch(text)}
          style={tw`border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500 w-full mb-4`}
        />

        <View style={tw`flex flex-wrap justify-start items-center mb-4`}>
          <TouchableOpacity
            style={tw`border border-gray-300 rounded-lg p-2 mb-2 w-full flex-row items-center justify-between`}
            onPress={() => openFilterModal("college")}
          >
            <Text style={tw`text-black`}>
              {college ? `College: ${college}` : "Select College"}
            </Text>
            {!college && <Text style={tw`text-black`}>▼</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`border border-gray-300 rounded-lg p-2 mb-2 w-full flex-row items-center justify-between`}
            onPress={() => openFilterModal("matriculationYear")}
          >
            <Text style={tw`text-black`}>
              {matriculationYear
                ? `Year: ${matriculationYear}`
                : "Select Matriculation Year"}
            </Text>
            {!matriculationYear && <Text style={tw`text-black`}>▼</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`border border-gray-300 rounded-lg p-2 mb-2 w-full flex-row items-center justify-between`}
            onPress={() => openFilterModal("industry")}
          >
            <Text style={tw`text-black`}>
              {industry ? `Industry: ${industry}` : "Select Industry"}
            </Text>
            {!industry && <Text style={tw`text-black`}>▼</Text>}
          </TouchableOpacity>
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

        <ScrollView style={tw`mt-4`}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            options.map((option, index) => (
              <UserCard key={index} user={option} />
            ))
          )}
        </ScrollView>
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
            : industry
        }
      />
    </View>
  );
};

export default UserSearchScreen;
