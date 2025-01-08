import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { ExternalLink, Calendar, Globe, TrendingUp, TrendingDown } from 'lucide-react';
import _ from 'lodash';

const NewsDashboard = ({ portfolio }) => {
    const [news, setNews] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedStock, setSelectedStock] = useState('all');
    const [dateRange, setDateRange] = useState(7);
    const observer = useRef();
    const ITEMS_PER_PAGE = 10;

    const getPortfolioPercentage = (article) => {
        if (!article.companies || !portfolio) return 0;

        const relevantCompany = article.companies.find(company =>
            portfolio.some(stock => stock.symbol === company.symbol)
        );

        if (!relevantCompany) return 0;

        const portfolioStock = portfolio.find(stock => stock.symbol === relevantCompany.symbol);
        return portfolioStock?.percentage || 0;
    };

    const getImportanceBackground = (importance, article) => {
        const percentage = getPortfolioPercentage(article);
        if (percentage > 20) return 'bg-red-50 dark:bg-red-900/10';
        if (percentage > 10) return 'bg-orange-50 dark:bg-orange-900/10';
        return '';
    };

    const getSentimentBadge = (sentiment) => {
        switch(sentiment) {
            case 'positive':
                return (
                    <span className="flex items-center text-green-600 dark:text-green-400">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        긍정적
                    </span>
                );
            case 'negative':
                return (
                    <span className="flex items-center text-red-600 dark:text-red-400">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        부정적
                    </span>
                );
            default:
                return null;
        }
    };

    const formatDate = (dateStr) => {
        try {
            const date = parseISO(dateStr);
            return format(date, 'yyyy-MM-dd HH:mm');
        } catch (e) {
            console.error('Date parsing error:', e);
            return dateStr;
        }
    };

    const lastNewsElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        const fetchNews = async () => {
            if (!portfolio || portfolio.length === 0) {
                setNews([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const endDate = new Date();
                const startDate = subDays(endDate, dateRange);

                const formatApiDate = (date) => format(date, 'yyyy-MM-dd');

                const newsRequests = [];
                const domesticStocks = portfolio.filter(stock => stock.market === 'KOSPI' || stock.market === 'KOSDAQ');
                const globalStocks = portfolio.filter(stock => stock.market === 'NYSE' || stock.market === 'NASDAQ');

                if (domesticStocks.length > 0) {
                    const domesticSymbols = domesticStocks.map(stock => `KRX:${stock.symbol}`).join(',');
                    newsRequests.push(
                        fetch(`/api/news/domestic?symbols=${domesticSymbols}&date_from=${formatApiDate(startDate)}&date_to=${formatApiDate(endDate)}`)
                            .then(res => res.json())
                    );
                }

                if (globalStocks.length > 0) {
                    const chunks = _.chunk(globalStocks, 3); // 3개씩 나누어 요청
                    const globalRequests = chunks.map(chunk => {
                        const symbols = chunk.map(stock => `${stock.market}:${stock.symbol}`).join(',');
                        return fetch(`/api/news/global?symbols=${symbols}&date_from=${formatApiDate(startDate)}&date_to=${formatApiDate(endDate)}`)
                            .then(res => res.json());
                    });
                    newsRequests.push(...globalRequests);
                }

                const results = await Promise.all(newsRequests);
                const allNews = results.flatMap(result => result);
                setNews(allNews);
                console.log("Fetched news:", allNews);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('뉴스를 불러오는 중 오류가 발생했습니다: ' + err.message);
                setLoading(false);
            }
        };

        fetchNews();
    }, [portfolio, dateRange]);

    useEffect(() => {
        let filtered = [...news];

        if (selectedStock !== 'all') {
            filtered = filtered.filter(article =>
                article.companies?.some(company => company.symbol === selectedStock)
            );
        }

        const cutoffDate = subDays(new Date(), dateRange);
        filtered = filtered.filter(article => {
            const articleDate = parseISO(article.date);
            return articleDate >= cutoffDate;
        });

        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        setFilteredNews(filtered.slice(0, page * ITEMS_PER_PAGE));
        setHasMore(filtered.length > page * ITEMS_PER_PAGE);
    }, [news, selectedStock, dateRange, page]);

    if (loading && page === 1) {
        return (
            <div className="news-dashboard backdrop-blur-lg bg-white/80 dark:bg-black/80 rounded-3xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-800/50">
                <div className="flex items-center justify-center h-64">
                    <div className="search-loading"></div>
                    <span className="ml-3">뉴스를 불러오는 중...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="news-dashboard backdrop-blur-lg bg-white/80 dark:bg-black/80 rounded-3xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-800/50">
                <div className="text-red-500 p-4">{error}</div>
            </div>
        );
    }

    return (
        <div className="news-dashboard backdrop-blur-lg bg-white/80 dark:bg-black/80 rounded-3xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    포트폴리오 관련 뉴스
                </h2>
                <div className="flex space-x-3">
                    <select
                        className="px-4 py-2 rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={selectedStock}
                        onChange={(e) => setSelectedStock(e.target.value)}
                    >
                        <option value="all">전체 종목</option>
                        {portfolio.map(stock => (
                            <option key={stock.symbol} value={stock.symbol}>
                                {stock.name} ({stock.symbol})
                            </option>
                        ))}
                    </select>

                    <select
                        className="px-4 py-2 rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={dateRange}
                        onChange={(e) => setDateRange(Number(e.target.value))}
                    >
                        <option value={1}>오늘</option>
                        <option value={7}>최근 7일</option>
                        <option value={30}>최근 30일</option>
                        <option value={90}>최근 90일</option>
                    </select>
                </div>
            </div>

            {filteredNews.length === 0 ? (
                <div className="empty-news text-center py-12">
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">관련 뉴스가 없습니다</p>
                    <span className="text-gray-500 dark:text-gray-400">포트폴리오에 주식을 추가하면 관련 뉴스가 표시됩니다</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredNews.map((article, index) => {
                        const isLastElement = index === filteredNews.length - 1;
                        return (
                            <div
                                key={index}
                                ref={isLastElement ? lastNewsElementRef : null}
                                className={`
                                    relative overflow-hidden
                                    bg-white/40 dark:bg-black/40 backdrop-blur-md
                                    rounded-2xl p-6 mb-4
                                    border border-gray-200/50 dark:border-gray-800/50
                                    transition-all duration-300
                                    hover:transform hover:-translate-y-1
                                    hover:shadow-lg
                                    ${getImportanceBackground(article.importance, article)}
                                `}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <a
                                            href={article.content_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group inline-flex items-center"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors">
                                                {article.title}
                                            </h3>
                                            <ExternalLink className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>

                                        {article.importance === 'high' && (
                                            <div className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                포트폴리오 비중 {getPortfolioPercentage(article).toFixed(1)}% • 중요
                                            </div>
                                        )}

                                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{article.summary}</p>

                                        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {formatDate(article.date)}
                                            </span>
                                            <span className="flex items-center">
                                                <Globe className="w-4 h-4 mr-1" />
                                                {article.source}
                                            </span>
                                            {getSentimentBadge(article.sentiment)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {loading && (
                        <div className="flex justify-center py-4">
                            <div className="search-loading"></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NewsDashboard;