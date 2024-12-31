package com.example.models

import java.time.LocalDateTime

// 모델
data class Post(
    val id: Int = 0,
    val title: String,
    val content: String,
    val author: String,
)