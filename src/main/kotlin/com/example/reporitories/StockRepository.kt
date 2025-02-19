package com.example.repositories

import com.example.data.DatabaseFactory.dbQuery
import com.example.data.models.Stock
import com.example.data.models.kospi
import com.example.data.models.nasdaq
import com.example.data.models.nyse
import org.jetbrains.exposed.sql.*
import org.python.core.PyObject
import org.python.util.PythonInterpreter
import org.python.core.Py
import org.jetbrains.exposed.sql.SqlExpressionBuilder.like


interface StockRepository {
    suspend fun searchStocks(keyword: String, market: String? = null): List<Stock>
    suspend fun getStockPrice(symbol: String, market: String): Double? // 추가
}

class StockRepositoryImpl : StockRepository {
    override suspend fun searchStocks(keyword: String, market: String?): List<Stock> = dbQuery {
        val searchPattern = "%${keyword.lowercase()}%"

        fun searchInTable(table: Table): List<Stock> {
            return (table as? kospi)?.select {
                (kospi.symbol like searchPattern) or (kospi.name like searchPattern)
            }?.limit(5)?.map {
                Stock(
                    symbol = it[kospi.symbol],
                    name = it[kospi.name],
                    sector = it[kospi.sector],
                    industry = it[kospi.industry],
                    market = "KOSPI"
                )
            } ?: (table as? nasdaq)?.select {
                (nasdaq.symbol like searchPattern) or (nasdaq.name like searchPattern)
            }?.limit(5)?.map {
                Stock(
                    symbol = it[nasdaq.symbol],
                    name = it[nasdaq.name],
                    sector = it[nasdaq.sector],
                    industry = it[nasdaq.industry],
                    market = "NASDAQ"
                )
            } ?: (table as? nyse)?.select {
                (nyse.symbol like searchPattern) or (nyse.name like searchPattern)
            }?.limit(5)?.map {
                Stock(
                    symbol = it[nyse.symbol],
                    name = it[nyse.name],
                    sector = it[nyse.sector],
                    industry = it[nyse.industry],
                    market = "NYSE"
                )
            } ?: listOf()
        }

        val tables = when (market?.uppercase()) {
            "KOSPI" -> listOf(kospi)
            "NASDAQ" -> listOf(nasdaq)
            "NYSE" -> listOf(nyse)
            else -> listOf(kospi, nasdaq, nyse)
        }

        tables.flatMap { table ->
            searchInTable(table)
        }.take(10)
    }

    override suspend fun getStockPrice(symbol: String, market: String): Double? = dbQuery {
        try {
            val interpreter = PythonInterpreter()

            interpreter.exec("import FinanceDataReader as fdr")
            interpreter.exec("""
            def get_last_price(symbol):
                try:
                    df = fdr.DataReader(symbol)
                    return str(df['Close'].iloc[-1])
                except Exception as e:
                    print(f"Error in get_last_price: {str(e)}")
                    return None
        """)

            val pyFunc = interpreter.get("get_last_price")
            val result = pyFunc.__call__(Py.newString(symbol))

            result?.toString()?.toDoubleOrNull()
        } catch (e: Exception) {
            println("Error fetching stock price: ${e.message}")
            null
        }
    }
    }
