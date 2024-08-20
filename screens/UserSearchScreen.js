import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import Button from "../components/ui/Button";
import { axiosBase } from "../services/BaseService";
import {
  COLLEGE_DATA,
  MATRICULATION_YEAR_DATA,
  OCCUPATION_DATA,
} from "../data";
import { getDisplayNames } from "../utils/helperFunctions";
import useAuth from "../hooks/useAuth";
import tw from "twrnc";
import FilterModal from "../components/ui/FilterModal";

const UserSearch = () => {
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
      const query = [
        `college=${encodeURIComponent(college)}`,
        `matriculationYear=${encodeURIComponent(matriculationYear)}`,
        `occupation=${encodeURIComponent(industry)}`,
        `search=${encodeURIComponent(search || "all")}`,
      ].join("&");

      try {
        const response = await axiosBase.get(`users/query/?${query}`, {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        });
        if (response) {
          const filteredData = response.data.filter(
            (item) => item._id !== auth.user._id
          );
          const updatedOptions = filteredData.map((option) => ({
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
        <Text style={tw`mb-4 text-3xl font-bold text-center`}>
          Search Users
        </Text>
        <View style={tw`w-full flex-col items-center`}>
          <View style={tw`w-full md:w-2/3`}>
            <View style={tw`px-6 py-4`}>
              {/* Search Input */}
              <View style={tw`flex justify-between mb-4 w-full`}>
                <TextInput
                  placeholder="Search"
                  value={search}
                  onChangeText={(text) => setSearch(text)}
                  style={tw`border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500 w-full`}
                />
              </View>
              {/* Filter Buttons */}
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
              {/* Reset Filters Button */}
              <View style={tw`flex flex-wrap justify-start items-center mb-4`}>
                <TouchableOpacity
                  style={tw`border border-gray-300 rounded-lg p-2 mb-2 w-full`}
                  onPress={resetFilters}
                >
                  <Text style={tw`text-black text-center`}>Reset Filters</Text>
                </TouchableOpacity>
              </View>

              {/* Search Results */}
              <ScrollView style={tw`mt-4`}>
                {loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                  options.map((option, index) => (
                    <View
                      key={index}
                      style={tw`border border-gray-300 rounded-lg p-4 mt-2 flex-row items-center justify-between w-full`}
                    >
                      {/* Avatar */}
                      <Image
                        source={{ uri: option.picturePath }}
                        style={tw`w-12 h-12 rounded-full mr-4`}
                      />
                      {/* Details */}
                      <View style={tw`flex-1`}>
                        <Text style={tw`font-bold`}>
                          {getDisplayNames(option.firstName, option.lastName)}
                        </Text>
                        <Text style={tw`text-gray-600`}>
                          {option.email || "N/A"}
                        </Text>
                        <Text style={tw`text-gray-600`}>
                          {option.college || "N/A"}
                        </Text>
                        <Text style={tw`text-gray-600`}>
                          {option.matriculationYear || "N/A"}
                        </Text>
                        <Text style={tw`text-gray-600`}>
                          {option.occupation || "N/A"}
                        </Text>
                      </View>

                      {/* Action Buttons */}
                      <View style={tw`flex-row items-center space-x-2`}>
                        <Button
                          variant={option.isFollowed ? "secondary" : "default"}
                          size="default"
                          className="text-white"
                          onPress={() =>
                            toggleFollowUser(option._id, option.isFollowed)
                          }
                        >
                          {option.isFollowed ? "Unfollow" : "Follow"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="default"
                          className="text-white"
                          // onClick={() => navigation.navigate("Profile", { userId: option._id })}
                        >
                          View Profile
                        </Button>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>

      {/* Custom Modal for Filter Selection */}
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

export default UserSearch;
