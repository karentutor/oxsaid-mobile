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
import LoginScreen from "./screens/LoginScreen";
import { Colors } from "./constants/styles";
import { axiosBase } from "./services/BaseService";

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
    console.log("Expo Push Token:", token);
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
      registerForPushNotificationsAsync(
        "10ba9ecc-625e-4550-8388-2984b9813f02"
      ).then((token) => {
        console.log("Expo Push Token:", token);
      });
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

// // App.js

// import React, { useContext, useState, useEffect } from "react";
// import { StatusBar } from "expo-status-bar";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as SplashScreen from "expo-splash-screen";
// import AuthContextProvider, { AuthContext } from "./context/auth-context";
// import MainDrawerNavigator from "./navigators/MainDrawerNavigator";
// import LoginScreen from "./screens/LoginScreen";
// import UserProfileScreen from "./screens/UserProfileScreen";
// import ChatScreen from "./screens/ChatScreen";
// import EmailScreen from "./screens/EmailScreen"; // Import the EmailScreen component
// import CreateBusinessScreen from "./screens/CreateBusinessScreen";
// import { Colors } from "./constants/styles";
// import {
//   registerForPushNotificationsAsync,
//   updateBadgeCount,
//   requestPermissionsAsync,
// } from "./services/NotificationService";
// import { axiosBase } from "./services/BaseService";

// const Stack = createNativeStackNavigator();

// SplashScreen.preventAutoHideAsync();

// function AuthStack() {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerStyle: { backgroundColor: Colors.primary500 },
//         headerTintColor: "white",
//         contentStyle: { backgroundColor: Colors.primary100 },
//       }}
//     >
//       <Stack.Screen name="Oxsaid Login" component={LoginScreen} />
//     </Stack.Navigator>
//   );
// }

// function AuthenticatedStack() {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerStyle: { backgroundColor: Colors.primary500 },
//         headerTintColor: "white",
//         contentStyle: { backgroundColor: Colors.primary100 },
//       }}
//     >
//       <Stack.Screen
//         name="MainDrawer"
//         component={MainDrawerNavigator}
//         options={{ headerShown: false }}
//       />
//       <Stack.Screen
//         name="UserProfile"
//         component={UserProfileScreen}
//         options={{ title: "User Profile" }}
//       />
//       <Stack.Screen
//         name="ChatScreen"
//         component={ChatScreen}
//         options={{ title: "Chat" }}
//       />
//       <Stack.Screen
//         name="EmailScreen"
//         component={EmailScreen} // Add EmailScreen to the stack
//         options={{ title: "Send Email" }}
//       />
//       <Stack.Screen
//         name="CreateBusiness"
//         component={CreateBusinessScreen}
//         options={{ title: "Create Business" }} // Add CreateBusinessScreen to the stack
//       />
//     </Stack.Navigator>
//   );
// }

// function Navigation() {
//   const authCtx = useContext(AuthContext);

//   return (
//     <NavigationContainer>
//       {!authCtx.isAuthenticated && <AuthStack />}
//       {authCtx.isAuthenticated && <AuthenticatedStack />}
//     </NavigationContainer>
//   );
// }

// function Root() {
//   const [isTryingLogin, setIsTryingLogin] = useState(true);
//   const authCtx = useContext(AuthContext);

//   useEffect(() => {
//     async function fetchToken() {
//       try {
//         const storedToken = await AsyncStorage.getItem("access_token");
//         const storedUser = await AsyncStorage.getItem("user");

//         if (storedToken) {
//           const user = storedUser ? JSON.parse(storedUser) : null;
//           if (user) {
//             authCtx.authenticate(storedToken, user);
//           }
//         }
//       } catch (error) {
//         console.error("Failed to fetch token", error);
//       } finally {
//         setIsTryingLogin(false);
//         await SplashScreen.hideAsync();
//       }
//     }

//     fetchToken();
//   }, []);

//   useEffect(() => {
//     async function requestPermissions() {
//       const permissionGranted = await requestPermissionsAsync();
//       if (!permissionGranted) {
//         Alert.alert(
//           "Permission Required",
//           "Notifications permissions are required to receive updates. Please go to Settings and enable notifications for this app.",
//           [{ text: "OK", onPress: () => Linking.openSettings() }]
//         );
//       }
//     }

//     requestPermissions();

//     if (authCtx.isAuthenticated && authCtx.user && authCtx.user._id) {
//       registerForPushNotificationsAsync(
//         "10ba9ecc-625e-4550-8388-2984b9813f02"
//       ).then((token) => {
//         console.log("Expo Push Token:", token);
//       });

//       const fetchUnreadMessagesCount = async () => {
//         try {
//           const response = await axiosBase.get(
//             `/chats/unread-count/${authCtx.user._id}`
//           );
//           const count = response.data.unreadCount;
//           updateBadgeCount(count);
//           await Notifications.setBadgeCountAsync(5); // Example of manually setting badge count to 5
//           console.log("Badge count set to 5 manually"); // Log to confirm the badge was set manually
//         } catch (error) {
//           console.error("Error fetching unread message count:", error);
//         }
//       };

//       fetchUnreadMessagesCount();
//       const intervalId = setInterval(fetchUnreadMessagesCount, 10000);

//       return () => clearInterval(intervalId);
//     }
//   }, [authCtx.isAuthenticated, authCtx.user]);

//   if (isTryingLogin) {
//     return null;
//   }

//   return <Navigation />;
// }

// export default function App() {
//   return (
//     <>
//       <StatusBar style="light" />
//       <AuthContextProvider>
//         <Root />
//       </AuthContextProvider>
//     </>
//   );
// }
