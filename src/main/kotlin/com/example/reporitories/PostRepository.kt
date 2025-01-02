package com.example.repositories

import com.example.data.models.Post

// 동작 인터페이스
interface PostRepository {
    suspend fun create(post: Post): Post
    suspend fun getAll(): List<Post>
    suspend fun getById(id: Int): Post?
    suspend fun update(id: Int, post: Post): Post?
    suspend fun delete(id: Int): Boolean
}