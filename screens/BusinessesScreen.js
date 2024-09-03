import React from "react";
import { View, Text } from "react-native";
import tw from "twrnc";

const BusinessesScene = () => {
  return (
    <View
      style={[
        tw`w-full mb-4 rounded-lg shadow-sm p-4 justify-center items-center`,
        {
          borderColor: "gray",
          borderWidth: 1, // Explicit border width for consistency across platforms
        },
      ]}
    >
      <Text style={tw`text-lg font-bold text-center`}>
        Oxsaid Alum Businesses Coming in Septebmer v2
      </Text>
    </View>
  );
};

export default BusinessesScene;
