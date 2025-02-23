package com.apptileseed.src.models

data class CodeArtefact(
    val id: Long, val type: String, val cdnlink: String, val tag: String
)

data class Fork(
    val id: Int,
    val appId: Int,
    val frameworkVersion: String,
    val forkName: String,
    val title: String,
    val publishedCommitId: Long,
    val createdAt: String,
    val updatedAt: String,
    val deletedAt: String?
)

data class ManifestResponse(
    val id: Int,
    val name: String,
    val uuid: String,
    val organizationId: String,
    val published: Boolean,
    val platformType: String,
    val codeArtefacts: List<CodeArtefact>,
    val forks: List<Fork>
)
