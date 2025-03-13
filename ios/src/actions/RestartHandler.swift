//
//  RestartHandler.swift
//  apptileSeed
//
//  Created by Vadivazhagan on 13/03/25.
//
import Foundation
import React

class RestartHandler {
    static func loadDownloadedBundleAndRestart() {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first(where: { $0.isKeyWindow })
        else {
            NSLog("\(ApptileConstants.APPTILE_LOG_TAG): ❌ Failed to find the app window")
            return
        }

        guard let bundlePath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?
            .appendingPathComponent("bundles/main.jsbundle"),
            FileManager.default.fileExists(atPath: bundlePath.path)
        else {
            NSLog("\(ApptileConstants.APPTILE_LOG_TAG): ⚠️ Downloaded bundle not found, falling back to default")
            loadDefaultBundleAndRestart()
            return
        }

        NSLog("\(ApptileConstants.APPTILE_LOG_TAG): ✅ Loading downloaded bundle from: \(bundlePath.path)")

        // Set up a new RCTRootView with the downloaded bundle
        let rootView = RCTRootView(
            bundleURL: bundlePath,
            moduleName: "apptileSeed",
            initialProperties: nil,
            launchOptions: nil
        )

        RestartHandler.restartReactNativeApp(with: rootView, window: window)
    }

    static func loadDefaultBundleAndRestart() {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first(where: { $0.isKeyWindow })
        else {
            NSLog("\(ApptileConstants.APPTILE_LOG_TAG): ❌ Failed to find the app window")
            return
        }

        let defaultBundleURL: URL
        #if DEBUG
            defaultBundleURL = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource: nil)
        #else
            defaultBundleURL = Bundle.main.url(forResource: "main", withExtension: "jsbundle")!
        #endif

        let rootView = RCTRootView(
            bundleURL: defaultBundleURL,
            moduleName: "apptileSeed",
            initialProperties: nil,
            launchOptions: nil
        )

        RestartHandler.restartReactNativeApp(with: rootView, window: window)
    }

    static func restartReactNativeApp(with rootView: RCTRootView, window: UIWindow) {
        NSLog("\(ApptileConstants.APPTILE_LOG_TAG): 🔄 Restarting React Native app")

        // Create a new rootViewController with the new RCTRootView
        let newViewController = UIViewController()
        newViewController.view = rootView

        // Update the app's rootViewController
        window.rootViewController = newViewController
        window.makeKeyAndVisible()

        // Force a slight delay to ensure UI updates correctly
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            window.rootViewController = newViewController
        }
    }
}
