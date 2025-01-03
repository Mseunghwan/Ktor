package com.example.data

import com.example.data.models.*
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import io.ktor.server.config.*
import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction

object DatabaseFactory {
    private fun hikari(config: ApplicationConfig): HikariDataSource {
        val hikariConfig = HikariConfig().apply {
            driverClassName = config.property("database.driver").getString()
            jdbcUrl = config.property("database.url").getString()
            username = config.property("database.user").getString()
            password = config.property("database.password").getString()
            maximumPoolSize = 10
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
        }
        return HikariDataSource(hikariConfig)
    }

    fun init(config: ApplicationConfig) {
        val dataSource = hikari(config)
        Database.connect(dataSource)

        transaction {
            SchemaUtils.create(Posts)
            SchemaUtils.create(kospi)
            SchemaUtils.create(nasdaq)
            SchemaUtils.create(nyse)
        }
    }

    suspend fun <T> dbQuery(block: suspend () -> T): T =
        newSuspendedTransaction(Dispatchers.IO) { block() }
}
