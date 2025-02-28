package com.apptileseed.src.utils

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.apptileseed.src.actions.Actions.BUNDLE_TRACKER_FILE_NAME
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.io.File

fun getLocalBundleId(context: Context): Long? {
    val localTrackerFile = File(context.filesDir, BUNDLE_TRACKER_FILE_NAME)

    if (!localTrackerFile.exists()) return null

    val trackerData = localTrackerFile.readText()
    val mapType = object : TypeToken<Map<String, Any>>() {}.type
    val parsedTrackerData: Map<String, Any>? = Gson().fromJson(trackerData, mapType)

    return (parsedTrackerData?.get("androidBundleId") as? Number)?.toLong()
}

enum class BundleType {
    EMBEDDED, LOCAL
}

object BundleTrackerPrefs {
    private const val PREFS_NAME = "apptile"
    private const val KEY_BUNDLE_LOAD_STATUS = "is_bundle_broken"
    private const val KEY_BLACKLISTED_BUNDLES_IDS = "black_listed_bundles_ids"
    private const val KEY_CURRENT_BUNDLE_TYPE = "current_bundle_type"

    private lateinit var preferences: SharedPreferences

    fun init(context: Context) {
        preferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun isBrokenBundle(): Boolean {
        return preferences.getBoolean(KEY_BUNDLE_LOAD_STATUS, false)
    }

    fun resetBundleState(): Boolean {
        Log.d(APPTILE_LOG_TAG, "Resetting bundle state")
        return preferences.edit().putBoolean(KEY_BUNDLE_LOAD_STATUS, false).commit()
    }

    private fun getCurrentBundleType(): String {
        return preferences.getString(KEY_CURRENT_BUNDLE_TYPE, BundleType.LOCAL.name)!!
    }

    fun setCurrentBundleType(type: BundleType): Boolean {
        return preferences.edit().putString(KEY_CURRENT_BUNDLE_TYPE, type.name).commit()
    }

    fun markCurrentBundleBroken(context: Context): Boolean {
        Log.e(APPTILE_LOG_TAG, "Marking bundle as broken")


        if (getCurrentBundleType() == BundleType.EMBEDDED.name) {
            Log.e(APPTILE_LOG_TAG, "Embedded bundle is broken, Marking failed")
            return false
        }

        val bundleId = getLocalBundleId(context)
        if (bundleId == null) {
            Log.e(APPTILE_LOG_TAG, "Local bundle id not found, Marking failed")
            return false
        }

        if (!blackListBundleId(bundleId)) {
            Log.e(APPTILE_LOG_TAG, "Black listing local bundle id failed, Marking failed")
            return false
        }

        return preferences.edit().putBoolean(KEY_BUNDLE_LOAD_STATUS, true).commit()
    }


    private fun getBlackListedBundleIds(): List<Long> {
        val json = preferences.getString(KEY_BLACKLISTED_BUNDLES_IDS, null) ?: return emptyList()
        val type = object : TypeToken<List<Long>>() {}.type
        val parsedValue: List<Long> = Gson().fromJson(json, type) ?: emptyList()

        Log.d(APPTILE_LOG_TAG, "Current blacklisted bundles: $parsedValue")
        return parsedValue
    }

    fun isBundleBlackListed(bundleId: Long): Boolean {
        Log.d(APPTILE_LOG_TAG, "Checking bundleId:$bundleId is Black Listed")
        return getBlackListedBundleIds().contains(bundleId)
    }

    private fun blackListBundleId(bundleId: Long): Boolean {
        Log.d(APPTILE_LOG_TAG, "Marking bundleId:$bundleId as Black Listed")

        val blackListedBundleIds = getBlackListedBundleIds().toMutableList()
        if (!blackListedBundleIds.contains(bundleId)) {
            blackListedBundleIds.add(bundleId)
        }

        val json = Gson().toJson(blackListedBundleIds)
        return preferences.edit().putString(KEY_BLACKLISTED_BUNDLES_IDS, json).commit()
    }
}
