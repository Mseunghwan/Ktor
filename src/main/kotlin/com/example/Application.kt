package com.example

import com.example.data.DatabaseFactory
import com.example.repositories.PostRepository
import com.example.repositories.PostRepositoryImpl
import com.example.repositories.StockRepository
import com.example.repositories.StockRepositoryImpl
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
import io.ktor.server.plugins.cors.routing.*


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

    install(ContentNegotiation) {
        jackson()
    }


    val config = customConfig ?: environment.config


    // CORS 추가
    install(CORS) {
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.ContentType)
        anyHost()
    }

    DatabaseFactory.init(config)
    val postRepository: PostRepository = PostRepositoryImpl()
    val stockRepository: StockRepository = StockRepositoryImpl()

    routing {
        // API 라우트를 먼저 선언
        postRoutes(
            postRepository = postRepository,
            stockRepository = stockRepository  // 추가
        )
        // React 앱 서빙
        static("/") {
            resources("webapp/frontend/dist")
            defaultResource("webapp/frontend/dist/index.html")
        }

        // 정적 파일 제공
        static("/static") {
            resources("static")
        }
    }
}