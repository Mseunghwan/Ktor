plugins {
    kotlin("jvm") version "2.0.0"
    id("io.ktor.plugin") version "3.0.2"
    kotlin("plugin.serialization") version "2.0.0"
    id("com.github.node-gradle.node") version "3.5.1"
}

// Node 설정 추가
node {
    version.set("18.16.0")
    download.set(true)
    workDir.set(file("${project.buildDir}/nodejs"))
    npmWorkDir.set(file("${project.buildDir}/npm"))

    // webapp 디렉토리 설정
    nodeProjectDir.set(file("${project.projectDir}/src/main/resources/webapp/frontend"))
}

// React 빌드 태스크 추가
tasks {
    val npmBuild = register<com.github.gradle.node.npm.task.NpmTask>("npmBuild") {
        args.set(listOf("run", "build"))
        dependsOn("npmInstall")
        inputs.dir("src/main/resources/webapp/frontend/src")
        outputs.dir("src/main/resources/webapp/frontend/dist")
    }

    // 메인 빌드 태스크에 React 빌드 추가
    named("processResources") {
        dependsOn(npmBuild)
    }
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

    implementation("io.ktor:ktor-client-content-negotiation:3.0.2")
    implementation("io.ktor:ktor-serialization-kotlinx-json:3.0.2")
    implementation("io.ktor:ktor-server-cors:3.0.2")

    implementation("org.python:jython-standalone:2.7.3")
}
