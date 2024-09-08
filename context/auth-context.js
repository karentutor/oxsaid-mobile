import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState, useMemo } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: "",
    access_token: "",
  });

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        const access_token = await AsyncStorage.getItem("access_token");

        setAuth({
          user: userJson ? JSON.parse(userJson) : "",
          access_token: access_token || "",
        });
      } catch (error) {
        console.error("Failed to load auth data:", error);
      }
    };

    loadAuthData();
  }, []);

  const authenticate = async (token, user) => {
    setAuth({ access_token: token || "", user: user || "" }); // Store both token and user in the state
    try {
      await AsyncStorage.setItem("access_token", token || "");
      await AsyncStorage.setItem("user", user ? JSON.stringify(user) : "");
    } catch (error) {
      console.error("Failed to save auth data:", error);
    }
  };

  const logout = async () => {
    setAuth({ access_token: "", user: "" });
    try {
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Failed to remove auth data:", error);
    }
  };

  // Expose `auth`, `setAuth`, and the utility functions
  const value = useMemo(
    () => ({
      auth,
      setAuth, // Expose `setAuth` here
      isAuthenticated: !!auth.access_token,
      authenticate,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;
