package com.apptileseed

import android.os.Bundle
import android.util.Log
import com.apptileseed.src.utils.APPTILE_LOG_TAG
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "apptileSeed"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
        SplashOverlayManager.showOverlay(this)
    }

    fun removeSplash() {
        Log.d(APPTILE_LOG_TAG, "Splash overlay remove called from main activity ")
        SplashOverlayManager.removeOverlay(this)
    }
}
