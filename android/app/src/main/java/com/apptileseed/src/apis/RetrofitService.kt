package com.apptileseed.src.apis

import com.apptileseed.src.models.ManifestResponse
import okhttp3.ResponseBody
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Streaming
import retrofit2.http.Url

interface ApiService {
    @GET("api/v2/app/{appId}/manifest")
    suspend fun getManifest(@Path("appId") uuid: String): ManifestResponse

    @GET
    @Streaming
    suspend fun downloadFile(@Url fileUrl: String): ResponseBody

}

interface AppConfigApiService {
    @GET
    @Streaming
    suspend fun downloadFile(@Url fileUrl: String): ResponseBody
}
