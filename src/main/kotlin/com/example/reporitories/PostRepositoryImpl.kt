package com.example.repositories

import com.example.models.Post

class PostRepositoryImpl : PostRepository {
    private val posts = mutableMapOf<Int, Post>()
    private var currentId = 1

    override suspend fun create(post: Post): Post {
        val newPost = post.copy(id = currentId++)
        posts[newPost.id] = newPost
        return newPost
    }

    override suspend fun getAll(): List<Post> {
        return posts.values.toList()
    }

    override suspend fun getById(id: Int): Post? {
        return posts[id]
    }

    override suspend fun update(id: Int, post: Post): Post? {
        if (!posts.containsKey(id)) return null
        val updatedPost = post.copy(id = id)
        posts[id] = updatedPost
        return updatedPost
    }

    override suspend fun delete(id: Int): Boolean {
        return posts.remove(id) != null
    }
}