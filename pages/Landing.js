import React from "react";
import { View, Text } from "react-native";
import tw from "../tailwind";
import useTailwindResponsive from "../utils/useTailwindResponsive";

export default function Home() {
  const styles = useTailwindResponsive();

  return (
    <View style={styles.indexGrid}>
      <Text style={tw`text-xl font-bold`}>Welcome to the Home Page</Text>
    </View>
  );
}
