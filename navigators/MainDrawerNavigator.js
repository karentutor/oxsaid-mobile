import React, { useEffect, useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";
import UserSearchScreen from "../screens/UserSearchScreen";
import FriendsListScreen from "../screens/FriendsListScreen";
import GroupsScreen from "../screens/GroupsScreen";
import BusinessesScreen from "../screens/BusinessesScreen";
import EventsScene from "../screens/EventsScene";
import ChatListScreen from "../screens/ChatListScreen"; // Import ChatListScreen
import { Colors } from "../constants/styles";
import IconButton from "../components/ui/IconButton";
import useAuth from "../hooks/useAuth";
import tw from "twrnc";
import { axiosBase } from "../services/BaseService";
import { View, Text, TouchableOpacity } from "react-native"; // Import necessary components
import { MaterialIcons } from "@expo/vector-icons";

const Drawer = createDrawerNavigator();

function MainDrawerNavigator() {
  const { logout, auth } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Function to fetch unread messages count
    const fetchUnreadMessagesCount = async () => {
      try {
        const response = await axiosBase.get(
          `/chats/unread-count/${auth.user._id}`
        );
        setUnreadCount(response.data.unreadCount); // Update the unread count
      } catch (error) {
        console.log("Error fetching unread message count:", error);
      }
    };

    fetchUnreadMessagesCount(); // Initial fetch on mount

    // Optionally, set up an interval to refresh the count periodically
    const intervalId = setInterval(fetchUnreadMessagesCount, 10000); // Refresh every 10 seconds

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [auth.user._id]);

  return (
    <Drawer.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: "white",
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
            <MaterialIcons
              name="menu"
              size={28}
              color="white"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        ),
        headerRight: ({ tintColor }) => (
          <IconButton
            icon="exit"
            color={tintColor}
            size={24}
            onPress={logout}
          />
        ),
        drawerContentStyle: {
          backgroundColor: Colors.primary800,
          paddingTop: 30,
        },
        drawerInactiveTintColor: Colors.secondary500,
        drawerActiveTintColor: Colors.primary500,
        drawerActiveBackgroundColor: Colors.primary100,
      })}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="User Search" component={UserSearchScreen} />
      <Drawer.Screen name="Following List" component={FriendsListScreen} />
      <Drawer.Screen name="Businesses" component={BusinessesScreen} />
      <Drawer.Screen name="Groups" component={GroupsScreen} />
      <Drawer.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          title: "Chats",
          drawerLabel: ({ color }) => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color }}>Chats</Text>
              {unreadCount > 0 && (
                <View
                  style={tw`bg-red-500 rounded-full h-5 w-5 items-center justify-center ml-2`}
                >
                  <Text style={tw`text-white text-xs`}>{unreadCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default MainDrawerNavigator;
