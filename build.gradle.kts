plugins {
    kotlin("jvm") version "2.0.0"
    id("io.ktor.plugin") version "3.0.2"
    kotlin("plugin.serialization") version "2.0.0"
}

group = "com.example"
version = "0.0.1"

application {
    mainClass.set("io.ktor.server.netty.EngineMain")

    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.ktor:ktor-server-core:3.0.2")
    implementation("io.ktor:ktor-server-netty:3.0.2")
    implementation("io.ktor:ktor-server-content-negotiation:3.0.2")
    implementation("io.ktor:ktor-serialization-jackson:3.0.2")
    implementation("ch.qos.logback:logback-classic:1.4.11")
    implementation("io.ktor:ktor-server-html-builder:3.0.2")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.15.2")
    implementation("mysql:mysql-connector-java:8.0.33")

    implementation("org.mariadb.jdbc:mariadb-java-client:3.1.4")
    implementation("com.zaxxer:HikariCP:5.0.1") // HikariCP 연결 풀
    implementation("org.jetbrains.exposed:exposed-core:0.43.0") // Exposed Core
    implementation("org.jetbrains.exposed:exposed-dao:0.43.0") // Exposed DAO
    implementation("org.jetbrains.exposed:exposed-jdbc:0.43.0") // Exposed JDBC
    implementation("org.jetbrains.exposed:exposed-java-time:0.43.0") // datetime 함수 사용을 위한 모듈

    implementation("io.ktor:ktor-client-core:2.3.4") // 최신 버전 사용
    implementation("io.ktor:ktor-client-cio:2.3.4") // CIO 엔진
    implementation("io.ktor:ktor-client-content-negotiation:2.3.4") // Content Negotiation 플러그인
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.4") // Kotlinx JSON 직렬화
}
