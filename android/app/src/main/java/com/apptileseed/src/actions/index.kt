package com.apptileseed.src.actions

import android.content.Context
import android.util.Log
import com.apptileseed.src.apis.ApptileApiClient
import com.apptileseed.src.apis.ApptileAppConfigApiClient
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

    private suspend fun checkForOTA(appId: String, context: Context) = withContext(Dispatchers.IO) {
        try {
            val manifest = ApptileApiClient.service.getManifest(appId)
            val trackerData =
                readFileContent(File(context.filesDir, BUNDLE_TRACKER_FILE_NAME).absolutePath)

            trackerData?.let { data ->
                Log.d("[Apptile] tracker Data", data)

                val mapType = object : TypeToken<Map<String, Any>>() {}.type
                val parsedTrackerData: Map<String, Any>? = Gson().fromJson(data, mapType)

                val localCommitId = parsedTrackerData?.get("publishedCommitId") as? Int
                val localAndroidBundleId = parsedTrackerData?.get("androidBundleId") as? Int

                val latestCommitId = manifest.forks.getOrNull(0)?.publishedCommitId
                val androidBundle = manifest.codeArtefacts.find { it.type == "android-jsbundle" }
                val latestAndroidBundleId = androidBundle?.id

                Log.d(
                    "[Apptile] constructor", mapOf(
                        "latestCommitId" to latestCommitId,
                        "localCommitId" to localCommitId,
                        "localAndroidBundleId" to localAndroidBundleId,
                        "latestAndroidBundleId" to latestAndroidBundleId
                    ).toString()
                )


                if ((localCommitId != latestCommitId) || (latestAndroidBundleId != null && localAndroidBundleId != latestAndroidBundleId)) {
                    if (localCommitId != latestCommitId) {
                        // AppConfig download
                        val downloadUrl = "${appId}/main/main/${latestCommitId}.json";
                        val downloadResponse = ApptileAppConfigApiClient.service.downloadFile(downloadUrl)

                        val tempAppConfigPath =
                            File(context.filesDir, "tempConfig.json").absolutePath
                        val isTempAppConfigSaved = saveFile(downloadResponse, tempAppConfigPath)
                        val documentAppConfig = File(context.filesDir, "appConfig.json")

                        if (isTempAppConfigSaved) {
                            val isDocAppConfigDeleted = deleteFile(documentAppConfig.absolutePath)
                            if (!isDocAppConfigDeleted) {
                                Log.e("[Apptile] Error", "Failed to delete existing AppConfig file")
                                return@let
                            }
                        }
                        moveFile(tempAppConfigPath, documentAppConfig.absolutePath)
                    }

                    if (latestAndroidBundleId != null && localAndroidBundleId != latestAndroidBundleId) {
                        // Bundle download
                        val downloadResponse =
                            ApptileApiClient.service.downloadFile(androidBundle.cdnlink)
                        val bundlePath = File(context.filesDir, "bundles/bundle.zip")

                        bundlePath.parentFile?.mkdirs()

                        if (bundlePath.exists()) {
                            val isDeleted = deleteFile(bundlePath.absolutePath)
                            if (!isDeleted) {
                                Log.e(
                                    "[Apptile] Error",
                                    "Failed to delete existing bundle.zip file"
                                )
                                return@let
                            }
                        }

                        saveFile(downloadResponse, bundlePath.absolutePath)
                        val destinationBundlePath = File(context.filesDir, "bundles").absolutePath
                        unzip(bundlePath.absolutePath, destinationBundlePath)

                        val bundlePathTest = File(context.filesDir, "bundles")
                        if(bundlePathTest.exists() && bundlePathTest.isDirectory){
                            Log.d("[Apptile bundles folder]", bundlePathTest.listFiles()?.toList().toString())
                        }
                    }

                    val newTrackerConfig = Gson().toJson(
                        mapOf(
                            "publishedCommitId" to latestCommitId,
                            "androidBundleId" to latestAndroidBundleId
                        )
                    )

                    println("[Apptile] Writing new config")
                    File(context.filesDir, BUNDLE_TRACKER_FILE_NAME).writeText(newTrackerConfig)

                }
            }
        } catch (e: Exception) {
            Log.e("[Apptile] Check For OTA Failed", e.message.toString())
        }
    }

    suspend fun startApptileAppProcess(appId: String, context: Context) =
        withContext(Dispatchers.IO) {
            try {
                val isDocumentBundleTrackerExist =
                    File(context.filesDir, BUNDLE_TRACKER_FILE_NAME).exists()

                if (!isDocumentBundleTrackerExist) {
                    copyAssetToDocuments(context, APP_CONFIG_FILE_NAME, APP_CONFIG_FILE_NAME)
                    copyAssetToDocuments(
                        context, BUNDLE_TRACKER_FILE_NAME, BUNDLE_TRACKER_FILE_NAME
                    )
                }

                checkForOTA(appId, context)

            } catch (e: Exception) {
                Log.e("[Apptile] Starting App Process Failed", e.message.toString())
            }
        }
}




