package com.example.plugins

import com.example.repositories.PostRepository
import com.example.repositories.PostRepositoryImpl
import com.example.routes.postRoutes
import io.ktor.server.application.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    val postRepository: PostRepository = PostRepositoryImpl()

    routing {
        postRoutes(postRepository)
    }
}