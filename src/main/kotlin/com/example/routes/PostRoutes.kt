package com.example.routes

import com.example.data.models.Post
import com.example.repositories.PostRepository
import com.example.repositories.StockRepository
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.client.*

private const val apiKey = "UEHWN0KQRKUCS009"

fun Route.postRoutes(
    postRepository: PostRepository,
    httpClient: HttpClient,
    apiKey: String,
    stockRepository: StockRepository
) {
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

    route("/api/stock") {
        get("/search") {
            try {
                val keyword = call.parameters["keywords"]
                    ?: return@get call.respond(HttpStatusCode.BadRequest, "keywords parameter is required")
                val market = call.parameters["market"]

                val stocks = stockRepository.searchStocks(keyword, market)
                call.respond(stocks)
            } catch (e: Exception) {
                e.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError, "Failed to search stocks: ${e.message}")
            }
        }
    }
}