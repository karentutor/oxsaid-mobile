import ExpoModulesCore          // exposes ExpoAppDelegate
import PushKit                 // VoIP pushes

@UIApplicationMain
class AppDelegate: ExpoAppDelegate,
                   PKPushRegistryDelegate {   // ✔ inherits & conforms

  // MARK: App launch --------------------------------------------------

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
  ) -> Bool {

    // Register for VoIP pushes
    RNVoipPushNotificationManager.voipRegistration()

    // Let Expo finish its normal set‑up
    return super.application(
      application,
      didFinishLaunchingWithOptions: launchOptions
    )
  }

  // MARK: PushKit delegate -------------------------------------------

  /// VoIP token received (Xcode 15+ signature)
  func pushRegistry(
    _ registry: PKPushRegistry,
    didUpdate pushCredentials: PKPushCredentials,
    for type: PKPushType
  ) {
    RNVoipPushNotificationManager.didUpdate(pushCredentials, forType: type.rawValue)
  }

  /// Incoming VoIP push (iOS 11+ signature)
  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    completion: @escaping () -> Void
  ) {
    RNVoipPushNotificationManager.didReceiveIncomingPush(
      with: payload,
      forType: type.rawValue,
      completion: completion
    )
  }
}
