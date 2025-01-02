package com.example.repositories

import com.example.data.models.Post
import com.example.data.models.Posts
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction

class PostRepositoryImpl : PostRepository {

    override suspend fun create(post: Post): Post {
        var generatedId = 0
        transaction {
            generatedId = Posts.insertAndGetId {
                it[title] = post.title
                it[content] = post.content
                it[author] = post.author
            }.value
        }
        return post.copy(id = generatedId)
    }

    override suspend fun getAll(): List<Post> {
        return transaction {
            Posts.selectAll().map {
                Post(
                    id = it[Posts.id].value,
                    title = it[Posts.title],
                    content = it[Posts.content],
                    author = it[Posts.author]
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
                        author = it[Posts.author]
                    )
                }.singleOrNull()
        }
    }

    override suspend fun update(id: Int, post: Post): Post? {
        var updatedRows = 0
        transaction {
            updatedRows = Posts.update({ Posts.id eq id }) {
                it[title] = post.title
                it[content] = post.content
                it[author] = post.author
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
