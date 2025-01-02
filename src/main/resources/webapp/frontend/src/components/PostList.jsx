// src/components/PostList.jsx
import React, { useEffect } from 'react';

const PostList = ({ posts, onPostsChange }) => {
    useEffect(() => {
        onPostsChange();
    }, []);

    const deletePost = async (postId) => {
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                onPostsChange();
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    return (
        <div className="posts-table">
            <table>
                <thead>
                <tr>
                    <th>id</th>
                    <th>title</th>
                    <th>content</th>
                    <th>author</th>
                    <th>createdAt</th>
                    <th>관리</th>
                </tr>
                </thead>
                <tbody>
                {posts.map(post => (
                    <tr key={post.id}>
                        <td>{post.id}</td>
                        <td>{post.title}</td>
                        <td>{post.content}</td>
                        <td>{post.author}</td>
                        <td>{new Date(post.created_at).toLocaleString()}</td>
                        <td>
                            <button
                                className="delete-button"
                                onClick={() => deletePost(post.id)}
                            >
                                삭제
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default PostList;