import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

const NewsDashboard = ({ portfolio }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 날짜 포맷팅 헬퍼 함수
    const formatDate = (dateStr) => {
        try {
            // published_at이 ISO 형식인 경우
            const date = parseISO(dateStr);
            return format(date, 'yyyy-MM-dd HH:mm');
        } catch (e) {
            console.error('Date parsing error:', e);
            return dateStr; // 파싱 실패시 원본 문자열 반환
        }
    };

    useEffect(() => {
        const fetchNews = async () => {
            if (!portfolio || portfolio.length === 0) {
                setNews([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const today = format(new Date(), 'yyyy-MM-dd');
                const allNews = [];

                // 국내/해외 주식 분리
                const domesticStocks = portfolio.filter(stock => stock.market === 'KOSPI' || stock.market === 'KOSDAQ');
                const globalStocks = portfolio.filter(stock => stock.market === 'NYSE' || stock.market === 'NASDAQ');

                // 국내 주식 뉴스 요청
                if (domesticStocks.length > 0) {
                    const domesticSymbols = domesticStocks.map(stock => `KRX:${stock.symbol}`).join(',');
                    console.log("Fetching news for domestic stocks:", domesticSymbols);
                    const response = await fetch(`/api/news/domestic?symbols=${domesticSymbols}&date=${today}`);
                    if (!response.ok) throw new Error(`Domestic API Error: ${response.statusText}`);
                    const data = await response.json();
                    allNews.push(...data);
                }

                // 해외 주식 뉴스 요청
                if (globalStocks.length > 0) {
                    const globalSymbols = globalStocks.map(stock => `${stock.market}:${stock.symbol}`).join(',');
                    console.log("Fetching news for global stocks:", globalSymbols);
                    const response = await fetch(`/api/news/global?symbols=${globalSymbols}&date=${today}`);
                    if (!response.ok) throw new Error(`Global API Error: ${response.statusText}`);
                    const data = await response.json();
                    allNews.push(...data);
                }

                console.log("All fetched news:", allNews);
                setNews(allNews);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('뉴스를 불러오는 중 오류가 발생했습니다: ' + err.message);
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
                {news.map((article, index) => {
                    // 각 뉴스 항목에 대한 날짜 처리를 별도로 수행
                    const formattedDate = formatDate(article.date);
                    return (
                        <div key={index} className="news-item glass-effect p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-2">{article.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>{formattedDate}</span>
                                <span>{article.source}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NewsDashboard;