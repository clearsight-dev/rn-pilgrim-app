package com.apptileseed.src.actions

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.apptileseed.R
import com.apptileseed.src.apis.ApptileApiClient
import com.apptileseed.src.utils.APPTILE_LOG_TAG
import com.apptileseed.src.utils.copyAssetToDocuments
import com.apptileseed.src.utils.deleteFile
import com.apptileseed.src.utils.moveFile
import com.apptileseed.src.utils.readFileContent
import com.apptileseed.src.utils.saveFile
import com.apptileseed.src.utils.unzip
import com.facebook.react.ReactApplication
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File


object Actions {
    private const val APP_CONFIG_FILE_NAME = "appConfig.json"
    private const val BUNDLE_TRACKER_FILE_NAME = "localBundleTracker.json"

    private suspend fun fetchManifest(appId: String) = withContext(Dispatchers.IO) {
        try {
            ApptileApiClient.service.getManifest(appId)
        } catch (e: Exception) {
            Log.e(APPTILE_LOG_TAG, "Failed to fetch manifest: ${e.message}", e)
            null
        }
    }

    private suspend fun updateAppConfig(context: Context, appId: String, latestCommitId: Long) {
        val fetchUrl = context.getString(R.string.APPTILE_UPDATE_ENDPOINT)
        val downloadUrl = "$fetchUrl/$appId/main/main/$latestCommitId.json"
        val tempAppConfigPath = File(context.filesDir, "tempConfig.json").absolutePath
        val documentAppConfig = File(context.filesDir, APP_CONFIG_FILE_NAME)

        try {
            val downloadResponse = ApptileApiClient.service.downloadFile(downloadUrl)
            if (saveFile(downloadResponse, tempAppConfigPath)) {
                // Need to validate the file before proceeding like integrety check
                deleteFile(documentAppConfig.absolutePath)
                moveFile(tempAppConfigPath, documentAppConfig.absolutePath)

                updateTrackerFile(context, latestCommitId, null)
                Log.d(APPTILE_LOG_TAG, "AppConfig updated successfully")
            } else {
                Log.e(APPTILE_LOG_TAG, "Failed to save temp AppConfig file")
            }
        } catch (e: Exception) {
            Log.e(APPTILE_LOG_TAG, "Error updating AppConfig: ${e.message}", e)
        }
    }

    private suspend fun updateBundle(context: Context, bundleId: Long, bundleUrl: String?) {
        if (bundleUrl == null) return

        val bundlePath = File(context.filesDir, "bundles/bundle.zip").apply { parentFile?.mkdirs() }
        val destinationBundlePath = File(context.filesDir, "bundles").absolutePath

        try {
            val downloadResponse = ApptileApiClient.service.downloadFile(bundleUrl)
            // Need to validate the file before proceeding like integrity check
            if (saveFile(downloadResponse, bundlePath.absolutePath)) {
                val isUnzipSucceed = unzip(bundlePath.absolutePath, destinationBundlePath)
                if (isUnzipSucceed) {
                    updateTrackerFile(context, null, bundleId)
                    Log.d(APPTILE_LOG_TAG, "Bundle updated successfully")
                } else {
                    Log.e(APPTILE_LOG_TAG, "Failed to unzip the bundle")
                }
            } else {
                Log.e(APPTILE_LOG_TAG, "Failed to save downloaded bundle file")
            }
        } catch (e: Exception) {
            Log.e(APPTILE_LOG_TAG, "Error updating bundle: ${e.message}", e)
        }
    }

    private suspend fun updateTrackerFile(
        context: Context,
        latestCommitId: Long?,
        latestBundleId: Long?
    ) {
        val trackerFile = File(context.filesDir, BUNDLE_TRACKER_FILE_NAME)
        val trackerData = readFileContent(trackerFile.absolutePath)

        trackerData?.let {
            val mapType = object : TypeToken<Map<String, Any>>() {}.type
            val existingTrackerData: MutableMap<String, Any> = Gson().fromJson(it, mapType)

            latestCommitId?.let { commitId -> existingTrackerData["publishedCommitId"] = commitId }
            latestBundleId?.let { bundleId -> existingTrackerData["androidBundleId"] = bundleId }

            val newTrackerConfig = Gson().toJson(existingTrackerData)
            Log.d(
                APPTILE_LOG_TAG,
                "Writing tracker config to local bundle tracker $newTrackerConfig"
            )
            trackerFile.writeText(newTrackerConfig)
        }
    }


