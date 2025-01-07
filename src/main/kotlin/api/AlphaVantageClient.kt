/* import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import io.ktor.client.request.*
import io.ktor.client.statement.*
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
            ignoreUnknownKeys = true
        })
    }
}

fun main() {
    val apiKey = "UEHWN0KQRKUCS009" // 발급받은 API 키
    val symbol = "TSLA" // Apple 주식 티커

    runBlocking {
        val response: HttpResponse = client.get("https://www.alphavantage.co/query") {
            parameter("function", "TIME_SERIES_DAILY")
            parameter("symbol", symbol)
            parameter("apikey", apiKey)
        }


        // JSON 응답 파싱 및 첫 번째 데이터 추출
        val responseBody = response.bodyAsText()
        val json = Json.parseToJsonElement(responseBody).jsonObject
        val timeSeries = json["Time Series (Daily)"]?.jsonObject

        // 가장 첫 번째 데이터(가장 최근 데이터) 가져오기
        timeSeries?.entries?.firstOrNull()?.let { (date, data) ->
            println("가장 최근 날짜: $date")
            println("가장 최근 데이터: $data")
        } ?: println("Time Series 데이터를 찾을 수 없습니다.")
    }

    suspend fun searchSymbols(keywords: String): HttpResponse {
        return client.get("https://www.alphavantage.co/query") {
            parameter("function", "SYMBOL_SEARCH")
            parameter("keywords", keywords)
            parameter("apikey", apiKey)
        }
    }
}

참고용 코드 */

