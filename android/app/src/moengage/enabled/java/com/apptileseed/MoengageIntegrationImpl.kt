package com.apptileseed

import android.app.Application
import android.content.Context
import com.moengage.core.DataCenter
import com.moengage.core.LogLevel
import com.moengage.core.MoEngage
import com.moengage.core.config.LogConfig
import com.moengage.core.config.NOTIFICATION_CONFIG_DEFAULT_COLOR_RESOURCE_ID
import com.moengage.core.config.NotificationConfig
import com.moengage.react.MoEInitializer

class MoengageIntegrationImpl(private val context: Context) : MoengageIntegrationInterface {
    override fun initialize() {
        val moEngageAppId = context.getString(R.string.moengage_app_id)
        val moEngageDataCenterString = context.getString(R.string.moengage_datacenter)
        val moEngageDataCenter = when (moEngageDataCenterString) {
            "data_center_1" -> DataCenter.DATA_CENTER_1
            "data_center_2" -> DataCenter.DATA_CENTER_2
            "data_center_3" -> DataCenter.DATA_CENTER_3
            "data_center_4" -> DataCenter.DATA_CENTER_4
            "data_center_5" -> DataCenter.DATA_CENTER_5
            "data_center_6" -> DataCenter.DATA_CENTER_6
            else -> DataCenter.DATA_CENTER_100
        }

        val moEngage = MoEngage.Builder(context as Application, moEngageAppId, moEngageDataCenter)
            .configureLogs(LogConfig(LogLevel.VERBOSE, false)).configureNotificationMetaData(
                NotificationConfig(
                    R.mipmap.ic_launcher_round,
                    R.mipmap.ic_launcher_round,
                    NOTIFICATION_CONFIG_DEFAULT_COLOR_RESOURCE_ID,
                    true
                )
            )
        MoEInitializer.initializeDefaultInstance(context, moEngage, true)
    }
}
