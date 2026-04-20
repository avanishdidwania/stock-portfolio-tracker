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
    const [compareSymbol, setCompareSymbol] = useState('');
    const [compareData, setCompareData] = useState(null);
    const [watchlist, setWatchlist] = useState([]);
    const [watchlistSymbol, setWatchlistSymbol] = useState('');
    const [watchlistData, setWatchlistData] = useState({});

    useEffect(() => {
        fetchPortfolio();
        fetchWatchlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);;

    const fetchWatchlist = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/watchlist`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setWatchlist(response.data);
        
        // stagger watchlist stock calls after portfolio calls
        response.data.forEach((item, index) => {
            setTimeout(() => {
                fetchWatchlistStockData(item.symbol);
            }, (index + 2) * 13000); // starts after portfolio calls
        });
    } catch (err) {
        console.log('Error fetching watchlist');
    }
};

    const fetchWatchlistStockData = async (symbol) => {
        try {
            const response = await axios.get(`${API_URL}/api/stocks/${symbol}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWatchlistData(prev => ({ ...prev, [symbol]: response.data['Global Quote'] }));
        } catch (err) {
            console.log('Error fetching watchlist stock data');
        }
    };

    const addToWatchlist = async () => {
        try {
            await axios.post(`${API_URL}/api/watchlist`,
                { symbol: watchlistSymbol.toUpperCase() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchWatchlist();
            setWatchlistSymbol('');
        } catch (err) {
            setError('Error adding to watchlist');
        }
    };

    const removeFromWatchlist = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/watchlist/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchWatchlist();
        } catch (err) {
            setError('Error removing from watchlist');
        }
    };

    const fetchCompareStock = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/stocks/${compareSymbol}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompareData(response.data['Global Quote']);
        } catch (err) {
            setError('Error fetching comparison stock');
        }
    };

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

        // stagger stock data calls
        response.data.forEach((item, index) => {
            setTimeout(() => {
                fetchStockData(item.symbol);
            }, index * 13000); // 13 second gap
        });

        response.data.forEach((item, index) => {
            setTimeout(() => {
                fetchChartData(item.symbol);
            }, (index + 1) * 15000);
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
        console.log('Searching for:', query); // add this
        const response = await axios.get(`${API_URL}/api/stocks/search/${query}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Search response:', response.data); // add this
        if (response.data && response.data.length > 0) {
            setSearchResults(response.data);
            setShowDropdown(true);
        }
    } catch (err) {
        console.log('Search error:', err);
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

    const assetPerformance = portfolio.map(item => {
        const currentPrice = parseFloat(stockData[item.symbol]?.['05. price']) || 0;
        const currentValue = currentPrice * item.shares;
        const investedValue = item.buyPrice * item.shares;
        const gainLoss = currentValue - investedValue;
        const gainLossPercent = investedValue > 0 ? ((gainLoss / investedValue) * 100).toFixed(2) : 0;
        const allocation = totalCurrentValue > 0 ? ((currentValue / totalCurrentValue) * 100).toFixed(2) : 0;

        return {
            symbol: item.symbol,
            shares: item.shares,
            currentValue: currentValue.toFixed(2),
            investedValue: investedValue.toFixed(2),
            gainLoss: gainLoss.toFixed(2),
            gainLossPercent,
            allocation
        };
    });

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
            {/* Asset Performance Table */}
            <div>
                <h3>Asset Performance</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Asset</th>
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Allocation</th>
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Invested</th>
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Current Value</th>
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Gain/Loss</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assetPerformance.map((asset) => (
                            <tr key={asset.symbol}>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{asset.symbol}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{asset.allocation}%</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>₹{asset.investedValue}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>₹{asset.currentValue}</td>
                                <td style={{
                                    padding: '8px',
                                    borderBottom: '1px solid #eee',
                                    color: asset.gainLoss >= 0 ? 'green' : 'red'
                                }}>
                                    {asset.gainLoss >= 0 ? '+' : ''}₹{asset.gainLoss} ({asset.gainLossPercent}%)
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Stock Comparison */}
            <div>
                <h3>Stock Comparison</h3>
                <div>
                    <input
                        type="text"
                        placeholder="Enter symbol to compare (e.g. TCS.BSE)"
                        value={compareSymbol}
                        onChange={(e) => setCompareSymbol(e.target.value.toUpperCase())}
                    />
                    <button onClick={fetchCompareStock}>Compare</button>
                </div>

                {compareData && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Symbol</th>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Price</th>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Change</th>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Change %</th>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>High</th>
                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Low</th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolio.map(item => (
                                stockData[item.symbol] && (
                                    <tr key={item.symbol}>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.symbol}</td>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>₹{stockData[item.symbol]['05. price']}</td>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #eee', color: parseFloat(stockData[item.symbol]['09. change']) >= 0 ? 'green' : 'red' }}>
                                            {stockData[item.symbol]['09. change']}
                                        </td>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{stockData[item.symbol]['10. change percent']}</td>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>₹{stockData[item.symbol]['03. high']}</td>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>₹{stockData[item.symbol]['04. low']}</td>
                                    </tr>
                                )
                            ))}
                            {/* Comparison stock row */}
                            <tr>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{compareData['01. symbol']}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>₹{compareData['05. price']}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee', color: parseFloat(compareData['09. change']) >= 0 ? 'green' : 'red' }}>
                                    {compareData['09. change']}
                                </td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{compareData['10. change percent']}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>₹{compareData['03. high']}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>₹{compareData['04. low']}</td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>
            {/* Watchlist */}
            <div>
                <h3>Watchlist</h3>
                <div>
                    <input
                        type="text"
                        placeholder="Add symbol to watchlist (e.g. TCS.BSE)"
                        value={watchlistSymbol}
                        onChange={(e) => setWatchlistSymbol(e.target.value.toUpperCase())}
                    />
                    <button onClick={addToWatchlist}>Add to Watchlist</button>
                </div>

                <div>
                    {watchlist.map((item) => (
                        <div key={item._id}>
                            <h4>{item.symbol}</h4>
                            <p>Price: ₹{watchlistData[item.symbol]?.['05. price'] || 'Loading...'}</p>
                            <p style={{ color: parseFloat(watchlistData[item.symbol]?.['09. change']) >= 0 ? 'green' : 'red' }}>
                                Change: {watchlistData[item.symbol]?.['09. change'] || '...'} ({watchlistData[item.symbol]?.['10. change percent'] || '...'})
                            </p>
                            <p>High: ₹{watchlistData[item.symbol]?.['03. high'] || '...'}</p>
                            <p>Low: ₹{watchlistData[item.symbol]?.['04. low'] || '...'}</p>
                            <button onClick={() => removeFromWatchlist(item._id)}>Remove</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;