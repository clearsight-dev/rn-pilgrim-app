package com.apptileseed.src.utils

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.ResponseBody
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream


fun copyAssetToDocuments(context: Context, assetFileName: String, destinationFileName: String) {
    val destinationFile = File(context.filesDir, destinationFileName)

    if (!destinationFile.exists()) {
        try {
            context.assets.open(assetFileName).use { inputStream ->
                FileOutputStream(destinationFile).use { outputStream ->
                    inputStream.copyTo(outputStream)
                }
            }
            println("File copied successfully: $destinationFile")
        } catch (e: IOException) {
            e.printStackTrace()
            println("Error copying file: ${e.message}")
        }
    } else {
        println("File already exists: $destinationFile")
    }
}

fun readFileContent(filePath: String): String? {
    val file = File(filePath)
    return if (file.exists()) {
        file.readText()
    } else {
        null
    }
}

suspend fun saveFile(responseBody: ResponseBody, filePath: String): Boolean {
    return try {
        val file = File(filePath)
        val inputStream: InputStream? = responseBody.byteStream()
        val outputStream = withContext(Dispatchers.IO) {
            FileOutputStream(file)
        }

        inputStream?.use { input ->
            outputStream.use { output ->
                input.copyTo(output)
            }
        }

        println("File copied successfully: $filePath")
        true
    } catch (e: Exception) {
        println("File save failed: ${e.message}")
        false
    }
}

fun deleteFile(filePath: String): Boolean {
    val file = File(filePath)
    return if (file.exists()) {
        file.delete()
    } else {
        false
    }
}

fun moveFile(sourcePath: String, destinationPath: String): Boolean {
    val sourceFile = File(sourcePath)
    val destinationFile = File(destinationPath)

    return if (sourceFile.exists()) {
        println("[Apptile] File Moving from ${sourceFile.absoluteFile} to ${destinationFile.absoluteFile }")
        sourceFile.renameTo(destinationFile)
    } else {
        false
    }
}

fun unzip(zipFilePath: String, destDirPath: String) {
    val destDir = File(destDirPath)
    if (!destDir.exists()) destDir.mkdirs()

    ZipInputStream(File(zipFilePath).inputStream()).use { zipInputStream ->
        var entry: ZipEntry? = zipInputStream.nextEntry
        while (entry != null) {
            val outputFile = File(destDir, entry.name)

            // Create parent directories if needed
            if (entry.isDirectory) {
                outputFile.mkdirs()
            } else {
                outputFile.parentFile?.mkdirs()
                FileOutputStream(outputFile).use { outputStream ->
                    zipInputStream.copyTo(outputStream)
                }
            }

            zipInputStream.closeEntry()
            entry = zipInputStream.nextEntry
        }
    }
}
