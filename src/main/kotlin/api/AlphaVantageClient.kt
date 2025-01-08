import io.ktor.client.*
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
    val apiKey = "d9e10916798242b198db93055486f452" // 발급받은 API 키
    val symbols = "KRX:005380"
    val date_from = "2025-01-06"
    val date_to = "2025-01-06"

    runBlocking {
        val response: HttpResponse = client.get("https://api-v2.deepsearch.com/v1/articles") {
            parameter("symbols", symbols)
            parameter("date_from", date_from)
            parameter("deta_to", date_to)
        }


        // JSON 응답 파싱 및 첫 번째 데이터 추출
        val responseBody = response.bodyAsText()
        val json = Json.parseToJsonElement(responseBody).jsonObject
        val timeSeries = json["Time Series (Daily)"]?.jsonObject

    }

}


