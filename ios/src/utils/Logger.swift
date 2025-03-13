//
//  logTags.swift
//  apptileSeed
//
//  Created by Vadivazhagan on 02/03/25.
//
import Foundation

@objc public class ApptileConstants: NSObject {
    @objc public static let APPTILE_LOG_TAG: String = "ApptileStartupProcess"
}

enum LogLevel: String {
    case debug = "🐛 DEBUG"
    case info = "ℹ️ INFO"
    case warn = "⚠️ WARN"
    case error = "❌ ERROR"
}

class Logger {
    static func debug(_ message: String) {
        log(message, level: .debug)
    }

    static func info(_ message: String) {
        log(message, level: .info)
    }

    static func warn(_ message: String) {
        log(message, level: .warn)
    }

    static func error(_ message: String) {
        log(message, level: .error)
    }

    private static func log(_ message: String, level: LogLevel) {
        let formattedMessage = "[\(ApptileConstants.APPTILE_LOG_TAG)] \(level.rawValue): \(message)"
        NSLog(formattedMessage)
    }
}
