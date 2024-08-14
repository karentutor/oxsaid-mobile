import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { navLinks } from "../../data";
import tw from "twrnc";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function Header() {
  const navigation = useNavigation();
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  const changeBg = () => setIsHeaderScrolled(window.scrollY > 50);

  // Change Background on scroll
  useEffect(() => {
    window.addEventListener("scroll", changeBg);
    return () => window.removeEventListener("scroll", changeBg);
  }, []);

  return (
    <View
      style={tw`fixed top-0 z-40 w-full ${
        isHeaderScrolled ? "bg-gray-100 shadow" : "bg-transparent"
      }`}
    >
      <NavigationMenu style={tw`mx-auto py-2 overflow-hidden`}>
        <NavigationMenuList style={tw`container flex justify-between px-4`}>
          <NavigationMenuItem style={tw`font-bold flex`}>
            <Image
              source={{ uri: "/imgs/logo-large-light.png" }}
              style={tw`w-36`}
            />
          </NavigationMenuItem>

          {/* Mobile Menu */}
          <TouchableOpacity
            style={tw`md:hidden px-2`}
            onPress={() => navigation.toggleDrawer()}
          >
            <Icon name="menu" size={24} />
          </TouchableOpacity>

          {/* Desktop Menu */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={tw`hidden md:flex flex-row space-x-2`}
          >
            {navLinks.map((route, i) => (
              <NavigationMenuTrigger
                key={i}
                onPress={() => navigation.navigate(route.href)}
              >
                <Text style={tw`text-sm font-medium`}>{route.label}</Text>
              </NavigationMenuTrigger>
            ))}
          </ScrollView>
        </NavigationMenuList>
      </NavigationMenu>
    </View>
  );
}
