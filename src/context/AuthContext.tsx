// src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type User = {
  _id: string
  firstName: string
  lastName: string
  email: string
  // …other fields from your backend
}

type AuthState = {
  user: User | null
  accessToken: string
}

type AuthContextType = {
  auth: AuthState
  isAuthenticated: boolean
  authenticate: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  auth: { user: null, accessToken: '' },
  isAuthenticated: false,
  authenticate: async () => {},
  logout: async () => {},
})

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    accessToken: '',
  })

  useEffect(() => {
    ;(async () => {
      const token = await AsyncStorage.getItem('access_token')
      const userJson = await AsyncStorage.getItem('user')
      if (token && userJson) {
        try {
          const user = JSON.parse(userJson) as User
          setAuth({ accessToken: token, user })
        } catch {
          await AsyncStorage.multiRemove(['access_token', 'user'])
        }
      }
    })()
  }, [])

  const authenticate = async (token: string, user: User) => {
    setAuth({ accessToken: token, user })
    await AsyncStorage.setItem('access_token', token)
    await AsyncStorage.setItem('user', JSON.stringify(user))
  }

  const logout = async () => {
    setAuth({ accessToken: '', user: null })
    await AsyncStorage.multiRemove(['access_token', 'user'])
  }

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth.accessToken),
      authenticate,
      logout,
    }),
    [auth]
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}
