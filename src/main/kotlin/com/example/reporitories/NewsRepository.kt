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
    private val baseUrl = "https://news.deepsearch.com/api"

    override suspend fun getDomesticNews(symbols: String, date: String): List<NewsArticle> {
        return try {
            val response = client.get("$baseUrl/news") {
                parameter("symbols", symbols)
                parameter("date", date)
                parameter("api_key", apiKey)
            }

            println("Domestic news API response: ${response.bodyAsText()}") // 디버깅용
            val jsonResponse = Json.parseToJsonElement(response.bodyAsText())
            parseNewsResponse(jsonResponse)
        } catch (e: Exception) {
            println("Error fetching domestic news: ${e.message}")
            e.printStackTrace()
            emptyList()
        }
    }

    override suspend fun getGlobalNews(symbols: String, date: String): List<NewsArticle> {
        return try {
            val response = client.get("$baseUrl/global-news") {
                parameter("symbols", symbols)
                parameter("date", date)
                parameter("api_key", apiKey)
            }

            println("Global news API response: ${response.bodyAsText()}") // 디버깅용
            val jsonResponse = Json.parseToJsonElement(response.bodyAsText())
            parseNewsResponse(jsonResponse)
        } catch (e: Exception) {
            println("Error fetching global news: ${e.message}")
            e.printStackTrace()
            emptyList()
        }
    }

    private fun parseNewsResponse(jsonResponse: JsonElement): List<NewsArticle> {
        return try {
            val articles = jsonResponse.jsonObject["articles"]?.jsonArray
                ?: jsonResponse.jsonObject["data"]?.jsonArray
                ?: return emptyList()

            articles.mapNotNull { article ->
                article.jsonObject.let {
                    NewsArticle(
                        title = it["title"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                        summary = it["summary"]?.jsonPrimitive?.content ?: it["description"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                        date = it["date"]?.jsonPrimitive?.content ?: it["published_at"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                        source = it["source"]?.jsonPrimitive?.content ?: it["source_name"]?.jsonPrimitive?.content ?: "Unknown"
                    )
                }
            }
        } catch (e: Exception) {
            println("Error parsing news response: ${e.message}")
            e.printStackTrace()
            emptyList()
        }
    }
}