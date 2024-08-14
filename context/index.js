import React, { createContext, useMemo, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    if (typeof window !== "undefined") {
      let user = null;
      let access_token = null;

      try {
        const userJson = localStorage.getItem("user");
        if (userJson) {
          user = JSON.parse(userJson);
        }
      } catch (jsonError) {
        // Handle the error silently
      }

      try {
        access_token = localStorage.getItem("token");
      } catch (error) {
        // Handle the error silently
      }

      return { user, access_token };
    }

    return {};
  });

  const value = useMemo(() => ({ auth, setAuth }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
