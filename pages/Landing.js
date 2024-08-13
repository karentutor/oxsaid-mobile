import React from "react";
import { View, Text } from "react-native";
import tw from "../tailwind";
import useTailwindResponsive from "../utils/useTailwindResponsive";

export default function Home() {
  const styles = useTailwindResponsive();

  return (
    <View style={styles.indexGrid}>
      <View style={tw`flex-1 justify-center items-center bg-background`}>
        <Text style={tw`text-xl font-rubik text-primary`}>
          Welcome to the Landing Page
        </Text>
      </View>
    </View>
  );
}
