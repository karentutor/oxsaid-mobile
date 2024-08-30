//const projectId = "10ba9ecc-625e-4550-8388-2984b9813f02"; // Replace with your actual Expo project ID
// NotificationService.js

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export const requestPermissionsAsync = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return false;
  }

  return true;
};

// Update badge count on app icon
export const updateBadgeCount = async (count) => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    await Notifications.setBadgeCountAsync(count);
  }
};

// Register for push notifications and get the Expo push token
export const registerForPushNotificationsAsync = async (projectId) => {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    // Get Expo push token with projectId
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log("Expo Push Token:", token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
};
