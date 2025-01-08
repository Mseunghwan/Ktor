package com.example.repositories

import io.ktor.client.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*

@Serializable
data class NewsArticle(
    val title: String,
    val summary: String,
    val date: String,
    val source: String
)

interface NewsRepository {
    suspend fun getDomesticNews(symbols: String, date: String): List<NewsArticle>
    suspend fun getGlobalNews(symbols: String, date: String): List<NewsArticle>
}

class NewsRepositoryImpl : NewsRepository {
    private val client = HttpClient()
    private val apiKey = "d9e10916798242b198db93055486f452"
    private val baseUrl = "https://api-v2.deepsearch.com/v1"

    override suspend fun getDomesticNews(symbols: String, date: String): List<NewsArticle> {
        return try {
            val response = client.get("$baseUrl/articles") {
                parameter("symbols", symbols)
                parameter("date_from", date)
                parameter("date_to", date)
                parameter("api_key", apiKey)
            }

            val jsonResponse = Json.parseToJsonElement(response.bodyAsText())
            parseNewsResponse(jsonResponse)
        } catch (e: Exception) {
            println("Error fetching domestic news: ${e.message}")
            emptyList()
        }
    }

    override suspend fun getGlobalNews(symbols: String, date: String): List<NewsArticle> {
        return try {
            val response = client.get("$baseUrl/global-articles") {
                parameter("symbols", symbols)
                parameter("date_from", date)
                parameter("date_to", date)
                parameter("api_key", apiKey)
            }

            val jsonResponse = Json.parseToJsonElement(response.bodyAsText())
            parseNewsResponse(jsonResponse)
        } catch (e: Exception) {
            println("Error fetching global news: ${e.message}")
            emptyList()
        }
    }

    private fun parseNewsResponse(jsonResponse: JsonElement): List<NewsArticle> {
        return try {
            val articles = jsonResponse.jsonObject["data"]?.jsonArray ?: return emptyList()
            articles.mapNotNull { article ->
                article.jsonObject.let {
                    NewsArticle(
                        title = it["title"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                        summary = it["summary"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                        date = it["date"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                        source = it["source"]?.jsonPrimitive?.content ?: "Unknown"
                    )
                }
            }
        } catch (e: Exception) {
            println("Error parsing news response: ${e.message}")
            emptyList()
        }
    }
}