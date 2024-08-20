import React, { useContext, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppLoading from "expo-app-loading";
import AuthContextProvider, { AuthContext } from "./context/auth-context";

import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import UserSearchScreen from "./screens/UserSearchScreen";
import UserProfileScreen from "./screens/UserProfileScreen"; // Import UserProfileScreen
import { Colors } from "./constants/styles";
import IconButton from "./components/ui/IconButton";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: "white",
        contentStyle: { backgroundColor: Colors.primary100 },
      }}
    >
      <Stack.Screen name="Oxsaid Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function DrawerNavigator() {
  const auth = useContext(AuthContext);

  return (
    <Drawer.Navigator
      screenOptions={({ navigation, route }) => ({
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
      })}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="User Search" component={UserSearchScreen} />
      {/* Add more drawer items here */}
    </Drawer.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: "white",
        contentStyle: { backgroundColor: Colors.primary100 },
      }}
    >
      <Stack.Screen
        name="Drawer"
        component={DrawerNavigator}
        options={{ headerShown: false }} // Hide the header to avoid double nav bars
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ title: "User Profile" }} // Set a title for the profile screen
      />
    </Stack.Navigator>
  );
}

function Navigation() {
  const authCtx = useContext(AuthContext);

  return (
    <NavigationContainer>
      {!authCtx.isAuthenticated && <AuthStack />}
      {authCtx.isAuthenticated && <AuthenticatedStack />}
    </NavigationContainer>
  );
}

function Root() {
  const [isTryingLogin, setIsTryingLogin] = useState(true);
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    async function fetchToken() {
      const storedToken = await AsyncStorage.getItem("token");

      if (storedToken) {
        authCtx.authenticate(storedToken);
      }

      setIsTryingLogin(false);
    }

    fetchToken();
  }, []);

  if (isTryingLogin) {
    return <AppLoading />;
  }

  return <Navigation />;
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AuthContextProvider>
        <Root />
      </AuthContextProvider>
    </>
  );
}
