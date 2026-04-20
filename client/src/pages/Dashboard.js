import API_URL from '../config';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import { 
    LayoutDashboard, Monitor, Wallet, History, Layers, Settings, 
    Bell, Search, UserCircle, LogOut, TrendingUp, TrendingDown, Plus, Infinity 
} from 'lucide-react';
import './Dashboard.css';

const ASSET_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

const Dashboard = () => {
    const { token, logout } = useContext(AuthContext);

    const [portfolio, setPortfolio] = useState([]);
    const [stockData, setStockData] = useState({});
    const [chartData, setChartData] = useState({});
    const [news, setNews] = useState({});
    
    // Watchlist state
    const [watchlist, setWatchlist] = useState([]);
    const [watchlistData, setWatchlistData] = useState({});
    
    // Search/Add state
    const [symbol, setSymbol] = useState('');
    const [shares, setShares] = useState('');
    const [buyPrice, setBuyPrice] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTimer, setSearchTimer] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeChartFilter, setActiveChartFilter] = useState('6M'); // UI only for now

    useEffect(() => {
        fetchPortfolio();
        fetchWatchlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchWatchlist = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/watchlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWatchlist(response.data);
            response.data.forEach((item, index) => {
                setTimeout(() => {
                    fetchWatchlistStockData(item.symbol);
                }, (index + 2) * 13000);
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

    const addToWatchlist = async (sym) => {
        try {
            await axios.post(`${API_URL}/api/watchlist`,
                { symbol: sym.toUpperCase() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchWatchlist();
        } catch (err) {
            console.log('Error adding to watchlist');
        }
    };

    const fetchPortfolio = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/portfolio`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPortfolio(response.data);
            setLoading(false);

            response.data.forEach((item, index) => {
                setTimeout(() => fetchStockData(item.symbol), index * 13000);
            });

            response.data.forEach((item, index) => {
                setTimeout(() => fetchChartData(item.symbol), (index + 1) * 15000);
            });

            response.data.forEach((item, index) => {
                setTimeout(() => fetchNews(item.symbol), (index + 1) * 3000);
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
            console.log('Error fetching stock data');
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
            setIsAddModalOpen(false);
        } catch (err) {
            setError('Error adding stock');
        }
    };

    const searchStocks = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
        try {
            const response = await axios.get(`${API_URL}/api/stocks/search/${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data && response.data.length > 0) {
                setSearchResults(response.data);
                setShowDropdown(true);
            }
        } catch (err) {
            console.log('Search error:', err);
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '40px' }}>Loading...</div>;

    // Calculations
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
    const isPositive = monthlyChange >= 0;

    const assetPerformance = portfolio.map((item, index) => {
        const currentPrice = parseFloat(stockData[item.symbol]?.['05. price']) || 0;
        const currentValue = currentPrice * item.shares;
        const investedValue = item.buyPrice * item.shares;
        const gainLoss = currentValue - investedValue;
        const gainLossPercent = investedValue > 0 ? ((gainLoss / investedValue) * 100).toFixed(2) : 0;
        const allocation = totalCurrentValue > 0 ? ((currentValue / totalCurrentValue) * 100).toFixed(2) : 0;
        const color = ASSET_COLORS[index % ASSET_COLORS.length];

        return {
            symbol: item.symbol,
            shares: item.shares,
            currentValue: currentValue.toFixed(2),
            gainLoss: gainLoss.toFixed(2),
            gainLossPercent,
            allocation,
            color
        };
    }).sort((a, b) => b.currentValue - a.currentValue);

    // Default chart data to the highest allocation asset if available
    const primaryChartData = portfolio.length > 0 && chartData[portfolio[0].symbol] 
        ? chartData[portfolio[0].symbol] 
        : [];

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-logo">
                    <Infinity size={32} />
                </div>
                <div className="nav-items">
                    <div className="nav-item active"><LayoutDashboard size={22} /></div>
                    <div className="nav-item"><Monitor size={22} /></div>
                    <div className="nav-item"><Wallet size={22} /></div>
                    <div className="nav-item"><History size={22} /></div>
                    <div className="nav-item"><Layers size={22} /></div>
                </div>
                <div className="sidebar-bottom">
                    <div className="nav-item"><Settings size={22} /></div>
                    <div className="nav-item" onClick={logout} title="Logout"><LogOut size={22} /></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Topbar */}
                <div className="topbar">
                    <div className="breadcrumb">
                        <LayoutDashboard size={16} /> <span>/</span> <span className="active">Dashboard</span>
                    </div>

                    <div className="search-container">
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search stocks to add or watch..."
                            value={symbol}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSymbol(val.toUpperCase());
                                if (searchTimer) clearTimeout(searchTimer);
                                setSearchTimer(setTimeout(() => searchStocks(val), 800));
                            }}
                        />
                        {showDropdown && searchResults.length > 0 && (
                            <div className="search-dropdown">
                                {searchResults.map((result) => (
                                    <div 
                                        key={result['1. symbol']} 
                                        className="search-result-item"
                                        onClick={() => {
                                            setSymbol(result['1. symbol']);
                                            setShowDropdown(false);
                                            setIsAddModalOpen(true);
                                        }}
                                    >
                                        <div>
                                            <strong>{result['1. symbol']}</strong>
                                            <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>{result['2. name']}</div>
                                        </div>
                                        <Plus size={16} color="var(--dash-text-muted)" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="topbar-actions">
                        <button className="icon-btn"><Bell size={20} /></button>
                        <button className="icon-btn"><UserCircle size={24} color="#fff" /></button>
                    </div>
                </div>

                {/* Marquee (Top Ticker) */}
                <div className="ticker-container">
                    {watchlist.map(item => {
                        const wData = watchlistData[item.symbol];
                        if (!wData) return null;
                        const changeStr = wData['10. change percent'] || '0%';
                        const isUp = !changeStr.startsWith('-');
                        return (
                            <div key={item.symbol} className="ticker-item">
                                <span className="ticker-symbol">{item.symbol}</span>
                                <span>₹{wData['05. price']}</span>
                                <span style={{ color: isUp ? 'var(--dash-green)' : 'var(--dash-red)' }}>
                                    {isUp ? '+' : ''}{changeStr}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Grid Content */}
                <div className="dashboard-content">
                    {/* Row 1 */}
                    <div className="dash-row">
                        {/* Top Left: Portfolio Value */}
                        <div className="dash-card portfolio-card">
                            <h3 className="card-title">Portfolio value</h3>
                            <h1 className="portfolio-amount">₹{totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
                            <div className="portfolio-change">
                                <div className={`change-badge ${isPositive ? 'positive' : 'negative'}`}>
                                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {Math.abs(monthlyChange)}%
                                </div>
                                <span style={{ color: 'var(--dash-text-muted)' }}>
                                    {isPositive ? '+' : '-'}₹{Math.abs(monthlyChangeAmount).toLocaleString()} this month
                                </span>
                            </div>

                            <div className="allocation-section">
                                <div className="allocation-title">Where your money is invested</div>
                                <div className="allocation-bar">
                                    {assetPerformance.map(asset => (
                                        <div 
                                            key={asset.symbol} 
                                            className="allocation-segment"
                                            style={{ width: `${asset.allocation}%`, backgroundColor: asset.color }}
                                            title={`${asset.symbol}: ${asset.allocation}%`}
                                        ></div>
                                    ))}
                                </div>
                                <div className="allocation-legend">
                                    {assetPerformance.slice(0, 4).map(asset => (
                                        <div key={asset.symbol} className="legend-item">
                                            <div className="legend-left">
                                                <div className="legend-dot" style={{ backgroundColor: asset.color }}></div>
                                                <span style={{ color: 'var(--dash-text-muted)' }}>{asset.symbol}</span>
                                                <span>{asset.allocation}%</span>
                                            </div>
                                            <span>₹{Number(asset.currentValue).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top Right: Chart */}
                        <div className="dash-card chart-card">
                            <div className="chart-header">
                                <h3 className="card-title" style={{ margin: 0 }}>Value trend & impact</h3>
                                <div className="chart-filters">
                                    {['1D', '7D', '1M', '6M', '1Y'].map(filter => (
                                        <button 
                                            key={filter}
                                            className={`chart-filter-btn ${activeChartFilter === filter ? 'active' : ''}`}
                                            onClick={() => setActiveChartFilter(filter)}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ width: '100%', height: '220px', marginTop: '10px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={primaryChartData}>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1a1a1e', border: '1px solid #222226', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#1a1a1e', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="dash-row">
                        {/* Bottom Left: Asset Performance */}
                        <div className="dash-card assets-card">
                            <h3 className="card-title">Asset performance</h3>
                            <table className="assets-table">
                                <thead>
                                    <tr>
                                        <th>Asset</th>
                                        <th>Allocation</th>
                                        <th>7D Return</th>
                                        <th>Contribution</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assetPerformance.map(asset => {
                                        const isGain = parseFloat(asset.gainLoss) >= 0;
                                        return (
                                            <tr key={asset.symbol}>
                                                <td>
                                                    <div className="asset-name-cell">
                                                        <div className="asset-icon" style={{ backgroundColor: `${asset.color}20`, color: asset.color }}>
                                                            {asset.symbol.charAt(0)}
                                                        </div>
                                                        <strong>{asset.symbol.split('.')[0]}</strong>
                                                    </div>
                                                </td>
                                                <td>{asset.allocation}%</td>
                                                <td>
                                                    <div className={`change-badge ${isGain ? 'positive' : 'negative'}`} style={{ display: 'inline-flex', padding: '2px 6px' }}>
                                                        {isGain ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                        {Math.abs(asset.gainLossPercent)}%
                                                    </div>
                                                </td>
                                                <td style={{ color: 'var(--dash-text-muted)' }}>
                                                    {isGain ? '+' : '-'}₹{Math.abs(asset.gainLoss).toLocaleString()}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {assetPerformance.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--dash-text-muted)' }}>
                                                No assets in portfolio yet. Search above to add!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Bottom Right: Watchlist / Stock Comparison Cards */}
                        <div className="dash-card watchlist-card">
                            <div className="card-title">
                                <span>Watchlist / Comparisons</span>
                                <button className="add-stock-btn" onClick={() => setIsAddModalOpen(true)}>
                                    <Plus size={14} /> Add New
                                </button>
                            </div>
                            <div className="watchlist-grid">
                                {watchlist.map(item => {
                                    const wData = watchlistData[item.symbol];
                                    if (!wData) return null;
                                    const changeStr = wData['10. change percent'] || '0%';
                                    const isUp = !changeStr.startsWith('-');
                                    return (
                                        <div key={item.symbol} className="watch-item">
                                            <div className="watch-header">
                                                <div className="watch-symbol">
                                                    <div className="asset-icon" style={{ width: 24, height: 24, fontSize: 10, backgroundColor: '#3b82f620', color: '#3b82f6' }}>
                                                        {item.symbol.charAt(0)}
                                                    </div>
                                                    {item.symbol.split('.')[0]}
                                                </div>
                                                <div className="watch-change" style={{ color: isUp ? 'var(--dash-green)' : 'var(--dash-red)' }}>
                                                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                    {Math.abs(parseFloat(changeStr))}%
                                                </div>
                                            </div>
                                            <div className="watch-price-row">
                                                <div className="watch-price">₹{parseFloat(wData['05. price']).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Stock Modal */}
            {isAddModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Add Asset: {symbol}</h2>
                        <div className="form-group">
                            <label>Shares</label>
                            <input 
                                type="number" 
                                className="form-control"
                                value={shares}
                                onChange={(e) => setShares(e.target.value)}
                                placeholder="10"
                            />
                        </div>
                        <div className="form-group">
                            <label>Buy Price (₹)</label>
                            <input 
                                type="number" 
                                className="form-control"
                                value={buyPrice}
                                onChange={(e) => setBuyPrice(e.target.value)}
                                placeholder="1500.50"
                            />
                        </div>
                        {error && <div style={{ color: 'var(--dash-red)', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
                        <button className="btn-primary" onClick={addStock}>Add to Portfolio</button>
                        <button className="btn-secondary" onClick={() => addToWatchlist(symbol)}>Add to Watchlist Instead</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;