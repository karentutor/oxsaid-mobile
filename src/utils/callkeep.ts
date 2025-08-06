// src/utils/callKeep.ts
import RNCallKeep, { IOptions } from 'react-native-callkeep';
import { Platform }             from 'react-native';

let configured = false;

export async function ensureCallKeep(): Promise<void> {
  if (configured) return;

  const options: IOptions = {
    ios: {
      appName: 'Oxsaid',
      supportsVideo: true,
      includesCallsInRecents: false,
    },

    android: {
      alertTitle:       'Permissions required',
      alertDescription: 'Allow Oxsaid to display calls',
      okButton:         'OK',
      cancelButton:     'Cancel',

      additionalPermissions: [
        'android.permission.POST_NOTIFICATIONS',
      ],

      foregroundService: {
        channelId:         'oxsaid-calls',
        channelName:       'Video calls',
        notificationTitle: 'Oxsaid video call',
        notificationIcon:  'ic_launcher',  // mipmap/… already generated
      },
    },
  };

  try {
    // 1) Setup CallKeep (registers phone account on Android under the hood)
    await RNCallKeep.setup(options);
    // 2) Let the OS know your app can handle calls
    RNCallKeep.setAvailable(true);
    configured = true;
  } catch (err: any) {
    console.error('🔥 CallKeep setup failed:', err);
    return;  // bail out if we couldn’t initialize
  }

  /************* one global bridge  ****************/
  RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
    globalThis.dispatchEvent(
      new CustomEvent('CALLKEEP_ANSWER', { detail: callUUID })
    );
  });
  RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
    globalThis.dispatchEvent(
      new CustomEvent('CALLKEEP_END', { detail: callUUID })
    );
  });

  // No manual registerPhoneAccount needed – setup() covers it.
}
