import React, { useState, useEffect } from 'react';

const PortfolioDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMarket, setSelectedMarket] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            handleSearch();
        }, 300); // 디바운스 시간을 300ms로 조정

        return () => clearTimeout(timer);
    }, [searchTerm, selectedMarket]);

    const handleSearch = async () => {
        if (!searchTerm || searchTerm.length < 2) return;

        setIsSearching(true);
        try {
            const url = `/api/stock/search?keywords=${encodeURIComponent(searchTerm)}${
                selectedMarket ? `&market=${selectedMarket}` : ''
            }`;
            const response = await fetch(url);
            const data = await response.json();

            setSearchResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const addToPortfolio = async (stock) => {
        if (portfolio.find(item => item.symbol === stock.symbol)) {
            alert('이미 포트폴리오에 존재하는 종목입니다.');
            return;
        }

        const newStock = {
            ...stock,
            allocation: 0,
            addedAt: new Date().toISOString()
        };

        setPortfolio(prev => [...prev, newStock]);
        setSearchResults([]);
        setSearchTerm('');
    };

    return (
        <div className="portfolio-dashboard">
            <div className="search-section">
                <div className="search-container">
                    <select
                        className="market-select"
                        value={selectedMarket}
                        onChange={(e) => setSelectedMarket(e.target.value)}
                    >
                        <option value="">모든 시장</option>
                        <option value="KOSPI">KOSPI</option>
                        <option value="NASDAQ">NASDAQ</option>
                        <option value="NYSE">NYSE</option>
                    </select>
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
                                    {result.sector && (
                                        <div className="result-sector">{result.sector}</div>
                                    )}
                                </div>
                                <div className="result-details">
                                    <span className="stock-market">{result.market}</span>
                                    <button className="add-button">추가</button>
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
                                    <span className="stock-market">{stock.market}</span>
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