import ExpoModulesCore            // already present
import PushKit                    // 🆕 VoIP pushes

@UIApplicationMain
class AppDelegate: ExpoAppDelegate,
                   PKPushRegistryDelegate {          // 🆕 add the protocol

  // MARK: - App launch ------------------------------------------------

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
  ) -> Bool {

    // 1️⃣ Register with PushKit so the app receives VoIP pushes
    RNVoipPushNotificationManager.voipRegistration()

    // 2️⃣ Everything else comes from ExpoAppDelegate (OTA, Dev Menu, etc.)
    return super.application(
      application,
      didFinishLaunchingWithOptions: launchOptions
    )
  }

  // MARK: - PushKit delegate methods ----------------------------------

  /// APNs just handed us the device‑token
  func pushRegistry(
    _ registry: PKPushRegistry,
    didUpdate pushCredentials: PKPushCredentials,
    for type: PKPushType
  ) {
    RNVoipPushNotificationManager.didUpdatePushCredentials(
      pushCredentials,
      forType: type.rawValue
    )
  }

  /// APNs says the token is no longer valid
  func pushRegistry(
    _ registry: PKPushRegistry,
    didInvalidatePushTokenFor type: PKPushType
  ) {
    RNVoipPushNotificationManager.didInvalidatePushToken()
  }

  /// A VoIP push arrived (iOS 11+ signature)
  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    withCompletionHandler completion: @escaping () -> Void
  ) {
    RNVoipPushNotificationManager.didReceiveIncomingPush(
      with: payload,
      forType: type.rawValue,
      withCompletionHandler: completion
    )
  }
}
