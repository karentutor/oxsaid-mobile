import { ConfigContext, ExpoConfig } from '@expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // Ensure required string fields are defined, falling back if necessary
  const name = config.name || 'oxsaid-mobile';
  const slug = config.slug || 'oxsaid-mobile';
  const version = config.version || '1.0.0';

  return {
    ...config,
    name,
    slug,
    version,
    sdkVersion: config.sdkVersion,
    orientation: config.orientation,
    icon: config.icon,
    userInterfaceStyle: config.userInterfaceStyle,
    splash: config.splash,
    updates: config.updates,
    assetBundlePatterns: config.assetBundlePatterns,
    ios: config.ios,
    android: config.android,
    web: config.web,
extra: {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  socketUrl:  process.env.EXPO_PUBLIC_SOCKET_URL,
  domain:     process.env.EXPO_PUBLIC_DOMAIN,
},

  };
};
