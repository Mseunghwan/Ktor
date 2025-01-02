// src/components/PortfolioSection.jsx
import React from 'react';

const PortfolioSection = () => {
    const stocks = [
        { symbol: 'AAPL', name: 'Apple Inc.' },
        { symbol: 'MSFT', name: 'Microsoft' },
        { symbol: 'GOOGL', name: 'Alphabet' },
        // 더 많은 주식 추가
    ];

    return (
        <section className="portfolio-section">
            <h2 className="section-title">포트폴리오 종목 선택</h2>
            <div className="stock-grid">
                {stocks.map((stock) => (
                    <div key={stock.symbol} className="stock-card">
                        <h3>{stock.name}</h3>
                        <p>{stock.symbol}</p>
                        <button className="select-button">선택</button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PortfolioSection;