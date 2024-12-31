package com.example

import com.example.models.Post
import com.example.repositories.PostRepository
import com.example.repositories.PostRepositoryImpl
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.jackson.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.http.content.*

fun main() {
    embeddedServer(Netty, port = 8080) {
        install(ContentNegotiation) {
            jackson()  // 간단한 설정으로 변경
        }

        val postRepository: PostRepository = PostRepositoryImpl()

        routing {
            // 정적 파일 제공을 위한 설정
            static("/static") {
                resources("static")
            }

            // HTML 파일 제공
            get("/") {
                val file = Application::class.java.classLoader.getResource("templates/index.html")
                if (file != null) {
                    call.respondText(file.readText(), ContentType.Text.Html)
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }

            // API 라우트
            route("/api/posts") {
                // 게시글 목록 조회
                get {
                    val posts = postRepository.getAll()
                    println("Retrieved posts: $posts")  // 로그 추가
                    call.respond(posts)
                }

                // 게시글 생성
                // 게시글 생성
                post {
                    try {
                        val post = call.receive<Post>()
                        println("Received post: $post")
                        val createdPost = postRepository.create(post)
                        println("Created post: $createdPost")
                        call.respond(HttpStatusCode.Created, mapOf("success" to true, "post" to createdPost))
                    } catch (e: Exception) {
                        println("Error creating post: ${e.message}")
                        call.respond(HttpStatusCode.BadRequest, mapOf("success" to false, "error" to (e.message ?: "Unknown error")))
                    }
                }

                // 특정 게시글 조회
                get("{id}") {
                    val id = call.parameters["id"]?.toIntOrNull()
                        ?: return@get call.respond(HttpStatusCode.BadRequest, "Invalid ID")

                    val post = postRepository.getById(id)
                        ?: return@get call.respond(HttpStatusCode.NotFound, "Post not found")

                    call.respond(post)
                }

                // 게시글 수정
                put("{id}") {
                    val id = call.parameters["id"]?.toIntOrNull()
                        ?: return@put call.respond(HttpStatusCode.BadRequest, "Invalid ID")

                    val post = call.receive<Post>()
                    val updatedPost = postRepository.update(id, post)
                        ?: return@put call.respond(HttpStatusCode.NotFound, "Post not found")

                    call.respond(updatedPost)
                }

                // 게시글 삭제
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
    }.start(wait = true)
}