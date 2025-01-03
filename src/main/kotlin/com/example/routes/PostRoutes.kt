package com.example.routes

import com.example.data.models.Post
import com.example.repositories.PostRepository
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.postRoutes(postRepository: PostRepository) {
    // API 라우트를 /api/posts로 직접 설정
    route("/api/posts") {
        post {
            val post = call.receive<Post>()
            val createdPost = postRepository.create(post)
            call.respond(HttpStatusCode.Created, createdPost)
        }

        get {
            val posts = postRepository.getAll()
            call.respond(posts)
        }

        get("{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
                ?: return@get call.respond(HttpStatusCode.BadRequest, "Invalid ID")

            val post = postRepository.getById(id)
                ?: return@get call.respond(HttpStatusCode.NotFound, "Post not found")

            call.respond(post)
        }

        put("{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
                ?: return@put call.respond(HttpStatusCode.BadRequest, "Invalid ID")

            val post = call.receive<Post>()
            val existingPost = postRepository.getById(id)
                ?: return@put call.respond(HttpStatusCode.NotFound, "Post not found")

            val updatedPost = postRepository.update(
                id,
                post.copy(created_at = existingPost.created_at)
            ) ?: return@put call.respond(HttpStatusCode.NotFound, "Post not found")

            call.respond(updatedPost)
        }

        delete("{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
                ?: return@delete call.respond(HttpStatusCode.BadRequest, "Invalid ID")

            val deleted = postRepository.delete(id)
            if (deleted) {
                call.respond(HttpStatusCode.NoContent)
            } else {
                call.respond(HttpStatusCode.NotFound, "Post not found")
            }
        }
    }
}