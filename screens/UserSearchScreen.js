import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Picker,
  ActivityIndicator,
  Alert,
} from "react-native";
import Button from "../components/ui/Button";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import {
  COLLEGE_DATA,
  MATRICULATION_YEAR_DATA,
  OCCUPATION_DATA,
} from "../data";
import { getDisplayNames } from "../utils/helperFunctions";
import useAuth from "../hooks/useAuth";

const UserSearch = () => {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [college, setCollege] = useState("");
  const [matriculationYear, setMatriculationYear] = useState("");
  const [industry, setIndustry] = useState("");
  const [friends, setFriends] = useState([]);
  const navigation = useNavigation();
  const { auth } = useAuth();

  // useEffect(() => {
  //   const fetchFriends = async () => {
  //     try {
  //       const response = await axiosBase.get(
  //         `/users/${auth.user._id}/friends`,
  //         {
  //           headers: { Authorization: `Bearer ${auth.access_token}` },
  //         }
  //       );
  //       setFriends(response.data);
  //     } catch (error) {
  //       console.error("Error fetching friends:", error);
  //     }
  //   };

  //   fetchFriends();
  // }, [auth.user._id, auth.access_token]);
  return <Text>hi</Text>;
  // useEffect(() => {
  //   const searchByKeyword = async () => {
  //     setLoading(true);
  //     const query = [
  //       `college=${encodeURIComponent(college)}`,
  //       `matriculationYear=${encodeURIComponent(matriculationYear)}`,
  //       `occupation=${encodeURIComponent(industry)}`,
  //       `search=${encodeURIComponent(search || "all")}`,
  //     ].join("&");

  //     try {
  //       const response = await axios.get(`users/query/${query}`, {
  //         headers: { Authorization: `Bearer ${auth.access_token}` },
  //       });
  //       if (response) {
  //         const filteredData = response.data.filter(
  //           (item) => item._id !== auth.user._id
  //         );
  //         const updatedOptions = filteredData.map((option) => ({
  //           ...option,
  //           isFollowed: friends.includes(option._id),
  //         }));
  //         setOptions(updatedOptions);
  //       }
  //     } catch (error) {
  //       console.error("Search error:", error);
  //     }
  //     setLoading(false);
  //   };

  //   searchByKeyword();
  // }, [
  //   search,
  //   auth.access_token,
  //   auth.user._id,
  //   college,
  //   matriculationYear,
  //   industry,
  //   friends,
  // ]);

  // const resetFilters = () => {
  //   setSearch("");
  //   setCollege("");
  //   setMatriculationYear("");
  //   setIndustry("");
  //   setOptions([]);
  // };

  // const toggleFollowUser = async (userId, isFollowed) => {
  //   try {
  //     if (isFollowed) {
  //       await axios.post(
  //         `/users/unfollow/${userId}`,
  //         {},
  //         {
  //           headers: { Authorization: `Bearer ${auth.access_token}` },
  //         }
  //       );
  //       Alert.alert("Success", "User unfollowed successfully");
  //       updateUserFollowStatus(userId, false);
  //     } else {
  //       await axios.post(
  //         `/users/follow/${userId}`,
  //         {},
  //         {
  //           headers: { Authorization: `Bearer ${auth.access_token}` },
  //         }
  //       );
  //       Alert.alert("Success", "User followed successfully");
  //       updateUserFollowStatus(userId, true);
  //     }
  //   } catch (error) {
  //     console.error(isFollowed ? "Unfollow error:" : "Follow error:", error);
  //   }
  // };

  // const updateUserFollowStatus = (userId, isFollowed) => {
  //   setOptions((prevOptions) =>
  //     prevOptions.map((option) =>
  //       option._id === userId ? { ...option, isFollowed } : option
  //     )
  //   );
  //   if (isFollowed) {
  //     setFriends([...friends, userId]);
  //   } else {
  //     setFriends(friends.filter((id) => id !== userId));
  //   }
  // };

  // return (
  //   <ScrollView contentContainerStyle={{ padding: 16 }}>
  //     <View style={{ marginBottom: 16 }}>
  //       <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
  //         Search Users
  //       </Text>
  //     </View>

  //     {/* Search Input and Reset Filters */}
  //     <View
  //       style={{
  //         flexDirection: "row",
  //         justifyContent: "space-between",
  //         marginBottom: 16,
  //       }}
  //     >
  //       <TextInput
  //         placeholder="Search"
  //         value={search}
  //         onChangeText={setSearch}
  //         style={{
  //           borderColor: "#ccc",
  //           borderWidth: 1,
  //           borderRadius: 8,
  //           padding: 8,
  //           flex: 1,
  //           marginRight: 8,
  //         }}
  //       />
  //       <Button mode="contained" onPress={resetFilters}>
  //         Reset Filters
  //       </Button>
  //     </View>

  //     {/* Filters */}
  //     <View style={{ marginBottom: 16 }}>
  //       <Picker
  //         selectedValue={college}
  //         onValueChange={(itemValue) => setCollege(itemValue)}
  //         style={{
  //           borderColor: "#ccc",
  //           borderWidth: 1,
  //           borderRadius: 8,
  //           padding: 8,
  //         }}
  //       >
  //         <Picker.Item label="Select College" value="" />
  //         {COLLEGE_DATA.map((option) => (
  //           <Picker.Item
  //             key={option.name}
  //             label={option.name}
  //             value={option.name}
  //           />
  //         ))}
  //       </Picker>

  //       <Picker
  //         selectedValue={matriculationYear}
  //         onValueChange={(itemValue) => setMatriculationYear(itemValue)}
  //         style={{
  //           borderColor: "#ccc",
  //           borderWidth: 1,
  //           borderRadius: 8,
  //           padding: 8,
  //           marginTop: 16,
  //         }}
  //       >
  //         <Picker.Item label="Select Matriculation Year" value="" />
  //         {MATRICULATION_YEAR_DATA.map((option) => (
  //           <Picker.Item key={option} label={option} value={option} />
  //         ))}
  //       </Picker>

  //       <Picker
  //         selectedValue={industry}
  //         onValueChange={(itemValue) => setIndustry(itemValue)}
  //         style={{
  //           borderColor: "#ccc",
  //           borderWidth: 1,
  //           borderRadius: 8,
  //           padding: 8,
  //           marginTop: 16,
  //         }}
  //       >
  //         <Picker.Item label="Select Industry" value="" />
  //         {OCCUPATION_DATA.map((option) => (
  //           <Picker.Item
  //             key={option.name}
  //             label={option.name}
  //             value={option.name}
  //           />
  //         ))}
  //       </Picker>
  //     </View>

  //     {/* Search Results */}
  //     {loading ? (
  //       <ActivityIndicator size="large" color="#0000ff" />
  //     ) : (
  //       options.map((option, index) => (
  //         <View
  //           key={index}
  //           style={{
  //             borderColor: "#ccc",
  //             borderWidth: 1,
  //             borderRadius: 8,
  //             padding: 16,
  //             marginTop: 8,
  //             flexDirection: "row",
  //             alignItems: "center",
  //           }}
  //         >
  //           {/* Avatar */}
  //           <Image
  //             source={{ uri: option.picturePath }}
  //             style={{
  //               width: 48,
  //               height: 48,
  //               borderRadius: 24,
  //               marginRight: 16,
  //             }}
  //           />
  //           {/* Details */}
  //           <View style={{ flex: 1 }}>
  //             <Text style={{ fontWeight: "bold" }}>
  //               {getDisplayNames(option.firstName, option.lastName)}
  //             </Text>
  //             <Text>{option.email || "N/A"}</Text>
  //             <Text>{option.college || "N/A"}</Text>
  //             <Text>{option.matriculationYear || "N/A"}</Text>
  //             <Text>{option.occupation || "N/A"}</Text>
  //           </View>

  //           {/* Action Buttons */}
  //           <View style={{ flexDirection: "row", alignItems: "center" }}>
  //             <Button
  //               mode={option.isFollowed ? "contained" : "outlined"}
  //               onPress={() => toggleFollowUser(option._id, option.isFollowed)}
  //             >
  //               {option.isFollowed ? "Unfollow" : "Follow"}
  //             </Button>
  //             <Button
  //               mode="contained"
  //               color="red"
  //               onPress={() =>
  //                 navigation.navigate("Profile", { userId: option._id })
  //               }
  //             >
  //               View Profile
  //             </Button>
  //           </View>
  //         </View>
  //       ))
  //     )}
  //   </ScrollView>
  // );
};

export default UserSearch;
