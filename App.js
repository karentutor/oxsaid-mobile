import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading"; // Optional: To handle the loading state

import { AuthProvider } from "./context"; // Ensure correct import path for AuthProvider

// Import your screens
import Landing from "./pages/Landing";
// import Join from './pages/auth/Join';
// import Register from './pages/auth/Register';
// import Signin from './pages/auth/Signin';
import Home from "./pages/Home";
import Settings from "./pages/Settings";
// Add other imports...

const Stack = createNativeStackNavigator();

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
          {/* <Stack.Screen name="Join" component={Join} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Signin" component={Signin} /> */}

          {/* Protected Routes */}
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Settings" component={Settings} />
          {/* Add other screens here */}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </AuthProvider>
  );
}
