//
//  index.swift
//  apptileSeed
//
//  Created by Vadivazhagan on 02/03/25.
//

import Foundation
import React

@objc(Actions)
class Actions: NSObject {
  static let APP_CONFIG_FILE_NAME = "appConfig.json"
  static let BUNDLE_TRACKER_FILE_NAME = "localBundleTracker.json"

  static func getAppId() -> String? {
    return Bundle.main.object(forInfoDictionaryKey: "APP_ID") as? String
  }

  static func downloadAndVerify(
    url: String, tempPath: String, expectedHash: String
  ) async -> Bool {
    do {
      let downloadedPath = try await ApptileApiClient.shared.downloadFile(
        from: url
      ).path
      
      
      NSLog("\(APPTILE_LOG_TAG) : Temp downloaded file from \(url): \(downloadedPath)")
//      guard
//        let downloadedData = FileUtils.readFileContent(filePath: downloadedPath)
//      else { return false }

      defer {
        FileUtils.deleteFile(filePath: downloadedPath)
        NSLog("\(APPTILE_LOG_TAG) : Temp file deleted: \(downloadedPath)")
      }
// Required but commenting for now
//      let data = downloadedData.data(using: .utf8)!
//
//      if data.isEmpty {
//        NSLog("\(APPTILE_LOG_TAG) : Download failed: Empty response")
//        return false
//      }

      let success = FileUtils.moveFile(sourcePath: downloadedPath, destinationPath: tempPath)
      if !success {
        NSLog("\(APPTILE_LOG_TAG) : Failed to move downloaded file to temp path")
        return false
      }

      if !FileUtils.verifyFileIntegrity(
        filePath: tempPath, expectedHash: expectedHash)
      {
        NSLog("\(APPTILE_LOG_TAG) : Integrity check failed")
        FileUtils.deleteFile(filePath: tempPath)
        return false
      }
      return true
    } catch {
      NSLog(
        "\(APPTILE_LOG_TAG) : Download error: \(error.localizedDescription)"
      )
      return false
    }

  }

  static func updateAppConfig(appId: String, latestCommitId: Int64) async
  -> Bool
  {
    let fetchUrl = "https://appconfigs.apptile.io"
    let downloadUrl = "\(fetchUrl)/\(appId)/main/main/\(latestCommitId).json"
    let tempAppConfigPath = FileUtils.documentsDirectory.appendingPathComponent(
      "tempConfig.json"
    ).path
    let documentAppConfigPath = FileUtils.documentsDirectory
      .appendingPathComponent(Actions.APP_CONFIG_FILE_NAME).path

    defer {
      NSLog("\(APPTILE_LOG_TAG) : Cleaning up temp app config path")
      FileUtils.deleteFile(filePath: tempAppConfigPath)
    }

    do {
      let success = await Actions.downloadAndVerify(
        url: downloadUrl, tempPath: tempAppConfigPath,
        expectedHash: "this_is_dummy_hash")
      if !success { return false }

      FileUtils.deleteFile(filePath: documentAppConfigPath)
      FileUtils.moveFile(
        sourcePath: tempAppConfigPath, destinationPath: documentAppConfigPath)
      await Actions
        .updateTrackerFile(latestCommitId: latestCommitId, latestBundleId: nil)
      NSLog("\(APPTILE_LOG_TAG) : AppConfig updated successfully")
      return true
    } catch {
      NSLog(
        "\(APPTILE_LOG_TAG) : Error updating AppConfig: \(error.localizedDescription)"
      )
      return false
    }
  }

