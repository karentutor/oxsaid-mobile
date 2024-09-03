// NotificationService.js

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert, Linking } from "react-native";

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestPermissionsAsync = async () => {
  try {
    console.log("Requesting notification permissions...");
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    console.log("Existing permission status:", existingStatus);
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("Updated permission status:", finalStatus);
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        "Permission Required",
        "Notifications permissions are required to receive updates. Please go to Settings and enable notifications for this app.",
        [{ text: "OK", onPress: () => Linking.openSettings() }]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error requesting permissions:", error);
    return false;
  }
};

export const updateBadgeCount = async (count) => {
  try {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      console.log("Setting badge count to:", count);
      await Notifications.setBadgeCountAsync(count);
      console.log("Badge count set successfully");
    }
  } catch (error) {
    console.error("Failed to set badge count:", error);
  }
};

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
      Alert.alert(
        "Permission Required",
        "Notifications permissions are required to receive updates. Please go to Settings and enable notifications for this app.",
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
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
};
