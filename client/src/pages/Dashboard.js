import API_URL from '../config';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const { token, logout } = useContext(AuthContext);

    const [portfolio, setPortfolio] = useState([]);
    const [stockData, setStockData] = useState({});
    const [symbol, setSymbol] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [shares, setShares] = useState('');
    const [buyPrice, setBuyPrice] = useState('');
    const [chartData, setChartData] = useState({});
    const [selectedStock, setSelectedStock] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTimer, setSearchTimer] = useState(null);
    const [news, setNews] = useState({});

    useEffect(() => {
        fetchPortfolio();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);;


    const fetchNews = async (symbol) => {
        try {
            const response = await axios.get(`${API_URL}/api/stocks/news/${symbol}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNews(prev => ({ ...prev, [symbol]: response.data }));
        } catch (err) {
            console.log('Error fetching news');
        }
    };

    const fetchPortfolio = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/portfolio`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPortfolio(response.data);
            setLoading(false);

            response.data.forEach(item => {
                fetchStockData(item.symbol);
            });

            response.data.forEach((item, index) => {
                setTimeout(() => {
                    fetchChartData(item.symbol);
                }, (index + 1) * 12000);
            });

            response.data.forEach((item, index) => {
                setTimeout(() => {
                    fetchNews(item.symbol);
                }, (index + 1) * 3000);
            });

        } catch (err) {
            setError('Error fetching portfolio');
            setLoading(false);
        }
    };

    const fetchStockData = async (symbol) => {
        try {
            const response = await axios.get(`${API_URL}/api/stocks/${symbol}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStockData(prev => ({ ...prev, [symbol]: response.data['Global Quote'] }));
        } catch (err) {
            setError('Error fetching stock data');
        }
    };

    const fetchChartData = async (symbol) => {
        try {
            const response = await axios.get(`${API_URL}/api/stocks/history/${symbol}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChartData(prev => ({ ...prev, [symbol]: response.data }));
        } catch (err) {
            console.log('Error fetching chart data');
        }
    };

    const addStock = async () => {
        const upperSymbol = symbol.toUpperCase();
        try {
            await axios.post(`${API_URL}/api/portfolio`,
                { symbol: upperSymbol, shares, buyPrice },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchPortfolio();
            await fetchStockData(upperSymbol);
            setSymbol('');
            setShares('');
            setBuyPrice('');
            setError('');
        } catch (err) {
            setError('Error adding stock');
        }
    };

    const removeStock = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/portfolio/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchPortfolio();
        } catch (err) {
            setError('Error removing stock');
        }
    };

    const searchStocks = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
        try {
            const response = await axios.get(`${API_URL}/stocks/search/${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data && response.data.length > 0) {
                setSearchResults(response.data);
                setShowDropdown(true);
            }
        } catch (err) {
            console.log('Search error');
        }
    };

    if (loading) return <div>Loading...</div>;

    const totalCurrentValue = portfolio.reduce((total, item) => {
        const currentPrice = parseFloat(stockData[item.symbol]?.['05. price']) || 0;
        return total + (currentPrice * item.shares);
    }, 0);

    const totalStartValue = portfolio.reduce((total, item) => {
        const oldPrice = chartData[item.symbol]?.[0]?.price || 0;
        return total + (oldPrice * item.shares);
    }, 0);

    const monthlyChange = totalStartValue > 0
        ? (((totalCurrentValue - totalStartValue) / totalStartValue) * 100).toFixed(2)
        : 0;

    const monthlyChangeAmount = (totalCurrentValue - totalStartValue).toFixed(2);

    return (
        <div>
            {/* Header */}
            <div>
                <h1>Stock Portfolio Tracker</h1>
                <button onClick={logout}>Logout</button>
            </div>
            {/* Portfolio Value */}
            <div>
                <p>Portfolio Value</p>
                <h2>₹{totalCurrentValue.toFixed(2)}</h2>
                <p style={{ color: monthlyChange >= 0 ? 'green' : 'red' }}>
                    {monthlyChange >= 0 ? '↑' : '↓'} {monthlyChange}% &nbsp;
                    ₹{monthlyChangeAmount} this month
                </p>
            </div>
            {/* Add Stock Form */}
            <div>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Symbol (e.g. RELIANCE.BSE)"
                        value={symbol}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSymbol(value.toUpperCase());
                            if (searchTimer) clearTimeout(searchTimer);
                            const timer = setTimeout(() => {
                                searchStocks(value);
                            }, 800);
                            setSearchTimer(timer);
                        }}
                    />
                    {showDropdown && searchResults.length > 0 && (
                        <div style={{
                            border: '1px solid #ccc',
                            position: 'absolute',
                            background: 'white',
                            zIndex: 100,
                            width: '100%'
                        }}>
                            {searchResults.map((result) => (
                                <div
                                    key={result['1. symbol']}
                                    style={{ padding: '8px', cursor: 'pointer' }}
                                    onClick={() => {
                                        setSymbol(result['1. symbol']);
                                        setShowDropdown(false);
                                    }}
                                >
                                    <strong>{result['1. symbol']}</strong> — {result['2. name']} ({result['4. region']})
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <input
                    type="number"
                    placeholder="Shares"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Buy Price"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                />
                <button onClick={addStock}>Add Stock</button>
            </div>

            {/* Error message */}
            {error && <p>{error}</p>}

            {/* Portfolio List */}
            <div>
                {portfolio.map((item) => (
                    <div key={item._id}>
                        <h3>{item.symbol}</h3>
                        <p>Shares: {item.shares}</p>
                        <p>Buy Price: ₹{item.buyPrice}</p>
                        <p>Current Price: ₹{stockData[item.symbol]?.['05. price'] || 'Loading...'}</p>
                        <p>Change: {stockData[item.symbol]?.['10. change percent'] || '...'}</p>
                        <p>Gain/Loss: ₹{(
                            (parseFloat(stockData[item.symbol]?.['05. price']) - item.buyPrice)
                            * item.shares
                        ).toFixed(2) || '...'}</p>
                        <button onClick={() => removeStock(item._id)}>Remove</button>
                        {selectedStock === item.symbol && chartData[item.symbol] && (
                            <div style={{ width: '100%', height: 200 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData[item.symbol]}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#3b82f6"
                                            dot={false}
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        <button onClick={() => setSelectedStock(
                            selectedStock === item.symbol ? null : item.symbol
                        )}>
                            {selectedStock === item.symbol ? 'Hide Chart' : 'Show Chart'}
                        </button>

                        {/* News */}
                        {news[item.symbol] && news[item.symbol].length > 0 && (
                            <div>
                                <h4>Latest News</h4>
                                {news[item.symbol].map((article, index) => (
                                    <div key={index}>
                                        <a href={article.url} target="_blank" rel="noreferrer">
                                            <img src={article.urlToImage} alt={article.title} width="60" />
                                            <strong>{article.title}</strong>
                                        </a>
                                        <p>{article.description}</p>
                                        <small>{new Date(article.publishedAt).toLocaleDateString()}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;