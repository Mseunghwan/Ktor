// src/main/kotlin/com/example/routes/StockRoutes.kt
package com.example.routes

import com.example.repositories.StockRepository
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.stockRoutes(stockRepository: StockRepository) {
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

        get("/price") {
            try {
                val symbol = call.parameters["symbol"]
                    ?: return@get call.respond(HttpStatusCode.BadRequest, "Symbol parameter is required")
                val market = call.parameters["market"]
                    ?: return@get call.respond(HttpStatusCode.BadRequest, "Market parameter is required")

                val price = stockRepository.getStockPrice(symbol, market)
                    ?: return@get call.respond(HttpStatusCode.NotFound, "Price not found")

                call.respond(hashMapOf("price" to price))
            } catch (e: Exception) {
                e.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError, "Failed to fetch stock price: ${e.message}")
            }
        }
    }
}