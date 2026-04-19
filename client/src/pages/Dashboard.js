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

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/portfolio', {
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

        } catch (err) {
            setError('Error fetching portfolio');
            setLoading(false);
        }
    };

    const fetchStockData = async (symbol) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/stocks/${symbol}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStockData(prev => ({ ...prev, [symbol]: response.data['Global Quote'] }));
        } catch (err) {
            setError('Error fetching stock data');
        }
    };

    const fetchChartData = async (symbol) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/stocks/history/${symbol}`, {
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
            await axios.post('http://localhost:5000/api/portfolio',
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
            await axios.delete(`http://localhost:5000/api/portfolio/${id}`,
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
            const response = await axios.get(`http://localhost:5000/api/stocks/search/${query}`, {
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

    return (
        <div>
            {/* Header */}
            <div>
                <h1>Stock Portfolio Tracker</h1>
                <button onClick={logout}>Logout</button>
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;