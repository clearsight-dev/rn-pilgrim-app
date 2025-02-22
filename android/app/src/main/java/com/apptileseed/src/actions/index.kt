package com.apptileseed.src.actions

import android.content.Context
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

    private suspend fun updateAppConfig(context: Context, appId: String, latestCommitId: Int) {
        val fetchUrl = context.getString(R.string.APPTILE_UPDATE_ENDPOINT)
        val downloadUrl = "$fetchUrl/$appId/main/main/$latestCommitId.json"
        val tempAppConfigPath = File(context.filesDir, "tempConfig.json").absolutePath
        val documentAppConfig = File(context.filesDir, APP_CONFIG_FILE_NAME)

        try {
            val downloadResponse = ApptileApiClient.service.downloadFile(downloadUrl)
            // Need to validate the file before proceeding like integrety check
            if (saveFile(downloadResponse, tempAppConfigPath)) {
                deleteFile(documentAppConfig.absolutePath)
                moveFile(tempAppConfigPath, documentAppConfig.absolutePath)
            } else {
                Log.e(APPTILE_LOG_TAG, "Failed to save temp AppConfig file")
            }
        } catch (e: Exception) {
            Log.e(APPTILE_LOG_TAG, "Error updating AppConfig: ${e.message}", e)
        }
    }

    private suspend fun updateBundle(context: Context, bundleId: Int, bundleUrl: String?) {
        if (bundleUrl == null) return

        val bundlePath = File(context.filesDir, "bundles/bundle.zip").apply { parentFile?.mkdirs() }
        val destinationBundlePath = File(context.filesDir, "bundles").absolutePath

        try {
            val downloadResponse = ApptileApiClient.service.downloadFile(bundleUrl)
            if (saveFile(downloadResponse, bundlePath.absolutePath)) {
                unzip(bundlePath.absolutePath, destinationBundlePath)
                Log.d(APPTILE_LOG_TAG, "Bundle updated successfully")
            } else {
                Log.e(APPTILE_LOG_TAG, "Failed to save downloaded bundle file")
            }
        } catch (e: Exception) {
            Log.e(APPTILE_LOG_TAG, "Error updating bundle: ${e.message}", e)
        }
    }

    private suspend fun checkForOTA(appId: String, context: Context) = withContext(Dispatchers.IO) {
        val manifest = fetchManifest(appId) ?: return@withContext
        val trackerData = readFileContent(File(context.filesDir, BUNDLE_TRACKER_FILE_NAME).absolutePath)

        trackerData?.let {
            val mapType = object : TypeToken<Map<String, Any>>() {}.type
            val parsedTrackerData: Map<String, Any>? = Gson().fromJson(it, mapType)

            val localCommitId = parsedTrackerData?.get("publishedCommitId") as? Int
            val latestCommitId = manifest.forks.getOrNull(0)?.publishedCommitId

            val bundle = manifest.codeArtefacts.find { it.type == "android-jsbundle" }
            val localBundleId = parsedTrackerData?.get("androidBundleId") as? Int
            val latestBundleId = bundle?.id
            val latestBundleUrl = bundle?.cdnlink

            Log.d(APPTILE_LOG_TAG, "OTA Check: latestCommitId=$latestCommitId, localCommitId=$localCommitId, " +
                    "localAndroidBundleId=$localBundleId, latestAndroidBundleId=$latestBundleId")

            if (latestCommitId != null && latestBundleId != null) {
                val shouldUpdateCommit = latestCommitId != localCommitId
                val shouldUpdateBundle = latestBundleId != localBundleId

                if (shouldUpdateCommit) updateAppConfig(context, appId, latestCommitId)
                if (shouldUpdateBundle) updateBundle(context, latestBundleId, latestBundleUrl) // will this bundle url present always


                if (shouldUpdateCommit || shouldUpdateBundle) {
                    val newTrackerConfig = Gson().toJson(
                        mapOf("publishedCommitId" to latestCommitId, "androidBundleId" to latestBundleId)
                    )
                    File(context.filesDir, BUNDLE_TRACKER_FILE_NAME).writeText(newTrackerConfig)
                }
            }
        }
    }

    suspend fun startApptileAppProcess(appId: String, context: Context) = withContext(Dispatchers.IO) {
        try {
            val trackerFile = File(context.filesDir, BUNDLE_TRACKER_FILE_NAME)
            if (!trackerFile.exists()) {
                copyAssetToDocuments(context, APP_CONFIG_FILE_NAME, APP_CONFIG_FILE_NAME)
                copyAssetToDocuments(context, BUNDLE_TRACKER_FILE_NAME, BUNDLE_TRACKER_FILE_NAME)
            }
            checkForOTA(appId, context)
        } catch (e: Exception) {
            Log.e(APPTILE_LOG_TAG, "Error starting app process: ${e.message}", e)
        }
    }
}
