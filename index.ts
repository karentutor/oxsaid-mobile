import { NativeModules } from 'react-native';

console.log('💡 InCallManager:', NativeModules.InCallManager);
console.log('💡 WebRTCModule:',   NativeModules.WebRTCModule);

// now hand off to Expo Router
import 'expo-router/entry';