package com.apptileseed

import android.app.ActivityOptions
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
import android.widget.FrameLayout
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.apptileseed.src.actions.Actions
import com.apptileseed.src.utils.APPTILE_LOG_TAG
import com.bumptech.glide.Glide
import kotlinx.coroutines.launch

object SplashManager {
    private var splashRemoveListener: (() -> Unit)? = null

    fun setOnSplashRemoveListener(listener: () -> Unit) {
        splashRemoveListener = listener
    }

    fun removeSplash() {
        splashRemoveListener?.invoke()
    }
}


class LauncherActivity : AppCompatActivity() {
    private var isJSLoaded = false
    private var isMinSplashDurationPlayed = false
    val minSplashDuration = 2.0f
    val maxSplashduration = 20.0f
    private var nativeSplashView: ImageView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        Log.d(APPTILE_LOG_TAG, "Launcher activity onCreate called")
        super.onCreate(savedInstanceState)

        showNativeSplash()

        SplashManager.setOnSplashRemoveListener {
            runOnUiThread {
                deleteSplashImage()
            }
        }

        lifecycleScope.launch {
            try {
                Log.d(APPTILE_LOG_TAG, "Running in: ${Thread.currentThread().name}")
                Log.i(APPTILE_LOG_TAG, "Starting Startup Process")

                val appId = getString(R.string.APP_ID)
                Actions.startApptileAppProcess(appId, this@LauncherActivity)

                // reinitialize the react native
                 (application as? MainApplication)?.resetReactNativeHost()

                startMainActivity()
                Log.i(APPTILE_LOG_TAG, "Startup Process completed")
            } catch (e: Exception) {
                Log.e(APPTILE_LOG_TAG, "Startup Process failed", e)
            }
        }
    }

    private fun showNativeSplash() {
        // This makes sure the splash image is drawn in the cutout area
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            val layoutParams = window.attributes
            layoutParams.layoutInDisplayCutoutMode = LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
            window.attributes = layoutParams

            window.decorView.systemUiVisibility =
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        }

        val image: ImageView = ImageView(this.applicationContext)

        this.nativeSplashView = image
        Glide.with(this).load(R.drawable.splash).centerCrop().into(image)

        val frameLayout = FrameLayout(this)

        frameLayout.addView(image)
        val rootFrlayout = this.window.decorView.findViewById<FrameLayout>(android.R.id.content)
        rootFrlayout.addView(frameLayout)

        val minDelayMs = (minSplashDuration * 1000).toLong()
        Handler(Looper.getMainLooper()).postDelayed({
            isMinSplashDurationPlayed = true
            this.deleteSplashImage()
        }, minDelayMs)

        val maxDelayMs = (maxSplashduration * 1000).toLong()
        Handler(Looper.getMainLooper()).postDelayed({
            isMinSplashDurationPlayed = true
            isJSLoaded = true
            this.deleteSplashImage()
        }, maxDelayMs)
    }

    // Called only from javascript side through RNApptile module.
    // This function doesn't actually remove the splash but makes
    // an attempt.
    open fun removeSplash() {
        this.isJSLoaded = true
        this.deleteSplashImage()
    }

    // Removes the splash image if both javascript thread has asked
    // to remove it and the minimum play duration has passed
    private fun deleteSplashImage() {
        if (this.nativeSplashView != null && this.isMinSplashDurationPlayed && this.isJSLoaded) {
            val view: ImageView = this.nativeSplashView!!
            if (view.parent != null) {
                val viewGroup: ViewGroup = view.parent as ViewGroup
                viewGroup.removeView(view)
            }
        }
    }


    private fun startMainActivity() {
        Log.d(APPTILE_LOG_TAG, "starting main activity")
        val intent = Intent(this, MainActivity::class.java)
        val options = ActivityOptions.makeCustomAnimation(
            this, android.R.anim.fade_in, 0
        )
        startActivity(intent, options.toBundle())
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        SplashManager.setOnSplashRemoveListener {}
    }
}