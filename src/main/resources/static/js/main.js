document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
});
// Modal functionality
function showModal() {
    document.getElementById('postModal').classList.add('show');
}

function hideModal() {
    document.getElementById('postModal').classList.remove('show');
}

// Form submission
function submitPost(event) {
    event.preventDefault();
    // Add your form submission logic here
    hideModal();
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == document.getElementById('postModal')) {
        hideModal();
    }
}

// 폼 제출 처리 부분을 수정
document.getElementById('postForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const postData = {
        title: document.getElementById('title').value,
        content: document.getElementById('content').value,
        author: document.getElementById('author').value
    };

    fetch('/api/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json().catch(() => {}); // JSON 파싱 실패를 무시
        })
        .then(() => {
            // 폼 초기화
            document.getElementById('title').value = '';
            document.getElementById('content').value = '';
            document.getElementById('author').value = '';

            // 게시글 목록 새로고침
            loadPosts();
        })
        .catch(error => {
            console.error('Error:', error);
            // 에러가 발생해도 목록을 새로고침
            loadPosts();
        });
});

// loadPosts 함수 수정
function loadPosts() {
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            const tbody = document.getElementById('postsBody');
            tbody.innerHTML = ''; // 테이블 초기화
            if (posts && Array.isArray(posts)) {
                posts.forEach(post => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${post.id}</td>
                        <td>${post.title}</td>g
                        <td>${post.content}</td>
                        <td>${post.author}</td>
                        <td>
                            <button class="delete-button" data-id="${post.id}">삭제</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

                // 삭제 버튼에 이벤트 리스너 추가
                const deleteButtons = document.querySelectorAll('.delete-button');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', function () {
                        const postId = this.getAttribute('data-id'); // 데이터 ID 가져오기
                        deletePost(postId); // 게시글 삭제 함수 호출
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error loading posts:', error);
        });
}

// 게시글 삭제 함수 추가
function deletePost(postId) {
    fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                loadPosts(); // 삭제 후 목록 새로고침
            } else {
                throw new Error('Failed to delete post');
            }
        })
        .catch(error => {
            console.error('Error deleting post:', error);
        });
}

// 조회하기 버튼 클릭 이벤트 추가
document.getElementById('check').addEventListener('click', function () {
    loadPosts(); // 버튼 클릭 시 loadPosts 함수 호출
});
