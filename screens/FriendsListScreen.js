import React, { useState, useContext, useCallback } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import UserCard from "../components/ui/UserCard"; // Adjust the path as necessary
import tw from "twrnc";
import { axiosBase } from "../services/BaseService"; // Ensure you have a configured axios instance
import useAuth from "../hooks/useAuth";

const FriendsListScreen = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  // useFocusEffect will run the effect whenever the screen comes into view
  useFocusEffect(
    useCallback(() => {
      const fetchFriends = async () => {
        try {
          const response = await axiosBase.get(
            `/users/${auth.user._id}/friendsList`,
            {
              headers: { Authorization: `Bearer ${auth.access_token}` },
            }
          );
          setFriends(response.data); // Set the full user details
        } catch (error) {
          console.error("Error fetching friends:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchFriends();

      // Optional cleanup function
      return () => {
        setFriends([]); // Clear friends data if necessary when the screen is unfocused
      };
    }, [auth.user._id, auth.access_token])
  );

  return (
    <View style={tw`flex-1`}>
      <Text style={tw`text-center font-bold text-xl mb-4 mt-10`}>
        Go to User Search and then User Profile to Follow
      </Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item._id.toString()} // Use the _id field as the key
        renderItem={({ item }) => <UserCard user={item} />}
        ListHeaderComponent={
          loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
        }
        contentContainerStyle={tw`pb-1`}
        style={tw`mt-4 flex-grow`}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default FriendsListScreen;
