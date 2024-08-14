import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { MaterialIcons } from "@expo/vector-icons"; // Importing MaterialIcons from Expo

const NavigationMenu = React.forwardRef(
  ({ style, children, ...props }, ref) => (
    <View
      ref={ref}
      style={[tw`relative z-10 flex flex-row justify-center`, style]}
      {...props}
    >
      {children}
    </View>
  )
);

const NavigationMenuList = React.forwardRef(({ style, ...props }, ref) => (
  <View
    ref={ref}
    style={[tw`flex flex-row items-center justify-center space-x-2`, style]}
    {...props}
  />
));

const NavigationMenuItem = ({ style, children, ...props }) => (
  <TouchableOpacity
    style={[tw`h-10 justify-center rounded-md bg-gray-200 px-4 py-2`, style]}
    {...props}
  >
    {children}
  </TouchableOpacity>
);

const NavigationMenuTrigger = React.forwardRef(
  ({ style, children, ...props }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[tw`flex-row items-center`, style]}
      {...props}
    >
      {children}
      <MaterialIcons name="arrow-drop-down" size={16} style={tw`ml-1`} />
    </TouchableOpacity>
  )
);

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
};
