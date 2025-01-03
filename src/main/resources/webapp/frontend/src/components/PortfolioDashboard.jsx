import React, { useState, useEffect } from 'react';

const PortfolioDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // 검색 디바운싱을 위한 타이머
    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            handleSearch();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSearch = async () => {
        if (!searchTerm || searchTerm.length < 2) return;

        setIsSearching(true);
        try {
            const response = await fetch(`/api/stock/search?keywords=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();

            // API 응답 구조에 맞게 파싱
            const matches = data.bestMatches || [];
            const formattedResults = matches.map(match => ({
                symbol: match['1. symbol'],
                name: match['2. name'],
                type: match['3. type'],
                region: match['4. region'],
                marketOpen: match['5. marketOpen'],
                marketClose: match['6. marketClose'],
                timezone: match['7. timezone'],
                currency: match['8. currency'],
            }));

            setSearchResults(formattedResults);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const addToPortfolio = async (stock) => {
        if (portfolio.find(item => item.symbol === stock.symbol)) {
            alert('이미 포트폴리오에 존재하는 종목입니다.');
            return;
        }

        try {
            // 선택된 주식의 현재 가격 정보 가져오기
            const response = await fetch(`/api/stock/daily?symbol=${stock.symbol}`);
            const data = await response.json();

            // 최신 가격 정보 추출
            const latestData = data['Time Series (Daily)'][Object.keys(data['Time Series (Daily)'])[0]];
            const currentPrice = latestData['4. close'];

            const newStock = {
                ...stock,
                price: currentPrice,
                allocation: 0, // 초기 비중은 0%로 설정
                addedAt: new Date().toISOString()
            };

            setPortfolio(prev => [...prev, newStock]);
            setSearchResults([]);
            setSearchTerm('');
        } catch (error) {
            console.error('Error adding stock to portfolio:', error);
            alert('주식 정보를 가져오는데 실패했습니다.');
        }
    };

    return (
        <div className="portfolio-dashboard">
            <div className="search-section">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="주식 심볼 또는 기업명으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isSearching && <div className="search-loading">검색중...</div>}
                </div>

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
                                <div className="result-region">
                                    {result.region} | {result.currency}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
            </div>
        </div>
    );
};

export default PortfolioDashboard;