  private static func updateBundle(
      bundleId: Int64, bundleUrl: String?
  ) async -> Bool {
      guard let bundleUrl = bundleUrl, let url = URL(string: bundleUrl) else { return false }
      
      let fileManager = FileUtils.fileManager
      let tempBundlePath = FileUtils.documentsDirectory.appendingPathComponent("tempBundles/bundle.zip")
      let tempBundleExtractPath = FileUtils.documentsDirectory.appendingPathComponent("tempBundles/unzipped")
      let destinationBundlesPath = FileUtils.documentsDirectory.appendingPathComponent("bundles")
      
    defer {
      NSLog("\(APPTILE_LOG_TAG) : Cleaning up temp bundles path & temp extraction path")
      try? fileManager.removeItem(at: tempBundlePath)
      try? fileManager.removeItem(at: tempBundleExtractPath)
    }
    
      do {
          try fileManager.createDirectory(at: tempBundlePath.deletingLastPathComponent(), withIntermediateDirectories: true)
          try fileManager.createDirectory(at: tempBundleExtractPath, withIntermediateDirectories: true)
        
          let isSucceed = await Actions.downloadAndVerify(url: bundleUrl, tempPath: tempBundlePath.path, expectedHash: "this_is_dummy_hash")
          guard isSucceed else { return false }
          
          let isUnzipped = FileUtils.unzip(zipFilePath: tempBundlePath.path, destinationPath: tempBundleExtractPath.path)
          guard isUnzipped else {
              NSLog("\(APPTILE_LOG_TAG) : Failed to unzip the bundle")
              return false
          }
          
          if fileManager.fileExists(atPath: destinationBundlesPath.path) {
              NSLog("\(APPTILE_LOG_TAG) : Deleting existing bundle files from: \(destinationBundlesPath.path)")
              try fileManager.removeItem(at: destinationBundlesPath)
          }
          
          try fileManager.createDirectory(at: destinationBundlesPath, withIntermediateDirectories: true)
          FileUtils.copyDirectoryContents(sourcePath: tempBundleExtractPath.path, destinationPath: destinationBundlesPath.path)
          await updateTrackerFile(latestCommitId: nil, latestBundleId: bundleId)
          NSLog("\(APPTILE_LOG_TAG) : Bundle updated successfully")
          return true
      } catch {
          NSLog("\(APPTILE_LOG_TAG) : Error updating bundle: \(error.localizedDescription)")
          return false
      }
  }

  
  static func updateTrackerFile(latestCommitId: Int64?, latestBundleId: Int64?) async {
    let trackerFilePath = FileUtils.documentsDirectory.appendingPathComponent(
      Actions.BUNDLE_TRACKER_FILE_NAME
    ).path

    guard let trackerContent = FileUtils.readFileContent(
      filePath: trackerFilePath
    ),
          let data = trackerContent.data(using: .utf8),
          let existingData = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
          !existingData.isEmpty else {
      NSLog(
        "\(APPTILE_LOG_TAG) : Tracker file is empty or unreadable. Skipping update."
      )
      return
    }

    var trackerData = existingData

    if let commitId = latestCommitId {
      trackerData["publishedCommitId"] = commitId
    }

    if let bundleId = latestBundleId {
      trackerData["iosBundleId"] = bundleId
    }

    if let jsonData = try? JSONSerialization.data(
      withJSONObject: trackerData,
      options: .prettyPrinted
    ) {
      FileUtils.saveFile(data: jsonData, filePath: trackerFilePath)
      NSLog("\(APPTILE_LOG_TAG) : Updated tracker file: \(trackerData)")
    } else {
      NSLog("\(APPTILE_LOG_TAG) : Failed to serialize updated tracker data.")
    }
  }

  static func fetchManifest(appId: String) async -> ManifestResponse? {
    do {
      return try await ApptileApiClient.shared.getManifest(appId: appId)
    } catch {
      NSLog(
        "\(APPTILE_LOG_TAG) Failed to fetch manifest: \(error.localizedDescription)"
      )
      return nil
    }
  }

  @objc static func startApptileAppProcess(
    _ completion: @escaping @convention(block) (Bool) -> Void
  ) {
    Task(priority: .background) {  // Runs in background thread

      APIClient.shared.initialize(baseURL: "https://api.apptile.io")

      guard let appId = getAppId(),
            !appId.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
      else {
        NSLog("\(APPTILE_LOG_TAG) : APP_ID is missing or empty in Info.plist")
        completion(false)
        return
      }

      NSLog("\(APPTILE_LOG_TAG) : Using App ID: \(appId)")

      let trackerFile = FileUtils.documentsDirectory.appendingPathComponent(
        BUNDLE_TRACKER_FILE_NAME
      ).path
      if !FileManager.default.fileExists(atPath: trackerFile) {
        NSLog(
          "\(APPTILE_LOG_TAG) : No local bundle tracker file found. Copying initial files from assets"
        )
        var operationStatus: [Bool] = []

        operationStatus.append(
          FileUtils.copyAssetToDocuments(
            assetFileName: APP_CONFIG_FILE_NAME,
            destinationFileName: APP_CONFIG_FILE_NAME))
        operationStatus.append(
          FileUtils.copyAssetToDocuments(
            assetFileName: BUNDLE_TRACKER_FILE_NAME,
            destinationFileName: BUNDLE_TRACKER_FILE_NAME))

        if !operationStatus.allSatisfy({ $0 }) {
          NSLog("\(APPTILE_LOG_TAG) : Failed to copy initial assets.")
          DispatchQueue.main.async {
            completion(false)  // Switch back to main thread for callback
          }
          return
        }
      }

      await checkForOTA(appId: appId)

      DispatchQueue.main.async {
        completion(true)  // Switch back to main thread for callback
      }
    }
  }
  
  
  static func applyUpdates() {
    NSLog("\(APPTILE_LOG_TAG) : Applying Updates...")
    loadDownloadedBundleAndRestart()
  }
  
  @objc static func rollBackUpdates() -> Bool {
      do {
          let filesDir = FileUtils.documentsDirectory

          let filesToDelete = [
              filesDir.appendingPathComponent(BUNDLE_TRACKER_FILE_NAME),
              filesDir.appendingPathComponent(APP_CONFIG_FILE_NAME),
              filesDir.appendingPathComponent("bundles")
          ]

          let deletionResults = filesToDelete.map { file in
              do {
                  if FileManager.default.fileExists(atPath: file.path) {
                      try FileManager.default.removeItem(at: file)
                      return true
                  }
              } catch {
                  NSLog("\(APPTILE_LOG_TAG) ❌ Failed to delete: \(file.path), error: \(error.localizedDescription)")
              }
              return false
          }

          if deletionResults.allSatisfy({ $0 }) {
              NSLog("\(APPTILE_LOG_TAG) ✅ Rollback Successfully Completed")
              BundleTrackerPrefs.resetBundleState()
              return true
          } else {
              NSLog("\(APPTILE_LOG_TAG) ❌ Rollback Failed")
              return false
          }
      } catch {
          NSLog("\(APPTILE_LOG_TAG) ❌ Error while rolling back: \(error.localizedDescription)")
          return false
      }
  }

