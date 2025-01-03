import React, { useState } from 'react';

const PortfolioDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            // AlphaVantage API 호출 구현 예정
            const mockResults = [
                { symbol: 'AAPL', name: 'Apple Inc.', price: '170.50' },
                { symbol: 'MSFT', name: 'Microsoft Corp.', price: '285.30' }
            ];
            setSearchResults(mockResults);
        } catch (error) {
            console.error('Search error:', error);
        }
        setIsSearching(false);
    };

    const addToPortfolio = (stock) => {
        if (!portfolio.find(item => item.symbol === stock.symbol)) {
            setPortfolio([...portfolio, { ...stock, allocation: 20 }]);
            setSearchResults([]);
            setSearchTerm('');
        }
    };

    return (
        <div className="portfolio-dashboard">
            {/* 검색 섹션 */}
            <div className="search-section">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="주식 심볼 또는 기업명 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        className="search-button"
                        disabled={isSearching}
                    >
                        검색
                    </button>
                </div>

                {/* 검색 결과 */}
                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((result) => (
                            <div
                                key={result.symbol}
                                className="search-result-item"
                                onClick={() => addToPortfolio(result)}
                            >
                                <div className="result-info">
                                    <div className="result-symbol">{result.symbol}</div>
                                    <div className="result-name">{result.name}</div>
                                </div>
                                <div className="result-price">
                                    <span>${result.price}</span>
                                    <button className="add-button">추가</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 포트폴리오 표시 섹션 */}
            <div className="portfolio-grid">
                <div className="portfolio-card">
                    <h2>내 포트폴리오</h2>
                    <div className="portfolio-list">
                        {portfolio.map((stock) => (
                            <div key={stock.symbol} className="portfolio-item">
                                <div className="stock-info">
                                    <span className="stock-symbol">{stock.symbol}</span>
                                    <span className="stock-name">{stock.name}</span>
                                </div>
                                <div className="stock-details">
                                    <span className="stock-price">${stock.price}</span>
                                    <span className="stock-allocation">
                                        {stock.allocation}%
                                    </span>
                                </div>
                            </div>
                        ))}
                        {portfolio.length === 0 && (
                            <div className="empty-portfolio">
                                포트폴리오에 종목을 추가해주세요.
                            </div>
                        )}
                    </div>
                </div>

                <div className="portfolio-card">
                    <h2>관련 뉴스</h2>
                    <div className="news-list">
                        {portfolio.length === 0 ? (
                            <div className="empty-news">
                                포트폴리오에 종목을 추가하면 관련 뉴스가 표시됩니다.
                            </div>
                        ) : (
                            <div className="empty-news">
                                뉴스를 불러오는 중입니다...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioDashboard;