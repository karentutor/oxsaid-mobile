import { ConfigContext, ExpoConfig } from 'expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const extra = config.extra ?? {};
  const existingEas = (extra as any).eas ?? {};

  return {
    /**  BASIC  ********************************************************/
    name: 'oxsaid-mobile',
    slug: 'oxsaid-mobile',
    version: '1.0.0',

    /**  iOS  **********************************************************/
    ios: {
      bundleIdentifier: 'com.karentutor1.oxsaidmobile2',
      supportsTablet: true,

      infoPlist: {
        NSCameraUsageDescription: 'Video calls',
        NSMicrophoneUsageDescription: 'Voice in video calls',
        NSBluetoothAlwaysUsageDescription:
          'Needed for routing audio to Bluetooth headsets',
        NSUserActivityTypes: ['io.wazo.call'],
        LSApplicationQueriesSchemes: ['tel', 'mailto', 'facetime'],
        UIBackgroundModes: ['voip', 'audio'],
        ITSAppUsesNonExemptEncryption: false,
      },

      /* ❌  The unrestricted‑voip entitlement was deprecated in iOS 16
       *     and removed from the iOS 26 SDK, so do NOT declare it.      */
    },

    /**  Android *******************************************************/
    android: {
      package: 'com.karentutor1.oxsaidmobile2',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: [
        'CAMERA',
        'RECORD_AUDIO',
        'MODIFY_AUDIO_SETTINGS',
        /* CallKeep */
        'READ_PHONE_STATE',
        'CALL_PHONE',
        'USE_FULL_SCREEN_INTENT',
        'POST_NOTIFICATIONS',
      ],
      edgeToEdgeEnabled: true,
    },

    /**  Plugins  ******************************************************/
    plugins: [
      'expo-router',
      'expo-camera',
      'expo-av',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-font',
      'expo-web-browser',

      /* >>> MUST stay last so that static frameworks are applied <<< */
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            backgroundMode: ['audio', 'voip'], // keeps CallKeep & WebRTC alive
          },
          android: {},
        },
      ],
    ],

    /**  Extra  ********************************************************/
    extra: {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL,
      domain: process.env.EXPO_PUBLIC_DOMAIN,
      eas: {
        ...existingEas,
        projectId: '6c876c6b-c0bc-41df-8d73-b2fa04770c57',
      },
    },

    scheme: 'oxsaidmobile2',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    experiments: { typedRoutes: true },
  };
};
