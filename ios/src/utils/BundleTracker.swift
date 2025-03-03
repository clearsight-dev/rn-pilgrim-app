//
//  bundleTracker.swift
//  apptileSeed
//
//  Created by Vadivazhagan on 02/03/25.
//

import Foundation

final class BundleTrackerPrefs {
    private static let prefs = UserDefaults.standard
    private static let keyBundleLoadStatus = "is_bundle_broken"
    
    static func isBrokenBundle() -> Bool {
        return prefs.bool(forKey: keyBundleLoadStatus)
    }
    
    @discardableResult
    static func resetBundleState() -> Bool {
        NSLog("\(APPTILE_LOG_TAG) :Resetting bundle state")
        prefs.set(false, forKey: keyBundleLoadStatus)
        return prefs.synchronize()
    }
    
    @discardableResult
    static func markCurrentBundleBroken() -> Bool {
        NSLog("\(APPTILE_LOG_TAG) :Marking bundle as broken")
        prefs.set(true, forKey: keyBundleLoadStatus)
        return prefs.synchronize()
    }
}
