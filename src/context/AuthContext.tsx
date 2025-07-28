/* src/context/AuthContext.tsx */
import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type AuthState = { user: User | null; accessToken: string };

type AuthContextType = {
  auth: AuthState;
  isAuthenticated: boolean;
  authenticate(token: string, rawUser: any): Promise<void>;
  logout(): Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  auth: { user: null, accessToken: '' },
  isAuthenticated: false,
  authenticate: async () => {},
  logout: async () => {},
});

/* helper */
function normaliseUser(raw: any): User {
  const id =
    raw?._id ??
    raw?.id ??
    raw?.userId ??
    raw?.uid ??
    '';                 // extend this list if your backend uses another key
  return { _id: id, ...raw };
}

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ user: null, accessToken: '' });

  /* bootstrap */
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('access_token');
      const saved = await AsyncStorage.getItem('user');
      if (token && saved) {
        try {
          const user = normaliseUser(JSON.parse(saved));
          if (user._id) setAuth({ accessToken: token, user });
          else await AsyncStorage.multiRemove(['access_token', 'user']);
        } catch {
          await AsyncStorage.multiRemove(['access_token', 'user']);
        }
      }
    })();
  }, []);

  /* login */
  const authenticate = async (token: string, rawUser: any) => {
    const user = normaliseUser(rawUser);
    setAuth({ accessToken: token, user });
    await AsyncStorage.setItem('access_token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    console.log('[Auth] stored user', user);             // ← debug once
  };

  /* logout */
  const logout = async () => {
    setAuth({ accessToken: '', user: null });
    await AsyncStorage.multiRemove(['access_token', 'user']);
  };

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth.accessToken && auth.user?._id),
      authenticate,
      logout,
    }),
    [auth],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
