package com.apptileseed

import com.clevertap.react.CleverTapModule 
import com.clevertap.android.sdk.CleverTapAPI
import android.content.Context

class CleverTapIntegrationImpl(private val context: Context) : CleverTapIntegrationInterface {
  override fun initialize(intent: Intent) {
    CleverTapModule.setInitialUri(intent.data);
  }

  override fun startup(intent: Intent, app: MainApplication) {
    val extras = intent.extras
    CleverTapAPI.getDefaultInstance(app)?.pushNotificationClickedEvent(extras)
  }
}
