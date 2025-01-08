package com.example.routes

import com.example.repositories.NewsRepository
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.newsRoutes(newsRepository: NewsRepository) {
    route("/api/news") {
        get("/domestic") {
            try {
                val symbols = call.parameters["symbols"]
                    ?: return@get call.respond(HttpStatusCode.BadRequest, "symbols parameter is required")
                val date = call.parameters["date"]
                    ?: return@get call.respond(HttpStatusCode.BadRequest, "date parameter is required")

                val news = newsRepository.getDomesticNews(symbols, date)
                call.respond(news)
            } catch (e: Exception) {
                e.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError, "Failed to fetch domestic news: ${e.message}")
            }
        }

        get("/global") {
            try {
                val symbols = call.parameters["symbols"]
                    ?: return@get call.respond(HttpStatusCode.BadRequest, "symbols parameter is required")
                val date = call.parameters["date"]
                    ?: return@get call.respond(HttpStatusCode.BadRequest, "date parameter is required")

                val news = newsRepository.getGlobalNews(symbols, date)
                call.respond(news)
            } catch (e: Exception) {
                e.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError, "Failed to fetch global news: ${e.message}")
            }
        }
    }
}