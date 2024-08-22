import React, { useContext } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import UserSearchScreen from "../screens/UserSearchScreen";
import FriendsListScreen from "../screens/FriendsListScreen";
// import ChatListScreen from "../screens/ChatListScreen"; // Commented out
// import ChatScreen from "../screens/ChatScreen"; // Commented out
import ChatTestScreen from "../screens/ChatTestScreen"; // New import
import { Colors } from "../constants/styles";
import IconButton from "../components/ui/IconButton";
import useAuth from "../hooks/useAuth";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function ChatStack() {
  const { auth } = useAuth(); // Get the auth context to access userId

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: "white",
        contentStyle: { backgroundColor: Colors.primary100 },
      }}
    >
      <Stack.Screen
        name="ChatTest"
        component={ChatTestScreen}
        options={{ headerShown: false }} // Hide the secondary header
      />
    </Stack.Navigator>
  );
}

function MainDrawerNavigator() {
  const { auth } = useAuth(); // Get the auth context to access userId

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
            onPress={auth.logout}
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
      <Drawer.Screen
        name="Chats"
        component={ChatStack}
        options={{ title: "Chats" }} // This will be the only header shown
      />
    </Drawer.Navigator>
  );
}

export default MainDrawerNavigator;
