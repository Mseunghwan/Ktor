package com.example.repositories

import com.example.data.models.Post
import com.example.data.models.Posts
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime

class PostRepositoryImpl : PostRepository {

    override suspend fun create(post: Post): Post {
        var generatedId = 0
        val now = LocalDateTime.now() // 현재 시간 가져오기
        transaction {
            generatedId = Posts.insertAndGetId {
                it[title] = post.title
                it[content] = post.content
                it[author] = post.author
                it[created_at] = now
            }.value
        }
        return post.copy(id = generatedId, created_at = now.toString())
    }

    override suspend fun getAll(): List<Post> {
        return transaction {
            Posts.selectAll().map {
                Post(
                    id = it[Posts.id].value,
                    title = it[Posts.title],
                    content = it[Posts.content],
                    author = it[Posts.author],
                    created_at = it[Posts.created_at].toString() // LocalDateTime을 문자열로 변환
                )
            }
        }
    }

    override suspend fun getById(id: Int): Post? {
        return transaction {
            Posts.select { Posts.id eq id }
                .map {
                    Post(
                        id = it[Posts.id].value,
                        title = it[Posts.title],
                        content = it[Posts.content],
                        author = it[Posts.author],
                        created_at = it[Posts.created_at].toString() // LocalDateTime 변환
                    )
                }.singleOrNull()
        }
    }

    override suspend fun update(id: Int, post: Post): Post? {
        var updatedRows = 0
        val now = LocalDateTime.now() // 현재 시간 가져오기
        transaction {
            updatedRows = Posts.update({ Posts.id eq id }) {
                it[title] = post.title
                it[content] = post.content
                it[author] = post.author
                it[created_at] = now // 업데이트된 시간 적용
            }
        }
        return if (updatedRows > 0) getById(id) else null
    }

    override suspend fun delete(id: Int): Boolean {
        return transaction {
            Posts.deleteWhere { Posts.id eq id } > 0
        }
    }
}
