import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";
import UserSearchScreen from "../screens/UserSearchScreen";
import FriendsListScreen from "../screens/FriendsListScreen";
import { Colors } from "../constants/styles";
import IconButton from "../components/ui/IconButton";
import useAuth from "../hooks/useAuth";

const Drawer = createDrawerNavigator();

function MainDrawerNavigator() {
  const { logout } = useAuth(); // Correctly destructuring logout from auth context

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: "white",
        headerRight: ({ tintColor }) => (
          <IconButton
            icon="exit"
            color={tintColor}
            size={24}
            onPress={logout} // Ensure logout function is referenced correctly
          />
        ),
        drawerContentStyle: {
          backgroundColor: Colors.primary800,
          paddingTop: 30,
        },
        drawerInactiveTintColor: Colors.secondary500,
        drawerActiveTintColor: Colors.primary500,
        drawerActiveBackgroundColor: Colors.primary100,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="User Search" component={UserSearchScreen} />
      <Drawer.Screen name="Friends List" component={FriendsListScreen} />
      {/* Removed the "Chats" screen here to keep it out of the drawer */}
    </Drawer.Navigator>
  );
}

export default MainDrawerNavigator;
