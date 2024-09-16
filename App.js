import React, { useContext, useState, useEffect } from "react";
import { View, Text, Alert, Platform, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import AuthContextProvider, { AuthContext } from "./context/auth-context";
import MainDrawerNavigator from "./navigators/MainDrawerNavigator";
//screens
import { Colors } from "./constants/styles";
import { axiosBase } from "./services/BaseService";
import ChatScreen from "./screens/ChatScreen"; // Import ChatScreen
import CreateBusinessScreen from "./screens/CreateBusinessScreen"; // Import ChatScreen
import EmailScreen from "./screens/EmailScreen"; // Import EmailScreen
import GroupProfileScreen from "./screens/GroupProfileScreen"; // Import EmailScreen
import LoginScreen from "./screens/LoginScreen";
import UserProfileScreen from "./screens/UserProfileScreen"; // Import EmailScreen
import UpsertGroupScreen from "./screens/UpsertGroupScreen"; // Import EmailScreen

// Set up notification handler for background badge updates
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true, // Enable badge updates when app is in the background
  }),
});

// Function to update badge count on app icon
async function updateBadgeCount(count) {
  try {
    await Notifications.setBadgeCountAsync(count); // Update app icon badge
  } catch (error) {
    console.error("Failed to set badge count:", error);
  }
}

// Notification permission setup
async function requestPermissionsAsync() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === "granted";
  }
  return status === "granted";
}

// Function to register for push notifications
async function registerForPushNotificationsAsync(projectId) {
  let token;
  if (Platform.OS !== "web") {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please enable notifications to see badge counts.",
        [{ text: "OK", onPress: () => Linking.openSettings() }]
      );
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    //console.log("Expo Push Token:", token); // this is development
    axiosBase
      .post(`/users/push-token`, { token }) // <-- tthis for production
      .then((response) => {
        console.log("Push token sent to backend");
      })
      .catch((error) => {
        console.error("Failed to send push token to backend:", error);
      });
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      showBadge: true,
    });
  }

  return token;
}

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
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen
        name="CreateBusinessScreen"
        component={CreateBusinessScreen}
      />
      <Stack.Screen name="EmailScreen" component={EmailScreen} />
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <Stack.Screen name="GroupProfileScreen" component={GroupProfileScreen} />
      <Stack.Screen name="UpsertGroupScreen" component={UpsertGroupScreen} />
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
  const [badgeCount, setBadgeCount] = useState(0); // For badge count

  useEffect(() => {
    if (authCtx.isAuthenticated && authCtx.user && authCtx.user._id) {
      const fetchUnreadMessagesCount = async () => {
        try {
          const response = await axiosBase.get(
            `/chats/unread-count/${authCtx.user._id}`
          );
          const count = response.data.unreadCount;
          console.log("app useeffect", count);
          setBadgeCount(count); // Update local state
          updateBadgeCount(count); // Update badge count on the app icon
        } catch (error) {
          console.error("Error fetching unread message count:", error);
        }
      };

      fetchUnreadMessagesCount();
      const intervalId = setInterval(fetchUnreadMessagesCount, 10000); // Poll every 10 seconds

      return () => clearInterval(intervalId); // Clean up on unmount
    }
  }, [authCtx.isAuthenticated, authCtx.user]);

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
      // production
      registerForPushNotificationsAsync().then((token) => {
        // Optional log for debugging purposes, can be removed in production
        //    console.log("Expo Push Token:", token);
      });
      // development
      // registerForPushNotificationsAsync(
      //   "10ba9ecc-625e-4550-8388-2984b9813f02"
      // ).then((token) => {
      //   console.log("Expo Push Token:", token);
      // });
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
