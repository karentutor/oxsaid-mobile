// src/services/BaseService.ts
import axios from 'axios'
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ??
  'https://api.oxsaid.net'

export const axiosBase = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
})

axiosBase.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token')
    if (token && config.headers) {
      // Attach to _this_ request
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
