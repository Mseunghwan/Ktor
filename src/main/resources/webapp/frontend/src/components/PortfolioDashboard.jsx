import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import NewsDashboard from "./NewsDashboard.jsx";

const PortfolioDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMarket, setSelectedMarket] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [purchaseType, setPurchaseType] = useState('shares');
    const [showStockInput, setShowStockInput] = useState(false);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    const handleSearch = useCallback(async () => {
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
    }, [searchTerm, selectedMarket]);

    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(handleSearch, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedMarket, handleSearch]);

    // 주식 선택 핸들러를 상수로 정의
    const handleStockSelection = useCallback((stock) => {
        setSelectedStock(stock);
        setShowStockInput(true);
        setSearchResults([]);
        setSearchTerm('');
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(value);
    };

    const handleQuantitySubmit = async () => {
        if (!selectedStock || !quantity || parseFloat(quantity) <= 0) {
            alert('유효한 수량이나 금액을 입력해야 합니다');
            return;
        }

        try {
            // 임시로 랜덤한 가격 생성 (실제 구현 시에는 API에서 가져와야 함)
            const currentPrice = Math.floor(Math.random() * (100000 - 10000) + 10000);

            if (!currentPrice) {
                throw new Error('현재가 데이터 없음');
            }

            const quantityNum = parseFloat(quantity);
            let totalAmount;
            let finalQuantity;

            if (purchaseType === 'shares') {
                totalAmount = quantityNum * currentPrice;
                finalQuantity = quantityNum;
            } else {
                totalAmount = quantityNum;
                finalQuantity = quantityNum / currentPrice;
            }

            const newStock = {
                ...selectedStock,
                quantity: finalQuantity,
                price: currentPrice,
                totalAmount: totalAmount,
                purchaseType: purchaseType,
            };

            setPortfolio(prev => {
                const existingStockIndex = prev.findIndex(s => s.symbol === newStock.symbol);
                let updatedPortfolio;

                if (existingStockIndex >= 0) {
                    const existingStock = prev[existingStockIndex];
                    const updatedStock = {
                        ...existingStock,
                        quantity: existingStock.quantity + newStock.quantity,
                        totalAmount: existingStock.totalAmount + newStock.totalAmount,
                    };
                    updatedPortfolio = [...prev];
                    updatedPortfolio[existingStockIndex] = updatedStock;
                } else {
                    updatedPortfolio = [...prev, newStock];
                }

                const totalPortfolioAmount = updatedPortfolio.reduce((sum, stock) => sum + stock.totalAmount, 0);
                return updatedPortfolio.map(stock => ({
                    ...stock,
                    percentage: Number(((stock.totalAmount / totalPortfolioAmount) * 100).toFixed(1))
                }));
            });

            setSelectedStock(null);
            setQuantity('');
            setShowStockInput(false);
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || '주식 추가 중 오류가 발생했습니다.');
        }
    };

    const chartData = portfolio.map((stock) => ({
        name: `${stock.symbol} (${stock.percentage}%)`,
        value: stock.percentage
    }));

    return (
        <div className="portfolio-dashboard">
            <div className="hero-section">
                <h1 className="hero-title">포트폴리오 매니저</h1>
                <p className="hero-subtitle">당신의 투자를 스마트하게 관리하세요</p>
            </div>

            <div className="search-glass-card">
                <div className="search-section">
                    <div className="search-container">
                        <select
                            className="market-select glass-effect"
                            value={selectedMarket}
                            onChange={(e) => setSelectedMarket(e.target.value)}
                        >
                            <option value="">모든 시장</option>
                            <option value="KOSPI">KOSPI</option>
                            <option value="NASDAQ">NASDAQ</option>
                            <option value="NYSE">NYSE</option>
                        </select>
                        <div className="search-input-wrapper glass-effect">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="주식 심볼 또는 기업명으로 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {isSearching && <div className="search-loading">검색중...</div>}
                        </div>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="search-results glass-effect">
                            {searchResults.map((result) => (
                                <div
                                    key={result.symbol}
                                    className="search-result-item"
                                    onClick={() => handleStockSelection(result)}
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
                                        <button
                                            className="add-button glass-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStockSelection(result);
                                            }}
                                        >
                                            선택
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="portfolio-container">
                <div className="portfolio-main">
                    {/* Portfolio Overview and Chart Section */}
                    <div className="portfolio-overview glass-card">
                        <div className="portfolio-chart-section">
                            {portfolio.length > 0 ? (
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({name}) => name}
                                                outerRadius={160}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell
                                                        keyㄴ={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip/>
                                            <Legend/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="empty-portfolio glass-effect">
                                    <p>포트폴리오를 구성해보세요</p>
                                    <span>상단의 검색창에서 종목을 검색하고 추가할 수 있습니다</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="portfolio-news">
                    <NewsDashboard portfolio={portfolio}/>
                </div>
            </div>

            {showStockInput && selectedStock && (
                <div className="modal-overlay">
                    <div className="stock-input-modal glass-card">
                        <div className="modal-content">
                            <h3>{selectedStock.symbol} - {selectedStock.name}</h3>
                            <div className="input-controls">
                                <select
                                    value={purchaseType}
                                    onChange={(e) => setPurchaseType(e.target.value)}
                                    className="purchase-type-select glass-effect"
                                >
                                    <option value="shares">주식 수량 (주)</option>
                                    <option value="amount">투자 금액 (원)</option>
                                </select>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder={purchaseType === 'shares' ? '보유 주식 수' : '투자 금액'}
                                    className="quantity-input glass-effect"
                                />
                                <div className="button-group">
                                    <button onClick={handleQuantitySubmit}
                                            className="confirm-button glass-button">
                                        확인
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowStockInput(false);
                                            setSelectedStock(null);
                                        }}
                                        className="cancel-button glass-button"
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="portfolio-details glass-card">
                <h2>보유 종목 상세</h2>
                <div className="portfolio-items">
                    {portfolio.map((stock) => (
                        <div key={stock.symbol} className="portfolio-item glass-effect">
                            <div className="stock-info">
                                <span className="stock-symbol">{stock.symbol}</span>
                                <span className="stock-name">{stock.name}</span>
                            </div>
                            <div className="stock-details">
                                <span className="stock-quantity">
                                    {stock.purchaseType === 'shares'
                                        ? `${stock.quantity.toFixed(2)}주 (${formatCurrency(stock.totalAmount)})`
                                        : formatCurrency(stock.totalAmount)}
                                </span>
                                <span className="stock-percentage">{stock.percentage}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PortfolioDashboard;