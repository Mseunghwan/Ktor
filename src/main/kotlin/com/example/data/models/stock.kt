package com.example.data.models
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Table

@Serializable
data class Stock(
    val symbol: String,
    val name: String,
    val sector: String?,
    val industry: String?,
    val market: String  // 'KOSPI', 'NASDAQ', 'NYSE' 구분용
)
object kospi : Table("kospi") {
    val symbol = varchar("symbol", 20)
    val name = varchar("name", 100)
    val sector = varchar("sector", 100).nullable()
    val industry = varchar("industry", 100).nullable()

    override val primaryKey = PrimaryKey(symbol)  // 기본 키 설정
}

object nasdaq : Table("nasdaq") {
    val symbol = varchar("symbol", 20)
    val name = varchar("name", 100)
    val sector = varchar("sector", 100).nullable()
    val industry = varchar("industry", 100).nullable()

    override val primaryKey = PrimaryKey(symbol)  // 기본 키 설정
}

object nyse : Table("nyse") {
    val symbol = varchar("symbol", 20)
    val name = varchar("name", 100)
    val sector = varchar("sector", 100).nullable()
    val industry = varchar("industry", 100).nullable()

    override val primaryKey = PrimaryKey(symbol)  // 기본 키 설정
}