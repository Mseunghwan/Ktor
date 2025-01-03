package com.example.routes

import com.example.data.models.Post
import com.example.repositories.PostRepository
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.client.*
import io.ktor.client.request.*  // parameter 메서드를 위한 import
import io.ktor.client.statement.* // bodyAsText를 위한 import

private const val apiKey = "UEHWN0KQRKUCS009"

fun Route.postRoutes(postRepository: PostRepository,
                     httpClient: HttpClient,
                     apiKey: String) {
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
                val keywords = call.parameters["keywords"]
                    ?: return@get call.respond(HttpStatusCode.BadRequest, "keywords parameter is required")

                val response = httpClient.get("https://www.alphavantage.co/query") {
                    parameter("function", "SYMBOL_SEARCH")
                    parameter("keywords", keywords)
                    parameter("apikey", apiKey)
                }

                call.respond(response.bodyAsText())
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, "Failed to fetch stock data")
            }
        }

        get("/daily") {
            try {
                val symbol = call.parameters["symbol"]
                    ?: return@get call.respond(HttpStatusCode.BadRequest, "symbol parameter is required")

                val response = httpClient.get("https://www.alphavantage.co/query") {
                    parameter("function", "TIME_SERIES_DAILY")
                    parameter("symbol", symbol)
                    parameter("apikey", apiKey)
                }

                call.respond(response.bodyAsText())
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, "Failed to fetch daily stock data")
            }
        }
    }
}