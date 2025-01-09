import React, { useState, useEffect } from 'react';
import {format, parseISO, subDays} from 'date-fns';
import { ChevronDown } from 'lucide-react';

const NewsDashboard = ({ portfolio }) => {
    const [news, setNews] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStock, setSelectedStock] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 20;

    const formatDate = (dateStr) => {
        try {
            const date = parseISO(dateStr);
            return format(date, 'yyyy-MM-dd HH:mm');
        } catch (e) {
            console.error('Date parsing error:', e);
            return dateStr;
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (selectedStock === 'all') {
            setFilteredNews(news.slice(0, page * PAGE_SIZE));
            setHasMore(news.length > page * PAGE_SIZE);
        } else {
            const filtered = news.filter(article =>
                article.companies?.some(company => company.symbol === selectedStock)
            );
            setFilteredNews(filtered.slice(0, page * PAGE_SIZE));
            setHasMore(filtered.length > page * PAGE_SIZE);
        }
    }, [news, selectedStock, page]);

    useEffect(() => {
        const fetchNews = async () => {
            if (!portfolio || portfolio.length === 0) {
                setNews([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const today = format(subDays(new Date(), 1), 'yyyy-MM-dd');
                const allNews = [];

                const domesticStocks = portfolio.filter(stock => stock.market === 'KOSPI' || stock.market === 'KOSDAQ');
                const globalStocks = portfolio.filter(stock => stock.market === 'NYSE' || stock.market === 'NASDAQ');

                // 국내 주식 뉴스 요청
                if (domesticStocks.length > 0) {
                    const domesticSymbols = domesticStocks.map(stock => `KRX:${stock.symbol}`).join(',');
                    console.log("Fetching news for domestic stocks:", domesticSymbols);
                    const response = await fetch(`/api/news/domestic?symbols=${domesticSymbols}&date=${today}&page=${page}&size=100`);
                    if (!response.ok) throw new Error(`Domestic API Error: ${response.statusText}`);
                    const data = await response.json();
                    allNews.push(...data);
                }

                // 해외 주식 뉴스 요청 - 종목별로 개별 요청
                if (globalStocks.length > 0) {
                    const globalNewsPromises = globalStocks.map(stock => {
                        const symbol = `${stock.market}:${stock.symbol}`;
                        console.log("Fetching news for global stock:", symbol);
                        return fetch(`/api/news/global?symbols=${symbol}&date=${today}&page=${page}&size=100`)
                            .then(res => res.json())
                            .catch(err => {
                                console.error(`Error fetching news for ${symbol}:`, err);
                                return [];
                            });
                    });

                    const globalNewsResults = await Promise.all(globalNewsPromises);
                    globalNewsResults.forEach(result => {
                        if (Array.isArray(result)) {
                            allNews.push(...result);
                        }
                    });
                }

                // 중복 제거 및 날짜순 정렬
                const uniqueNews = Array.from(new Map(allNews.map(item => [item.title, item])).values());
                const sortedNews = uniqueNews.sort((a, b) => new Date(b.date) - new Date(a.date));

                console.log("All fetched news:", sortedNews);
                setNews(sortedNews);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('뉴스를 불러오는 중 오류가 발생했습니다: ' + err.message);
                setLoading(false);
            }
        };

        fetchNews();
    }, [portfolio]);

    if (loading && page === 1) {
        return (
            <div className="news-dashboard backdrop-blur-lg bg-white/80 rounded-3xl p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="search-loading"></div>
                    <span className="ml-3">뉴스를 불러오는 중...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="news-dashboard backdrop-blur-lg bg-white/80 rounded-3xl p-8">
                <div className="text-red-500 p-4">{error}</div>
            </div>
        );
    }

    return (
        <div className="news-dashboard">
            <div className="news-header">
                <h2 className="news-title-gradient">관련 뉴스</h2>
                <div className="news-select">
                    <select
                        value={selectedStock}
                        onChange={(e) => {
                            setSelectedStock(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">전체 종목</option>
                        {portfolio.map(stock => (
                            <option key={stock.symbol} value={stock.symbol}>
                                {stock.name} ({stock.symbol})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="news-list">
                {filteredNews.map((article, index) => (
                    <div key={index} className="news-item">
                        <a href={article.content_url}
                           target="_blank"
                           rel="noopener noreferrer">
                            <h3 className="news-title">{article.title}</h3>
                            <p className="news-summary">{article.summary}</p>
                            <div className="news-meta">
                                <span>{formatDate(article.date)}</span>
                                <span>{article.source}</span>
                            </div>
                        </a>
                    </div>
                ))}

                {hasMore && (
                    <div className="load-more">
                        <button onClick={loadMore} className="load-more-button">
                            더 보기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsDashboard;