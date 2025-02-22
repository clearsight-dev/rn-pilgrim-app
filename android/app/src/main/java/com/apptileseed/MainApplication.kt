package com.apptileseed

import android.app.Application
import android.util.Log
import com.apptileseed.src.actions.Actions
import com.apptileseed.src.apis.ApptileApiClient
import com.apptileseed.src.utils.APPTILE_LOG_TAG
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.JavaScriptExecutorFactory
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.flipper.ReactNativeFlipper
import com.facebook.react.modules.i18nmanager.I18nUtil
import com.facebook.react.modules.systeminfo.AndroidInfoHelpers
import com.facebook.soloader.SoLoader
import io.csie.kudo.reactnative.v8.executor.V8ExecutorFactory
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.io.File

class MainApplication : Application(), ReactApplication {
    private val appScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val initializationDeferred = CompletableDeferred<Unit>()

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    // Packages that cannot be autolinked yet can be added manually here, for example:
                    add(RNGetValuesPackage())
                    add(RNApptilePackage())
                }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED

            override fun getJavaScriptExecutorFactory(): JavaScriptExecutorFactory =
                V8ExecutorFactory(
                    applicationContext,
                    packageName,
                    AndroidInfoHelpers.getFriendlyDeviceName(),
                    useDeveloperSupport
                )

            override fun getJSBundleFile(): String? {
                val startTime = System.currentTimeMillis()

                if (!initializationDeferred.isCompleted) {
                    Log.d(APPTILE_LOG_TAG, "Waiting for startup process to complete...")
                    runBlocking {
                        initializationDeferred.await() // Wait in a blocking manner (not ideal but safer here)
                    }
                }

                val endTime = System.currentTimeMillis()
                val timeSpent = endTime - startTime
                Log.d(APPTILE_LOG_TAG, "Time spent to complete startup process: $timeSpent ms")

                val documentsDir = applicationContext.filesDir.absolutePath
                val bundlesDir = "$documentsDir/bundles"
                val jsBundleFile = File("$bundlesDir/index.android.bundle")

                val bundlePath = if (jsBundleFile.exists()) {
                    jsBundleFile.absolutePath
                } else {
                    Log.d(APPTILE_LOG_TAG, "Local bundle not found, using embedded bundle")
                    super.getJSBundleFile()
                }

                Log.d(APPTILE_LOG_TAG, "Loading RN App from bundle: $bundlePath")
                return bundlePath
            }
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(this.applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        ApptileApiClient.init(this)

        appScope.launch {
            Log.i(APPTILE_LOG_TAG, "Starting Startup Process")
            val appId = getString(R.string.APP_ID)
            Actions.startApptileAppProcess(appId, this@MainApplication)
            initializationDeferred.complete(Unit)
            Log.i(APPTILE_LOG_TAG, "Startup Process completed")
        }

//        createCleverTapIntegration(this).initialize(intent);
        SoLoader.init(this, false)
        // disable RTL
        val sharedI18nUtilInstance = I18nUtil.getInstance()
        sharedI18nUtilInstance.forceRTL(this, false)
        sharedI18nUtilInstance.allowRTL(this, false)

        createMoengageIntegration(this).initialize();

        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }
        ReactNativeFlipper.initializeFlipper(this, reactNativeHost.reactInstanceManager)
    }

    override fun onTerminate() {
        super.onTerminate()
        appScope.cancel() // Cancel coroutines when the app is shutting down
    }

//    fun onNewIntent(intent: Intent) {
//        super.onNewIntent(intent)
//
//        val app = applicationContext as MainApplication
//
//        createCleverTapIntegration(this).startup(intent, app);
//    }
}
