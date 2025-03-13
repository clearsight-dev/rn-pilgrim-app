//
//  RestartHandler.swift
//  apptileSeed
//
//  Created by Vadivazhagan on 13/03/25.
//

import Foundation
import React

class RestartHandler {
    // MARK: - Public API

    static func loadDownloadedBundleAndRestart() {
        guard let window = getAppWindow() else {
            logError("❌ Failed to find the app window")
            return
        }

        if let bundlePath = getDownloadedBundlePath(),
           FileManager.default.fileExists(atPath: bundlePath.path)
        {
            logSuccess("✅ Loading downloaded bundle from: \(bundlePath.path)")
            restartReactNativeApp(bundleURL: bundlePath, window: window)
        } else {
            logWarning("⚠️ Downloaded bundle not found, falling back to default")
            loadDefaultBundleAndRestart()
        }
    }

    static func loadDefaultBundleAndRestart() {
        guard let window = getAppWindow() else {
            logError("❌ Failed to find the app window")
            return
        }

        let defaultBundleURL = getDefaultBundleURL()
        restartReactNativeApp(bundleURL: defaultBundleURL, window: window)
    }

    // MARK: - Helper Methods

    private static func restartReactNativeApp(bundleURL: URL, window: UIWindow) {
        logInfo("🔄 Restarting React Native app")

        let rootView = RCTRootView(
            bundleURL: bundleURL,
            moduleName: "apptileSeed",
            initialProperties: nil,
            launchOptions: nil
        )

        let newRootVC = UIViewController()
        newRootVC.view = rootView

        // Smooth UI update to avoid flickering
        window.rootViewController = newRootVC
        window.makeKeyAndVisible()
    }

    private static func getAppWindow() -> UIWindow? {
        return UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow }
    }

    private static func getDownloadedBundlePath() -> URL? {
        return FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?
            .appendingPathComponent("bundles/main.jsbundle")
    }

    private static func getDefaultBundleURL() -> URL {
        #if DEBUG
            return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource: nil)
        #else
            return Bundle.main.url(forResource: "main", withExtension: "jsbundle")!
        #endif
    }

    // MARK: - Logger

    private static func logInfo(_ message: String) {
        NSLog("\(ApptileConstants.APPTILE_LOG_TAG): \(message)")
    }

    private static func logSuccess(_ message: String) {
        logInfo("✅ \(message)")
    }

    private static func logWarning(_ message: String) {
        logInfo("⚠️ \(message)")
    }

    private static func logError(_ message: String) {
        logInfo("❌ \(message)")
    }
}
