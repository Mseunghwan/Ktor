package com.example

import com.example.data.DatabaseFactory
import com.example.data.models.Post
import com.example.repositories.PostRepository
import com.example.repositories.PostRepositoryImpl
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.jackson.*
import io.ktor.server.routing.*
import io.ktor.server.config.*
import io.ktor.server.http.content.*
import io.ktor.server.request.*
import io.ktor.server.response.*

fun main() {
    embeddedServer(Netty, port = 8080, module = {
        // 수동으로 설정 추가
        val config = MapApplicationConfig().apply {
            put("database.driver", System.getenv("DB_DRIVER") ?: "org.mariadb.jdbc.Driver")
            put("database.url", System.getenv("DB_URL") ?: "jdbc:mariadb://localhost:3306/vacation_ktor")
            put("database.user", System.getenv("DB_USER") ?: "default_user")
            put("database.password", System.getenv("DB_PASSWORD") ?: "default_password")
        }
        module(config)
    }).start(wait = true)
}


fun Application.module(customConfig: ApplicationConfig? = null) {
    // 커스텀 설정이 있으면 사용, 없으면 기본 environment 설정 사용
    val config = customConfig ?: environment.config

    install(ContentNegotiation) {
        jackson()
    }

    DatabaseFactory.init(config)

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
}
