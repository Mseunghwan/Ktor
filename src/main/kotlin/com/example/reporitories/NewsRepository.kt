package com.example.repositories

import io.ktor.client.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*
import java.time.LocalDate

@Serializable
data class NewsArticle(
    val title: String,
    val summary: String,
    val date: String,
    val source: String,
    val content_url: String,
    val importance: String? = null,
    val sentiment: String? = null,
    val companies: List<CompanyMention>? = null
)

@Serializable
data class CompanyMention(
    val symbol: String,
    val name: String,
    val sentiment: String? = null
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

            val responseBody = response.bodyAsText()
            println("Domestic API Response: $responseBody")

            val jsonResponse = Json.parseToJsonElement(responseBody).jsonObject
            jsonResponse["data"]?.jsonArray?.mapNotNull { article ->
                article.jsonObject.let {
                    NewsArticle(
                        title = it["title"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                        summary = it["summary"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                        date = it["published_at"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                        source = it["publisher"]?.jsonPrimitive?.content ?: "Unknown",
                        content_url = it["content_url"]?.jsonPrimitive?.content ?: "",
                        importance = it["importance"]?.jsonPrimitive?.content,
                        sentiment = if (it.containsKey("sentiment")) {
                            when {
                                it["sentiment"]?.jsonPrimitive?.content?.toDoubleOrNull()?.let { score -> score > 0.3 } == true -> "positive"
                                it["sentiment"]?.jsonPrimitive?.content?.toDoubleOrNull()?.let { score -> score < -0.3 } == true -> "negative"
                                else -> "neutral"
                            }
                        } else {
                            "neutral"
                        },
                        companies = it["companies"]?.jsonArray?.mapNotNull { company ->
                            company.jsonObject.let { companyObj ->
                                CompanyMention(
                                    symbol = companyObj["symbol"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                                    name = companyObj["name"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                                    sentiment = companyObj["sentiment"]?.jsonPrimitive?.content
                                )
                            }
                        }
                    )
                }
            } ?: emptyList()
        } catch (e: Exception) {
            println("Error fetching domestic news: ${e.message}")
            e.printStackTrace()
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

            val responseBody = response.bodyAsText()
            println("Global API Response: $responseBody")

            val jsonResponse = Json.parseToJsonElement(responseBody).jsonObject
            jsonResponse["data"]?.jsonArray?.mapNotNull { article ->
                article.jsonObject.let {
                    NewsArticle(
                        title = it["title"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                        summary = it["summary"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                        date = it["published_at"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                        source = it["publisher"]?.jsonPrimitive?.content ?: "Unknown",
                        content_url = it["content_url"]?.jsonPrimitive?.content ?: "",
                        importance = it["importance"]?.jsonPrimitive?.content,
                        sentiment = if (it.containsKey("sentiment")) {
                            when {
                                it["sentiment"]?.jsonPrimitive?.content?.toDoubleOrNull()?.let { score -> score > 0.3 } == true -> "positive"
                                it["sentiment"]?.jsonPrimitive?.content?.toDoubleOrNull()?.let { score -> score < -0.3 } == true -> "negative"
                                else -> "neutral"
                            }
                        } else {
                            "neutral"
                        },
                        companies = it["companies"]?.jsonArray?.mapNotNull { company ->
                            company.jsonObject.let { companyObj ->
                                CompanyMention(
                                    symbol = companyObj["symbol"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                                    name = companyObj["name"]?.jsonPrimitive?.content ?: return@mapNotNull null,
                                    sentiment = companyObj["sentiment"]?.jsonPrimitive?.content
                                )
                            }
                        }
                    )
                }
            } ?: emptyList()
        } catch (e: Exception) {
            println("Error fetching global news: ${e.message}")
            e.printStackTrace()
            emptyList()
        }
    }
}