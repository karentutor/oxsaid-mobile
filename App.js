import React, { useContext, useState, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppLoading from "expo-app-loading";

import LoginScreen from "./screens/LoginScreen";
// import SignupScreen from "./screens/SignupScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import { Colors } from "./constants/styles";
import AuthContextProvider, { AuthContext } from "./context/auth-context";
import IconButton from "./components/ui/IconButton";

import Landing from "./screens/Landing";
import Home from "./screens/Home";
import * as Font from "expo-font";

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
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* <Stack.Screen name="Signup" component={SignupScreen} /> */}
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  const authCtx = useContext(AuthContext);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: "white",
        contentStyle: { backgroundColor: Colors.primary100 },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          headerRight: ({ tintColor }) => (
            <IconButton
              icon="exit"
              color={tintColor}
              size={24}
              onPress={authCtx.logout}
            />
          ),
        }}
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

// // Define the Drawer Screens
// function DrawerScreens() {
//   return (
//     <Drawer.Navigator
//       screenOptions={{
//         header: () => <Header />, // Custom header component
//       }}
//     >
//       {navLinks.map((route, i) => (
//         <Drawer.Screen
//           key={i}
//           name={route.href}
//           component={Home} // Replace with the correct component for each route
//           options={{ title: route.label }}
//         />
//       ))}
//       <Drawer.Screen name="Settings" component={Settings} />
//     </Drawer.Navigator>
//   );
// }

// function App() {
//   const [fontsLoaded, setFontsLoaded] = useState(false);

//   const loadFonts = async () => {
//     try {
//       await Font.loadAsync({
//         "Rubik-Regular": require("./assets/fonts/Rubik-Regular.ttf"),
//       });
//       setFontsLoaded(true);
//     } catch (error) {
//       //    console.error("Error loading fonts", error);
//       // Ensure no strings or unexpected outputs are rendered
//     }
//   };

//   useEffect(() => {
//     loadFonts();
//   }, []);

//   if (!fontsLoaded) {
//     // Display a simple loading screen while fonts are loading
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Landing">
//         {/* Public Routes */}
//         <Stack.Screen name="Landing" component={Landing} />

//         {/* Drawer Navigation */}
//         <Stack.Screen
//           name="DrawerScreens"
//           component={DrawerScreens}
//           options={{ headerShown: false }}
//         />

//         {/* Protected Routes (if you have any specific routes that shouldn't be in the drawer) */}
//         {/* Add other stack screens here */}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// export default App;
