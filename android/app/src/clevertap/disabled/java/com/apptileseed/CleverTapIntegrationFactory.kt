package com.apptileseed

import android.content.Context

fun createCleverTapIntegration(context: Context): CleverTapIntegrationInterface {
  return CleverTapIntegrationStub(context);
}
