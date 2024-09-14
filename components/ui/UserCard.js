import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import tw from "../../lib/tailwind";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import an icon library, e.g., MaterialIcons
import { axiosBase } from "../../services/BaseService";

const UserCard = ({ user }) => {
  const navigation = useNavigation();

  const handleChat = () => {
    navigation.navigate("ChatScreen", { user });
  };

  const handleEmail = () => {
    // Navigate to EmailScreen with user details
    navigation.navigate("EmailScreen", { user });
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("UserProfileScreen", { user })}
      style={tw`rounded-lg p-4 mt-2 w-full`}
      activeOpacity={0.7} // Ripple effect for Android and iOS (0.7 for slight transparency on tap)
    >
      <View>
        {/* Centered User Picture and Name */}
        <View style={tw`items-center`}>
          {/* User Picture */}
          {user.picturePath ? (
            <Image
              source={{ uri: user.picturePath }}
              style={tw`w-16 h-16 rounded-full mb-4`}
            />
          ) : (
            <View style={tw`w-16 h-16 rounded-full bg-gray-300 mb-4`} />
          )}

          {/* User Name */}
          <Text style={tw`text-xl font-bold text-black`}>
            {user.firstName} {user.lastName}
          </Text>
        </View>

        {/* User Details and Business Details in Two Columns */}
        <View style={tw`flex-row justify-between mt-4`}>
          {/* Left Column - User Details */}
          <View style={tw`flex-1`}>
            {user.city && <Text style={tw`text-gray-500`}>{user.city},</Text>}
            {user.location && (
              <Text style={tw`text-gray-500`}>{user.location}</Text>
            )}
            {user.college && (
              <Text style={tw`text-gray-500`}>{user.college}</Text>
            )}
            {user.matriculationYear && (
              <Text style={tw`text-gray-500`}>{user.matriculationYear}</Text>
            )}
          </View>

          {/* Right Column - Business and Occupation Details */}
          <View style={tw`flex-1`}>
            {user.occupation && (
              <Text style={tw`text-gray-500 mt-2`}>{user.occupation}</Text>
            )}
            {user.subOccupation && (
              <Text style={tw`text-gray-500 mt-2`}>{user.subOccupation}</Text>
            )}
          </View>
        </View>

        {/* Buttons for Chat and Email */}
        <View style={tw`flex-row justify-center mt-6`}>
          <TouchableOpacity
            onPress={handleChat}
            style={tw`bg-blue-500 rounded-lg p-2 w-1/2 mr-2`}
          >
            <Text style={tw`text-white text-center`}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleEmail}
            style={tw`bg-secondary500 rounded-lg p-2 w-1/2`}
          >
            <Text style={tw`text-center`}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // return (
  //   <View style={[tw`rounded-lg p-4 mt-2 w-full`]}>
  //     {/* Top Right Arrow and "View" Text */}
  //     {/* <TouchableOpacity style={tw`absolute top-2 right-2 items-center`}>
  //       <Icon name="arrow-forward-ios" size={20} color="gray" />
  //     </TouchableOpacity> */}

  //     {/* Centered User Picture and Name */}
  //     <View style={tw`items-center`}>
  //       {/* User Picture */}
  //       {user.picturePath ? (
  //         <Image
  //           source={{ uri: user.picturePath }}
  //           style={tw`w-16 h-16 rounded-full mb-4`}
  //         />
  //       ) : (
  //         <View style={tw`w-16 h-16 rounded-full bg-gray-300 mb-4`} />
  //       )}

  //       {/* User Name */}
  //       <Text style={tw`text-xl font-bold text-black`}>
  //         {user.firstName} {user.lastName}
  //       </Text>
  //     </View>

  //     {/* User Details and Business Details in Two Columns */}
  //     <View style={tw`flex-row justify-between mt-4`}>
  //       {/* Left Column - User Details */}
  //       <View style={tw`flex-1`}>
  //         {user.city && <Text style={tw`text-gray-500`}>{user.city},</Text>}
  //         {user.location && (
  //           <Text style={tw`text-gray-500`}>{user.location}</Text>
  //         )}
  //         {user.college && (
  //           <Text style={tw`text-gray-500`}>{user.college}</Text>
  //         )}
  //         {user.matriculationYear && (
  //           <Text style={tw`text-gray-500`}>{user.matriculationYear}</Text>
  //         )}
  //       </View>

  //       {/* Right Column - Business and Occupation Details */}
  //       <View style={tw`flex-1`}>
  //         {user.occupation && (
  //           <Text style={tw`text-gray-500 mt-2`}>{user.occupation}</Text>
  //         )}
  //         {user.subOccupation && (
  //           <Text style={tw`text-gray-500 mt-2`}>{user.subOccupation}</Text>
  //         )}
  //       </View>
  //     </View>

  //     {/* Buttons for Chat and Email */}
  //     <View style={tw`flex-row justify-center mt-6`}>
  //       <TouchableOpacity
  //         onPress={handleChat}
  //         style={tw`bg-blue-500 rounded-lg p-2 w-1/2 mr-2`}
  //       >
  //         <Text style={tw`text-white text-center`}>Chat</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity
  //         onPress={handleEmail}
  //         style={tw`bg-secondary500 rounded-lg p-2 w-1/2`}
  //       >
  //         <Text style={tw`text-center`}>Email</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </View>
  // );

  // return (
  //   <View style={[tw`rounded-lg p-4 mt-2 w-full`]}>
  //     {/* Top Right Arrow and "View" Text */}
  //     <TouchableOpacity style={tw`absolute top-2 right-2 items-center`}>
  //       <Icon name="arrow-forward-ios" size={20} color="gray" />
  //     </TouchableOpacity>

  //     <View style={tw`flex-row items-center`}>
  //       {/* User Picture */}
  //       {user.picturePath ? (
  //         <Image
  //           source={{ uri: user.picturePath }}
  //           style={tw`w-16 h-16 rounded-full mr-4`}
  //         />
  //       ) : (
  //         <View style={tw`w-16 h-16 rounded-full bg-gray-300 mr-4`} />
  //       )}
  //     </View>

  //     {/* User Details and Business Details in Two Columns */}
  //     <View style={tw`flex-row justify-between`}>
  //       {/* Left Column - User Details */}
  //       <View style={tw`flex-1`}>
  //         <Text style={tw`text-xl font-bold text-black`}>
  //           {user.firstName} {user.lastName}
  //         </Text>

  //         {user.city && <Text style={tw`text-gray-500`}>{user.city},</Text>}
  //         {user.location && (
  //           <Text style={tw`text-gray-500`}>{user.location}</Text>
  //         )}
  //         {user.college && (
  //           <Text style={tw`text-gray-500`}>{user.college}</Text>
  //         )}
  //         {user.matriculationYear && (
  //           <Text style={tw`text-gray-500`}>{user.matriculationYear}</Text>
  //         )}
  //       </View>

  //       {/* Right Column - Business and Occupation Details */}
  //       <View style={tw`flex-1 justify-start`}>
  //         {user.occupation && (
  //           <Text style={tw`text-gray-500 mt-2`}>{user.occupation}</Text>
  //         )}
  //         {user.subOccupation && (
  //           <Text style={tw`text-gray-500 mt-2`}>{user.subOccupation}</Text>
  //         )}
  //       </View>
  //     </View>

  //     {/* Buttons for Chat and Email */}
  //     <View style={tw`flex-row justify-center mt-6`}>
  //       <TouchableOpacity
  //         onPress={handleChat}
  //         style={tw`bg-blue-500 rounded-lg p-2 w-1/2 mr-2`}
  //       >
  //         <Text style={tw`text-white text-center`}>Chat</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity
  //         onPress={handleEmail}
  //         style={tw`bg-secondary500 rounded-lg p-2 w-1/2`}
  //       >
  //         <Text style={tw`text-center`}>Email</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </View>
  // );
};

export default UserCard;
