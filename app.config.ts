import { ConfigContext, ExpoConfig } from '@expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const NAME    = config.name    ?? 'oxsaid-mobile';
  const SLUG    = config.slug    ?? 'oxsaid-mobile';
  const VERSION = config.version ?? '1.0.0';

  const extra       = config.extra ?? {};
  const easExisting = (extra as any).eas ?? {};

  return {
    ...config,
    name:    NAME,
    slug:    SLUG,
    version: VERSION,

    ios: {
      ...config.ios,
      infoPlist: {
        ...(config.ios?.infoPlist || {}),
        NSCameraUsageDescription:      'Video calls',
        NSMicrophoneUsageDescription:  'Voice in video calls',
      },
    },

    android: {
      ...config.android,
      permissions: Array.from(
        new Set([
          ...(config.android?.permissions ?? []),
          'CAMERA',
          'RECORD_AUDIO',
          'MODIFY_AUDIO_SETTINGS',
        ])
      ),
    },

    extra: {
      ...extra,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      socketUrl:  process.env.EXPO_PUBLIC_SOCKET_URL,
      domain:     process.env.EXPO_PUBLIC_DOMAIN,
      eas: {
        ...easExisting,
        projectId: easExisting.projectId ?? '***YOUR_EAS_PROJECT_ID***',
      },
    },
  };
};
