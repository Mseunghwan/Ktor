// src/components/PostModal.jsx
import React, { useState, useEffect } from 'react';

const PostModal = ({ isOpen, onClose, onPostCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        author: ''
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await onPostCreated(); // 게시글 목록 새로고침
                setFormData({ title: '', content: '', author: '' });
                onClose();
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal show" onClick={(e) => {
            if (e.target.className === 'modal show') {
                onClose();
            }
        }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>새 글 작성</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="title">제목</label>
                        <input
                            id="title"
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="content">내용</label>
                        <textarea
                            id="content"
                            placeholder="내용을 입력하세요"
                            rows="5"
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="author">작성자</label>
                        <input
                            id="author"
                            type="text"
                            placeholder="작성자 이름을 입력하세요"
                            value={formData.author}
                            onChange={(e) => setFormData({...formData, author: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">작성하기</button>
                </form>
            </div>
        </div>
    );
};

export default PostModal;