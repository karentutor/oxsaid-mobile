import React from "react";
import { View, Text } from "react-native";
import tw from "../lib/tailwind";

export default function Landing() {
  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <Text style={tw`text-xl text-primary`}>Hi</Text>
    </View>
  );
}
