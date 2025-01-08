import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const NewsDashboard = ({ portfolio }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            if (!portfolio || portfolio.length === 0) {
                setNews([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // 국내/해외 주식 분리
                const domesticStocks = portfolio.filter(stock => stock.market === 'KOSPI' || stock.market === 'KOSDAQ')
                    .map(stock => `KRX:${stock.symbol}`);
                const globalStocks = portfolio.filter(stock => stock.market === 'NYSE' || stock.market === 'NASDAQ')
                    .map(stock => `${stock.market}:${stock.symbol}`);

                const today = format(new Date(), 'yyyy-MM-dd');

                // 국내 주식 뉴스 요청
                if (domesticStocks.length > 0) {
                    const domesticResponse = await fetch(`/api/news/domestic?symbols=${domesticStocks.join(',')}&date=${today}`);
                    const domesticData = await domesticResponse.json();
                    setNews(prev => [...prev, ...domesticData]);
                }

                // 해외 주식 뉴스 요청
                if (globalStocks.length > 0) {
                    const globalResponse = await fetch(`/api/news/global?symbols=${globalStocks.join(',')}&date=${today}`);
                    const globalData = await globalResponse.json();
                    setNews(prev => [...prev, ...globalData]);
                }

                setLoading(false);
            } catch (err) {
                setError('뉴스를 불러오는 중 오류가 발생했습니다.');
                setLoading(false);
            }
        };

        fetchNews();
    }, [portfolio]);

    if (loading) {
        return (
            <div className="news-dashboard glass-card">
                <div className="flex items-center justify-center h-64">
                    <div className="search-loading"></div>
                    <span className="ml-3">뉴스를 불러오는 중...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="news-dashboard glass-card">
                <div className="text-red-500 p-4">{error}</div>
            </div>
        );
    }

    if (!news || news.length === 0) {
        return (
            <div className="news-dashboard glass-card">
                <div className="empty-news">
                    <p>관련 뉴스가 없습니다</p>
                    <span>포트폴리오에 주식을 추가하면 관련 뉴스가 표시됩니다</span>
                </div>
            </div>
        );
    }

    return (
        <div className="news-dashboard glass-card">
            <h2 className="text-2xl font-semibold mb-4">포트폴리오 관련 뉴스</h2>
            <div className="news-list space-y-4">
                {news.map((article, index) => (
                    <div key={index} className="news-item glass-effect p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">{article.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{format(new Date(article.date), 'yyyy-MM-dd HH:mm')}</span>
                            <span>{article.source}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsDashboard;