package com.apptileseed

import android.content.Context

fun createMoengageIntegration(context: Context): MoengageIntegrationInterface {
  return MoengageIntegrationImpl(context);
}
