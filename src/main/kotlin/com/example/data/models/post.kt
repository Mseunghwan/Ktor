package com.example.data.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime

@Serializable
data class Post(
    val id: Int = 0,
    val title: String,
    val content: String,
    val author: String,
    val created_at: String? = null // JSON 직렬화를 위해 문자열로 저장
)

// Posts 테이블 정의
object Posts : IntIdTable("posts") {
    val title = varchar("title", 255)
    val content = text("content")
    val author = varchar("author", 255)
    val created_at = datetime("created_at").defaultExpression(org.jetbrains.exposed.sql.javatime.CurrentDateTime)
}
