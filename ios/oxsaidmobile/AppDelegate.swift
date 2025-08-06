import UIKit
import ExpoModulesCore        // gives access to ExpoAppDelegate
import PushKit               // VoIP pushes

@UIApplicationMain           // Expo template uses this
class AppDelegate: ExpoAppDelegate,
                   PKPushRegistryDelegate {

  // MARK: App launch -----------------------------------------------

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
  ) -> Bool {

    // Register for VoIP pushes
    RNVoipPushNotificationManager.voipRegistration()

    // Continue normal Expo initialisation
    return super.application(
      application,
      didFinishLaunchingWithOptions: launchOptions
    )
  }

  // MARK: PushKit delegate -----------------------------------------

  /// VoIP token received
  func pushRegistry(
    _ registry: PKPushRegistry,
    didUpdate pushCredentials: PKPushCredentials,
    for type: PKPushType
  ) {
    RNVoipPushNotificationManager.didUpdate(
      pushCredentials,
      forType: type.rawValue
    )
  }

  /// Incoming VoIP push
  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    withCompletionHandler completion: @escaping () -> Void
  ) {
    RNVoipPushNotificationManager.didReceiveIncomingPush(
      with: payload,
      forType: type.rawValue
    )
    completion()      // <- call the system completion handler
  }
}
