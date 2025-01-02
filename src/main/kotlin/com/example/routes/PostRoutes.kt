package com.example.routes

import com.example.data.models.Post
import com.example.repositories.PostRepository
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.postRoutes(postRepository: PostRepository) {
    route("/api/posts") {
        post {
            val post = call.receive<Post>() // 클라이언트가 보낸 JSON을 Post 객체로 변환
            val createdPost = postRepository.create(post) // 저장소에 새 게시글 저장
            call.respond(HttpStatusCode.Created, createdPost) // 201 상태코드와 함께 생성된 게시글 반환
        }

        get {
            val posts = postRepository.getAll() // 저장소에서 모든 게시글 조회
            call.respond(posts) // 게시글 목록 반환
        }

        get("{id}") {
            val id = call.parameters["id"]?.toIntOrNull() // URL에서 ID 추출
                ?: return@get call.respond(HttpStatusCode.BadRequest, "Invalid ID")

            val post = postRepository.getById(id) // 특정 ID의 게시글 조회
                ?: return@get call.respond(HttpStatusCode.NotFound, "Post not found")

            call.respond(post) // 찾은 게시글 반환
        }

        put("{id}") {
            val id = call.parameters["id"]?.toIntOrNull() // URL에서 ID 추출
                ?: return@put call.respond(HttpStatusCode.BadRequest, "Invalid ID")

            val post = call.receive<Post>() // 수정할 내용을 Post 객체로 변환
            val updatedPost = postRepository.update(id, post) // 게시글 수정
                ?: return@put call.respond(HttpStatusCode.NotFound, "Post not found")

            call.respond(updatedPost) // 수정된 게시글 반환
        }

        delete("{id}") {
            val id = call.parameters["id"]?.toIntOrNull() // URL에서 ID 추출
                ?: return@delete call.respond(HttpStatusCode.BadRequest, "Invalid ID")

            val deleted = postRepository.delete(id) // 게시글 삭제
            if (deleted) {
                call.respond(HttpStatusCode.NoContent) // 성공 시 204 상태코드
            } else {
                call.respond(HttpStatusCode.NotFound, "Post not found") // 실패 시 404
            }
        }
    }
}