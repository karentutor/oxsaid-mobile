import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { axiosBase } from "../services/BaseService";
import useAuth from "../hooks/useAuth";
import tw from "../lib/tailwind";

const UserProfileScreen = ({ route }) => {
  const { user } = route.params;
  const { auth } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await axiosBase.get(
          `/users/${auth.user._id}/friends`,
          {
            headers: { Authorization: `Bearer ${auth.access_token}` },
          }
        );
        const friendIds = response.data;
        setIsConnected(friendIds.includes(user._id));
        setLoading(false);
      } catch (error) {
        console.error("Error checking connection status:", error);
        setLoading(false);
      }
    };

    checkConnection();
  }, [auth.user._id, auth.access_token, user._id]);

  const handleConnect = async () => {
    try {
      await axiosBase.post(
        `/users/follow/${user._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        }
      );
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting with user:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await axiosBase.post(
        `/users/unfollow/${user._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.access_token}` },
        }
      );
      setIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting from user:", error);
    }
  };

  return (
    <View style={tw`flex-1 items-center justify-center p-4`}>
      {/* User Profile Header */}
      <Text style={tw`text-3xl font-bold mb-4`}>User Profile</Text>

      {/* User Picture */}
      {user.picturePath ? (
        <Image
          source={{ uri: user.picturePath }}
          style={tw`w-32 h-32 rounded-full mb-4`}
        />
      ) : (
        <View style={tw`w-32 h-32 rounded-full bg-gray-300 mb-4`} />
      )}

      {/* User Details */}
      <View style={tw`items-center`}>
        <Text style={tw`text-xl font-bold text-black`}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={tw`text-base text-gray-700 mt-2`}>
          College: {user.college || "N/A"}
        </Text>
        <Text style={tw`text-base text-gray-700 mt-2`}>
          Matriculation Year: {user.matriculationYear || "N/A"}
        </Text>
        <Text style={tw`text-base text-gray-700 mt-2`}>
          Industry: {user.occupation || "N/A"}
        </Text>
      </View>

      {/* Connect Button */}
      {!loading && (
        <TouchableOpacity
          style={tw`mt-6 bg-primary500 px-4 py-2 rounded-lg`}
          onPress={isConnected ? handleDisconnect : handleConnect}
        >
          <Text style={tw`text-white text-lg font-bold`}>
            {isConnected ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default UserProfileScreen;
