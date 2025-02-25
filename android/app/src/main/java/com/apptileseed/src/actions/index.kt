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
import com.apptileseed.src.utils.verifyFileIntegrity
import com.apptileseed.src.utils.copyDirectoryContents
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

    private suspend fun downloadAndVerify(
        url: String, tempPath: String, expectedHash: String
    ): Boolean {
        val downloadResponse = ApptileApiClient.service.downloadFile(url)

        if (downloadResponse.contentLength() == 0L) {
            Log.e(APPTILE_LOG_TAG, "Download failed: Empty response")
            return false
        }

        if (!saveFile(downloadResponse, tempPath)) {
            Log.e(APPTILE_LOG_TAG, "Failed to save downloaded file")
            return false
        }

        if (!verifyFileIntegrity(tempPath, expectedHash)) {
            Log.e(APPTILE_LOG_TAG, "Integrity check failed")
            deleteFile(tempPath)
            return false
        }

        return true
    }

    private suspend fun updateAppConfig(
        context: Context,
        appId: String,
        latestCommitId: Long
    ): Boolean {
        val fetchUrl = context.getString(R.string.APPTILE_UPDATE_ENDPOINT)
        val downloadUrl = "$fetchUrl/$appId/main/main/$latestCommitId.json"
        val tempAppConfigPath = File(context.filesDir, "tempConfig.json").absolutePath
        val documentAppConfig = File(context.filesDir, APP_CONFIG_FILE_NAME)

        return try {
            if (!downloadAndVerify(
                    downloadUrl,
                    tempAppConfigPath,
                    "this_is_dummy_hash"
                )
            ) return false
            deleteFile(documentAppConfig.absolutePath)
            moveFile(tempAppConfigPath, documentAppConfig.absolutePath)
            updateTrackerFile(context, latestCommitId, null)
            Log.d(APPTILE_LOG_TAG, "AppConfig updated successfully")
            true
        } catch (e: Exception) {
            Log.e(APPTILE_LOG_TAG, "Error updating AppConfig: ${e.message}", e)
            false
        }
    }

    private suspend fun updateBundle(
        context: Context,
        bundleId: Long,
        bundleUrl: String?
    ): Boolean {
        if (bundleUrl == null) return false

        val tempBundlePath =
            File(context.filesDir, "tempBundles/bundle.zip").apply { parentFile?.mkdirs() }
        val tempBundleExtractPath =
            File(context.filesDir, "tempBundles/unzipped").apply { mkdirs() }
        val destinationBundlesPath = File(context.filesDir, "bundles")

        return try {
            if (!downloadAndVerify(
                    bundleUrl,
                    tempBundlePath.absolutePath,
                    "this_is_dummy_hash"
                )
            ) return false

            if (!unzip(tempBundlePath.absolutePath, tempBundleExtractPath.absolutePath)) {
                Log.e(APPTILE_LOG_TAG, "Failed to unzip the bundle")
                return false
            }

            if (destinationBundlesPath.exists()) {
                Log.d(
                    APPTILE_LOG_TAG,
                    "Deleting existing bundle files from : ${destinationBundlesPath.absolutePath}"
                )
                destinationBundlesPath.deleteRecursively()
            }

            destinationBundlesPath.mkdirs()
            copyDirectoryContents(tempBundleExtractPath, destinationBundlesPath)
            updateTrackerFile(context, null, bundleId)
            Log.d(APPTILE_LOG_TAG, "Bundle updated successfully")
            true
        } catch (e: Exception) {
            Log.e(APPTILE_LOG_TAG, "Error updating bundle: ${e.message}", e)
            false
        } finally {
            Log.d(APPTILE_LOG_TAG, "Cleaning up temp bundles path & temp extraction path")
            deleteFile(tempBundlePath.absolutePath)
            tempBundleExtractPath.deleteRecursively()
        }
    }

    private suspend fun updateTrackerFile(
        context: Context, latestCommitId: Long?, latestBundleId: Long?
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
                APPTILE_LOG_TAG, "Writing tracker config to local bundle tracker $newTrackerConfig"
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
                "OTA Check: latestCommitId=$latestCommitId, localCommitId=$localCommitId, " + "localAndroidBundleId=$localBundleId, latestAndroidBundleId=$latestBundleId"
            )

            if (latestCommitId != null && latestBundleId != null) {

                val shouldUpdateCommit = latestCommitId != localCommitId
                val shouldUpdateBundle =
                    latestBundleId != localBundleId && !latestBundleUrl.isNullOrBlank()

                if (shouldUpdateBundle || shouldUpdateCommit) {
                    val updateStatus = mutableListOf<Boolean>()
                    if (shouldUpdateCommit) updateStatus.add(updateAppConfig(context, appId, latestCommitId))
                    if (shouldUpdateBundle) updateStatus.add(updateBundle(
                        context, latestBundleId, latestBundleUrl
                    ))

                    if (updateStatus.all { status -> status }) {
                        restartReactNative(context)
                    } else {
                        Log.e(APPTILE_LOG_TAG, "Update failed. App restart skipped.")
                    }
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
                    APPTILE_LOG_TAG, "React Native bundle restarted successfully"
                )
            } catch (e: Exception) {
                // need some fallback mechanism for now force closing need to discuss in office
                Log.e(APPTILE_LOG_TAG, "React Native restart failed", e)
                Log.d(APPTILE_LOG_TAG, "Fallback: Force-killing app")
                android.os.Process.killProcess(android.os.Process.myPid())
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
                                context, APP_CONFIG_FILE_NAME, APP_CONFIG_FILE_NAME
                            ), copyAssetToDocuments(
                                context, BUNDLE_TRACKER_FILE_NAME, BUNDLE_TRACKER_FILE_NAME
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