    private suspend fun checkForOTA(appId: String, context: Context) = withContext(Dispatchers.IO) {
        val manifest = fetchManifest(appId) ?: return@withContext
        val trackerData =
            readFileContent(File(context.filesDir, BUNDLE_TRACKER_FILE_NAME).absolutePath)

        trackerData?.let {
            val mapType = object : TypeToken<Map<String, Any>>() {}.type
            val parsedTrackerData: Map<String, Any>? = Gson().fromJson(it, mapType)

            val localCommitId = (parsedTrackerData?.get("publishedCommitId") as? Number)?.toLong()
            val latestCommitId = manifest.forks.getOrNull(0)?.publishedCommitId

            val bundle = manifest.codeArtefacts.find { it.type == "android-jsbundle" }
            val localBundleId = (parsedTrackerData?.get("androidBundleId") as? Number)?.toLong()
            val latestBundleId = bundle?.id
            val latestBundleUrl = bundle?.cdnlink

            Log.d(
                APPTILE_LOG_TAG,
                "OTA Check: latestCommitId=$latestCommitId, localCommitId=$localCommitId, " +
                        "localAndroidBundleId=$localBundleId, latestAndroidBundleId=$latestBundleId"
            )

            if (latestCommitId != null && latestBundleId != null) {
                val shouldUpdateCommit = latestCommitId != localCommitId
                val shouldUpdateBundle =
                    latestBundleId != localBundleId && !latestBundleUrl.isNullOrBlank()

                // what if particular app config contains some changes which only runs in particular if app config save suceed & app bundle save failed. app will be in broken state
                // how to handle this
                if (shouldUpdateCommit) updateAppConfig(context, appId, latestCommitId)
                if (shouldUpdateBundle) updateBundle(
                    context,
                    latestBundleId,
                    latestBundleUrl
                )

                if (shouldUpdateBundle || shouldUpdateCommit) {
                    restartReactNative(context)
                }

            }
        }
    }

    private suspend fun restartReactNative(context: Context) = withContext(Dispatchers.Main) {
        val application = context.applicationContext as? ReactApplication
        if (application == null) {
            Log.e(APPTILE_LOG_TAG, "Failed to restart React Native: Not a ReactApplication")
            return@withContext
        }

        val reactNativeHost = application.reactNativeHost
        val reactInstanceManager = reactNativeHost.reactInstanceManager

        // need to measure time taken for complete restart
        Handler(Looper.getMainLooper()).post {
            try {
                Log.d(APPTILE_LOG_TAG, "Restarting React Native bundle...")
                reactInstanceManager.recreateReactContextInBackground()
                Log.d(
                    APPTILE_LOG_TAG,
                    "React Native bundle restarted successfully"
                )
            } catch (e: Exception) {
                Log.e(
                    APPTILE_LOG_TAG,
                    "React Native restart failed",
                    e
                )
                // need some fallback mechanism
            }
        }
    }

    suspend fun startApptileAppProcess(appId: String, context: Context) =
        withContext(Dispatchers.IO) {
            try {
                val trackerFile = File(context.filesDir, BUNDLE_TRACKER_FILE_NAME)
                if (!trackerFile.exists()) {
                    if (!listOf(
                            copyAssetToDocuments(
                                context,
                                APP_CONFIG_FILE_NAME,
                                APP_CONFIG_FILE_NAME
                            ),
                            copyAssetToDocuments(
                                context,
                                BUNDLE_TRACKER_FILE_NAME,
                                BUNDLE_TRACKER_FILE_NAME
                            )
                        ).all { it }
                    ) {
                        Log.e(APPTILE_LOG_TAG, "Failed to copy initial assets.")
                        return@withContext
                    }
                }

                // only process if operation above completed without error
                checkForOTA(appId, context)
            } catch (e: Exception) {
                Log.e(APPTILE_LOG_TAG, "Error starting app process: ${e.message}", e)
            }
        }
}
