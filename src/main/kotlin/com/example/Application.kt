package com.example

import com.example.data.DatabaseFactory
import com.example.data.models.Post
import com.example.repositories.PostRepository
import com.example.repositories.PostRepositoryImpl
import com.example.routes.postRoutes
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
        staticResources("/static", "static")
        postRoutes(postRepository)
    }
}
