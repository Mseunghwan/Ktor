package com.example.data.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.id.IntIdTable

@Serializable
data class Post(
    val id: Int = 0,
    val title: String,
    val content: String,
    val author: String,
)

// Posts 테이블 정의
object Posts : IntIdTable("posts") {
    val title = varchar("title", 255)
    val content = text("content")
    val author = varchar("author", 255)
}
