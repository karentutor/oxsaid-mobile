import React from "react";
import { View, Text } from "react-native";
import tw from "twrnc";
// import useTailwindResponsive from "../utils/useTailwindResponsive";

export default function Landing() {
  // const styles = useTailwindResponsive();
  console.log("Landing component rendered"); // Debug log

  return (
    // <View style={styles.indexGrid}>
    <View>
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-xl text-primary`}>
          Landing Page
          {/* <Text> Welcome to the Landing Page</Text> */}
        </Text>
      </View>
    </View>
  );
}
