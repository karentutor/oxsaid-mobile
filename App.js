import React, { useState, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import * as Font from "expo-font";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Define the Drawer Screens
function DrawerScreens() {
  return (
    <Drawer.Navigator
      screenOptions={{
        header: () => <Header />, // Custom header component
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

function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        "Rubik-Regular": require("./assets/fonts/Rubik-Regular.ttf"),
      });
      setFontsLoaded(true);
    } catch (error) {
      //    console.error("Error loading fonts", error);
      // Ensure no strings or unexpected outputs are rendered
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    // Display a simple loading screen while fonts are loading
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
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
  );
}

export default App;
