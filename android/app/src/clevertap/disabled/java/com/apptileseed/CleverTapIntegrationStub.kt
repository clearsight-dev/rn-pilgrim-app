package com.apptileseed

import android.content.Context

class CleverTapIntegrationStub(private val context: Context) : CleverTapIntegrationInterface {
  override fun initialize(intent: Intent) {}
  override fun startup(intent: Intent, app: MainApplication) {}
}