  static func checkForOTA(appId: String) async {
    guard let manifest = await fetchManifest(appId: appId) else { return }
    NSLog("\(APPTILE_LOG_TAG) Fetched manifest successfully: \(manifest)")
    let trackerFilePath = FileUtils.documentsDirectory.appendingPathComponent(
      BUNDLE_TRACKER_FILE_NAME
    ).path
    guard let trackerData = FileUtils.readFileContent(filePath: trackerFilePath)
    else { return }
    NSLog("\(APPTILE_LOG_TAG) tracker data content: \(trackerData)")
    if let jsonData = trackerData.data(using: .utf8) {
      do {
        if let parsedTrackerData = try JSONSerialization.jsonObject(
          with: jsonData, options: []) as? [String: Any]
        {

          let localCommitId =
          (parsedTrackerData["publishedCommitId"] as? NSNumber)?.int64Value
          let latestCommitId = manifest.forks.first?.publishedCommitId

          let bundle = manifest.codeArtefacts.first {
            $0.type == "ios-jsbundle"
          }
          let localBundleId = (parsedTrackerData["iosBundleId"] as? NSNumber)?
            .int64Value
          let latestBundleId = bundle?.id
          let latestBundleUrl = bundle?.cdnlink

          NSLog(
            "\(APPTILE_LOG_TAG) OTA Check: latestCommitId=\(String(describing: latestCommitId)), localCommitId=\(String(describing: localCommitId)), localBundleId=\(String(describing: localBundleId)), latestBundleId=\(String(describing: latestBundleId))"
          )
          
          // Below expression is correct. it is called optional binding
          if let latestCommitId = latestCommitId,
             let latestBundleId = latestBundleId
          {
            NSLog("\(APPTILE_LOG_TAG) Starting Updates...")
            let shouldUpdateCommit = latestCommitId != localCommitId
            let shouldUpdateBundle =
            latestBundleId != localBundleId
            && !(latestBundleUrl?.isEmpty ?? true)

            var updateStatus: [Bool] = []

            if shouldUpdateCommit {
              NSLog("\(APPTILE_LOG_TAG) Starting App Config update...")
              let isSucceed = await Actions.updateAppConfig(
                appId: appId, latestCommitId: latestCommitId)
              updateStatus.append(isSucceed)
            }
            
            if shouldUpdateBundle {
              NSLog("\(APPTILE_LOG_TAG) Starting App Bundle update...")
              let isSucceed = await Actions.updateBundle(bundleId: latestBundleId, bundleUrl: latestBundleUrl)
              updateStatus.append(isSucceed)
            }

            if shouldUpdateBundle || shouldUpdateCommit {
              DispatchQueue.main.async {
                applyUpdates()
              }
            }
            
          }
        }
      } catch {
        NSLog("\(APPTILE_LOG_TAG) Error parsing tracker data: \(error)")
      }
    }
  }
}


// have to evaluvate the following things
// I need to that react native launch itself to make it smooth
func loadDownloadedBundleAndRestart() {
    guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
          let window = windowScene.windows.first(where: { $0.isKeyWindow }) else {
        NSLog("\(APPTILE_LOG_TAG) :❌ Failed to find the app window")
        return
    }
    
    guard let bundlePath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?
            .appendingPathComponent("bundles/main.jsbundle"),
          FileManager.default.fileExists(atPath: bundlePath.path) else {
        NSLog("\(APPTILE_LOG_TAG) :⚠️ Downloaded bundle not found, falling back to default")
        loadDefaultBundleAndRestart()
        return
    }
    
    NSLog("\(APPTILE_LOG_TAG) :✅ Loading downloaded bundle from: \(bundlePath.path)")
    
    // Set up a new RCTRootView with the downloaded bundle
    let rootView = RCTRootView(
        bundleURL: bundlePath,
        moduleName: "apptileSeed",
        initialProperties: nil,
        launchOptions: nil
    )

    restartReactNativeApp(with: rootView, window: window)
}

func loadDefaultBundleAndRestart() {
    guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
          let window = windowScene.windows.first(where: { $0.isKeyWindow }) else {
        NSLog("\(APPTILE_LOG_TAG) :❌ Failed to find the app window")
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

    restartReactNativeApp(with: rootView, window: window)
}

func restartReactNativeApp(with rootView: RCTRootView, window: UIWindow) {
    NSLog("\(APPTILE_LOG_TAG) :🔄 Restarting React Native app")

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
