// src/App.jsx
import { useState, useEffect } from 'react'
import PortfolioDashboard from './components/PortfolioDashboard'
import PostList from './components/PostList'
import PostModal from './components/PostModal'
import './styles/style.css'

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const response = await fetch('/api/posts');
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    };

    return (
        <div className="app">
            <nav className="main-nav">
                <div className="nav-container">
                    <h1 className="nav-title">Portfolio Analysis</h1>
                    <div className="nav-links">
                        <a href="#portfolio">포트폴리오</a>
                        <a href="#community">커뮤니티</a>
                    </div>
                </div>
            </nav>

            <main>
                <section id="portfolio" className="hero-section">
                    <PortfolioDashboard />
                </section>

                <section id="community" className="community-section">
                    <div className="section-header">
                        <h2>커뮤니티</h2>
                        <button
                            className="new-post-button"
                            onClick={() => setIsModalOpen(true)}
                        >
                            새 글 작성
                        </button>
                    </div>
                    <PostList posts={posts} onPostsChange={loadPosts} />
                </section>
            </main>

            <PostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPostCreated={loadPosts}
            />

            <footer className="main-footer">
                <div className="footer-content">
                    <p>© 2024 Stock Portfolio. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
export default App;