// App.js

import React, { useContext, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import AuthContextProvider, { AuthContext } from "./context/auth-context";
import MainDrawerNavigator from "./navigators/MainDrawerNavigator";
import LoginScreen from "./screens/LoginScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import ChatScreen from "./screens/ChatScreen";
import { Colors } from "./constants/styles";
import {
  registerForPushNotificationsAsync,
  updateBadgeCount,
  requestPermissionsAsync,
} from "./services/NotificationService";
import { axiosBase } from "./services/BaseService";

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

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
        name="MainDrawer"
        component={MainDrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ title: "User Profile" }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ title: "Chat" }}
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
      try {
        const storedToken = await AsyncStorage.getItem("access_token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken) {
          const user = storedUser ? JSON.parse(storedUser) : null;
          if (user) {
            authCtx.authenticate(storedToken, user);
          }
        }
      } catch (error) {
        console.error("Failed to fetch token", error);
      } finally {
        setIsTryingLogin(false);
        await SplashScreen.hideAsync();
      }
    }

    fetchToken();
  }, []);

  useEffect(() => {
    async function requestPermissions() {
      const permissionGranted = await requestPermissionsAsync();
      if (!permissionGranted) {
        Alert.alert(
          "Permission Required",
          "Notifications permissions are required to receive updates. Please go to Settings and enable notifications for this app.",
          [{ text: "OK", onPress: () => Linking.openSettings() }]
        );
      }
    }

    requestPermissions();

    if (authCtx.isAuthenticated && authCtx.user && authCtx.user._id) {
      registerForPushNotificationsAsync(
        "10ba9ecc-625e-4550-8388-2984b9813f02"
      ).then((token) => {
        console.log("Expo Push Token:", token);
      });

      const fetchUnreadMessagesCount = async () => {
        try {
          const response = await axiosBase.get(
            `/chats/unread-count/${authCtx.user._id}`
          );
          const count = response.data.unreadCount;
          updateBadgeCount(count);
        } catch (error) {
          console.error("Error fetching unread message count:", error);
        }
      };

      fetchUnreadMessagesCount();
      const intervalId = setInterval(fetchUnreadMessagesCount, 10000);

      return () => clearInterval(intervalId);
    }
  }, [authCtx.isAuthenticated, authCtx.user]);

  if (isTryingLogin) {
    return null;
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
