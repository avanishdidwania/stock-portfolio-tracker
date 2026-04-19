import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext'; import {
    LineChart,
    Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
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
            // fetch chart data for each stock
            response.data.forEach(item => {
                fetchChartData(item.symbol);
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
            setLoading(false);
        } catch (err) {
            setError('Error fetching stock data');
            setLoading(false);
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
        try {
            const response = await axios.post('http://localhost:5000/api/portfolio',
                { symbol, shares, buyPrice },
                {
                    headers: { Authorization: `Bearer ${token}` }
                });

            await fetchPortfolio();
            await fetchStockData(symbol);

        } catch (err) {
            setError('Error adding stock');
        }
    };

    const removeStock = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/portfolio/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                });
            await fetchPortfolio();

        } catch (err) {
            setError('Error removing stock');
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
                <input
                    type="text"
                    placeholder="Symbol (e.g. RELIANCE.BSE)"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                />
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
                        <p>
                            Gain/Loss: ₹{(
                                (parseFloat(stockData[item.symbol]?.['05. price']) - item.buyPrice)
                                * item.shares
                            ).toFixed(2) || '...'}
                        </p>
                        <button onClick={() => removeStock(item._id)}>Remove</button>
                        {/* Chart */}
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

                        {/* Toggle chart button */}
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
}
export default Dashboard;