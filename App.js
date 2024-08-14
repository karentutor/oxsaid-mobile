import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Header from "./components/landing/Header";
import { navLinks } from "./data";
import Toast from "react-native-toast-message";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";

import { AuthProvider } from "./context";

// Import your screens
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
// Add other imports...

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Define the Drawer Screens
function DrawerScreens() {
  return (
    <Drawer.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />, // Custom header component
      }}
    >
      {navLinks.map((route, i) => (
        <Drawer.Screen
          key={i}
          name={route.href}
          component={Home} // Replace with the correct component for each route
          options={{ title: route.label }}
        />
      ))}
      <Drawer.Screen name="Settings" component={Settings} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      "Rubik-Regular": require("./assets/fonts/Rubik-Regular.ttf"),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />; // Display a loading screen until fonts are loaded
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Landing">
          {/* Public Routes */}
          <Stack.Screen name="Landing" component={Landing} />

          {/* Drawer Navigation */}
          <Stack.Screen
            name="DrawerScreens"
            component={DrawerScreens}
            options={{ headerShown: false }}
          />

          {/* Protected Routes (if you have any specific routes that shouldn't be in the drawer) */}
          {/* Add other stack screens here */}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </AuthProvider>
  );
}
