// 폼 제출 처리 부분을 수정
document.getElementById('postForm').addEventListener('submit', function(e) {
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

// loadPosts 함수도 수정
function loadPosts() {
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            const tbody = document.getElementById('postsBody');
            tbody.innerHTML = '';
            if (posts && Array.isArray(posts)) {
                posts.forEach(post => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${post.id}</td>
                        <td>${post.title}</td>
                        <td>${post.author}</td>
                        <td>${post.content}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        })
        .catch(error => {
            console.error('Error loading posts:', error);
        });
}