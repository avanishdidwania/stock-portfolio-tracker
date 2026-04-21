import API_URL from '../config';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
    LayoutDashboard, Monitor, Newspaper, History, Layers, Settings, 
    Bell, Search, UserCircle, LogOut, TrendingUp, TrendingDown, Plus, Infinity, X, Trash2 
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
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showNotifications, setShowNotifications] = useState(false);
    
    // Dedicated watchlist add modal
    const [isWatchlistModalOpen, setIsWatchlistModalOpen] = useState(false);
    const [watchlistInput, setWatchlistInput] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeChartFilter, setActiveChartFilter] = useState('6M'); // UI only for now
    const [selectedGraphSymbol, setSelectedGraphSymbol] = useState(null);
    const [hoveredData, setHoveredData] = useState(null);

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
            const cached = localStorage.getItem(`av_stock_${symbol}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.time < 300000) { // 5 min cache
                    setWatchlistData(prev => ({ ...prev, [symbol]: parsed.data }));
                    return;
                }
            }
            const response = await axios.get(`${API_URL}/api/stocks/${symbol}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data['Global Quote']) {
                localStorage.setItem(`av_stock_${symbol}`, JSON.stringify({ time: Date.now(), data: response.data['Global Quote'] }));
                setWatchlistData(prev => ({ ...prev, [symbol]: response.data['Global Quote'] }));
            }
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

    const removeWatchlistItem = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/watchlist/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchWatchlist();
        } catch (err) {
            console.log('Error removing from watchlist');
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
                setTimeout(() => fetchStockData(item.symbol), index * 5000);
            });

            response.data.forEach((item, index) => {
                setTimeout(() => fetchChartData(item.symbol), (index + 1) * 7000);
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
            const cached = localStorage.getItem(`av_stock_${symbol}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.time < 300000) {
                    setStockData(prev => ({ ...prev, [symbol]: parsed.data }));
                    return;
                }
            }
            const response = await axios.get(`${API_URL}/api/stocks/${symbol}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data['Global Quote']) {
                localStorage.setItem(`av_stock_${symbol}`, JSON.stringify({ time: Date.now(), data: response.data['Global Quote'] }));
                setStockData(prev => ({ ...prev, [symbol]: response.data['Global Quote'] }));
            } else if (response.data.Information) {
                console.warn('API Rate Limit Exceeded:', response.data.Information);
            }
        } catch (err) {
            console.log('Error fetching stock data');
        }
    };

    const fetchChartData = async (symbol) => {
        try {
            const cached = localStorage.getItem(`av_chart_${symbol}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.time < 300000) {
                    setChartData(prev => ({ ...prev, [symbol]: parsed.data }));
                    return;
                }
            }
            const response = await axios.get(`${API_URL}/api/stocks/history/${symbol}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data && response.data.length > 0) {
                localStorage.setItem(`av_chart_${symbol}`, JSON.stringify({ time: Date.now(), data: response.data }));
                setChartData(prev => ({ ...prev, [symbol]: response.data }));
            }
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

    const removePortfolioItem = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/portfolio/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchPortfolio();
        } catch (err) {
            console.log('Error removing from portfolio');
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

    // Calculations with fallbacks for rate limits
    const totalCurrentValue = portfolio.reduce((total, item) => {
        // If API fails, fall back to buyPrice so it doesn't show 0
        const currentPrice = parseFloat(stockData[item.symbol]?.['05. price']) || item.buyPrice || 0;
        return total + (currentPrice * item.shares);
    }, 0);

    const totalStartValue = portfolio.reduce((total, item) => {
        const oldPrice = chartData[item.symbol]?.[0]?.price || item.buyPrice || 0;
        return total + (oldPrice * item.shares);
    }, 0);

    const todayChangeAmount = portfolio.reduce((total, item) => {
        // '09. change' is the change in price today
        const change = parseFloat(stockData[item.symbol]?.['09. change']) || 0;
        return total + (change * item.shares);
    }, 0);

    const previousCloseValue = totalCurrentValue - todayChangeAmount;
    const todayChangePercent = previousCloseValue > 0 ? (todayChangeAmount / previousCloseValue) * 100 : 0;
    const isTodayPositive = todayChangeAmount >= 0;

    const totalInvested = portfolio.reduce((total, item) => total + (item.buyPrice * item.shares), 0);
    const totalReturnAmount = totalCurrentValue - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? (totalReturnAmount / totalInvested) * 100 : 0;
    const isTotalReturnPositive = totalReturnAmount >= 0;

    const monthlyChange = totalStartValue > 0
        ? (((totalCurrentValue - totalStartValue) / totalStartValue) * 100).toFixed(2)
        : 0;
    const monthlyChangeAmount = (totalCurrentValue - totalStartValue).toFixed(2);
    const isPositive = monthlyChange >= 0;

    const assetPerformance = portfolio.map((item, index) => {
        const currentPrice = parseFloat(stockData[item.symbol]?.['05. price']) || item.buyPrice || 0;
        const currentValue = currentPrice * item.shares;
        const investedValue = item.buyPrice * item.shares;
        const gainLoss = currentValue - investedValue;
        const gainLossPercent = investedValue > 0 ? ((gainLoss / investedValue) * 100).toFixed(2) : 0;
        const allocation = totalCurrentValue > 0 ? ((currentValue / totalCurrentValue) * 100).toFixed(2) : 0;
        const color = ASSET_COLORS[index % ASSET_COLORS.length];

        return {
            _id: item._id,
            symbol: item.symbol,
            shares: item.shares,
            currentPrice: currentPrice.toFixed(2),
            currentValue: currentValue.toFixed(2),
            gainLoss: gainLoss.toFixed(2),
            gainLossPercent,
            allocation,
            color,
            isUsingFallback: !stockData[item.symbol]
        };
    }).sort((a, b) => b.currentValue - a.currentValue);

    // Determine which symbol to graph
    const symbolToGraph = selectedGraphSymbol || (portfolio.length > 0 ? portfolio[0].symbol : (watchlist.length > 0 ? watchlist[0].symbol : null));
    const displayGraphSymbol = symbolToGraph ? symbolToGraph.split('.')[0] : 'Portfolio';

    // Filter chart data based on selected time range
    const getFilteredChartData = () => {
        const rawData = symbolToGraph && chartData[symbolToGraph] 
            ? chartData[symbolToGraph] 
            : [];
            
        if (!rawData || rawData.length === 0) return [];

        let sliceCount = rawData.length;
        if (activeChartFilter === '1D') sliceCount = 2; // Show at least 2 points
        else if (activeChartFilter === '7D') sliceCount = 7;
        else if (activeChartFilter === '1M') sliceCount = 30;
        else if (activeChartFilter === '6M') sliceCount = 180;
        else if (activeChartFilter === '1Y') sliceCount = 365;

        // Take the latest N days, then reverse so oldest is on the left
        return rawData.slice(0, sliceCount).reverse();
    };

    const primaryChartData = getFilteredChartData();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{
                    backgroundColor: 'rgba(24, 24, 27, 0.8)',
                    backdropFilter: 'blur(12px)',
                    padding: '12px 16px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                }}>
                    <p style={{ color: 'var(--dash-text-muted)', fontSize: '12px', margin: '0 0 4px 0', fontWeight: '500' }}>{label}</p>
                    <p style={{ color: '#fff', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                        ₹{Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-logo">
                    <Infinity size={32} />
                </div>
                <div className="nav-items">
                    <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} title="Dashboard">
                        <LayoutDashboard size={22} />
                    </div>
                    <div className={`nav-item ${activeTab === 'screener' ? 'active' : ''}`} onClick={() => setActiveTab('screener')} title="Live Screener">
                        <Monitor size={22} />
                    </div>
                    <div className={`nav-item ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')} title="Market News">
                        <Newspaper size={22} />
                    </div>
                    <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')} title="Transaction History">
                        <History size={22} />
                    </div>
                    <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')} title="Portfolio Analytics">
                        <Layers size={22} />
                    </div>
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
                        <LayoutDashboard size={16} /> <span>/</span> <span className="active">
                            {activeTab === 'dashboard' ? 'Dashboard' : 'Market News'}
                        </span>
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
                        <div style={{ position: 'relative' }}>
                            <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                                <Bell size={20} />
                            </button>
                            {showNotifications && (
                                <div className="notifications-dropdown">
                                    <div className="notifications-header">
                                        <h4>Notifications</h4>
                                    </div>
                                    <div className="notifications-body">
                                        <Bell size={32} color="var(--dash-text-muted)" style={{ marginBottom: '12px', opacity: 0.3 }} />
                                        <p>There are no alerts.</p>
                                        <span style={{ fontSize: '12px', color: 'var(--dash-text-muted)' }}>You're all caught up!</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="icon-btn"><UserCircle size={24} color="#fff" /></button>
                    </div>
                </div>

                {/* Marquee (Top Ticker) */}
                <div className="ticker-container">
                    <div className="todays-change-badge">
                        <span className="label">Today's Change</span>
                        <div className={`value ${isTodayPositive ? 'positive' : 'negative'}`}>
                            {isTodayPositive ? '+' : '-'}₹{Math.abs(todayChangeAmount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            <span className="percent">({isTodayPositive ? '+' : '-'} {Math.abs(todayChangePercent).toFixed(2)}%)</span>
                        </div>
                    </div>
                    <div className="ticker-scroll">
                        {portfolio.map(item => {
                            const pData = stockData[item.symbol];
                            if (!pData) return null;
                            const changeStr = pData['10. change percent'] || '0%';
                            const isUp = !changeStr.startsWith('-');
                            return (
                                <div key={item.symbol} className="ticker-item">
                                    <span className="ticker-symbol">{item.symbol.split('.')[0]}</span>
                                    <span>₹{parseFloat(pData['05. price']).toFixed(2)}</span>
                                    <span style={{ color: isUp ? 'var(--dash-green)' : 'var(--dash-red)' }}>
                                        {isUp ? '+' : ''}{changeStr}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Grid Content */}
                {activeTab === 'dashboard' && (
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
                                        {isPositive ? '+' : '-'}₹{Math.abs(monthlyChangeAmount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} this month
                                    </span>
                                </div>

                                <div className="portfolio-summary-stats">
                                    <div className="summary-stat">
                                        <div className="stat-label">Amount Invested</div>
                                        <div className="stat-value">₹{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="summary-stat">
                                        <div className="stat-label">Total Return</div>
                                        <div className={`stat-value ${isTotalReturnPositive ? 'positive' : 'negative'}`}>
                                            {isTotalReturnPositive ? '+' : '-'}₹{Math.abs(totalReturnAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            <span className="stat-percent">({isTotalReturnPositive ? '+' : '-'}{Math.abs(totalReturnPercent).toFixed(2)}%)</span>
                                        </div>
                                    </div>
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

                            {/* Top Right: Value Trend Chart */}
                            <div className="dash-card chart-card">
                                <h3 className="card-title" style={{ alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ fontSize: '14px', color: 'var(--dash-text-muted)' }}>Value trend & Impact - {displayGraphSymbol}</span>
                                        {hoveredData ? (
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                <span style={{ fontSize: '26px', color: '#fff', fontWeight: '700', letterSpacing: '-0.5px' }}>₹{Number(hoveredData.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                <span style={{ fontSize: '26px', color: '#fff', fontWeight: '700', letterSpacing: '-0.5px' }}>
                                                    ₹{primaryChartData.length > 0 ? Number(primaryChartData[primaryChartData.length - 1].price).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '---'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="chart-filters">
                                        {['1D', '7D', '1M', '6M', '1Y'].map(f => (
                                            <span 
                                                key={f} 
                                                className={activeChartFilter === f ? 'active' : ''}
                                                onClick={() => setActiveChartFilter(f)}
                                            >
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </h3>
                                <div style={{ width: '100%', height: '220px', marginTop: '10px' }}>
                                    {primaryChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart 
                                                data={primaryChartData}
                                                onMouseMove={(e) => {
                                                    if (e.activePayload) setHoveredData(e.activePayload[0].payload);
                                                }}
                                                onMouseLeave={() => setHoveredData(null)}
                                            >
                                                <defs>
                                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <Tooltip 
                                                    content={<CustomTooltip />}
                                                    cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="price"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorPrice)"
                                                    activeDot={{ r: 6, fill: '#18181b', stroke: '#3b82f6', strokeWidth: 3 }}
                                                />
                                                <YAxis domain={['auto', 'auto']} hide />
                                                <XAxis dataKey="date" hide />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-muted)' }}>
                                            <div style={{ 
                                                width: '100%', 
                                                height: '100px', 
                                                background: 'linear-gradient(to right, transparent, rgba(59, 130, 246, 0.1), transparent)',
                                                filter: 'blur(10px)',
                                                borderRadius: '50%',
                                                marginBottom: '-40px'
                                            }}></div>
                                            <span style={{ position: 'relative', zIndex: 1, fontSize: '13px', letterSpacing: '0.5px' }}>Loading market data...</span>
                                        </div>
                                    )}
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
                                            <th style={{ textAlign: 'right' }}>Contribution</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assetPerformance.map(asset => {
                                            const isGain = parseFloat(asset.gainLoss) >= 0;
                                            return (
                                                <tr 
                                                    key={asset.symbol} 
                                                    onClick={() => setSelectedGraphSymbol(asset.symbol)}
                                                    className={symbolToGraph === asset.symbol ? 'selected-asset-row' : 'asset-row'}
                                                >
                                                    <td>
                                                        <div className="asset-name-cell">
                                                            <div className="asset-icon" style={{ backgroundColor: `${asset.color}20`, color: asset.color }}>
                                                                {asset.symbol.charAt(0)}
                                                            </div>
                                                            <strong>{asset.symbol.split('.')[0]}</strong>
                                                            {asset.isUsingFallback && (
                                                                <span title="Real-time data rate limit reached. Using buy price." style={{ fontSize: '10px', color: 'var(--dash-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '4px' }}>
                                                                    DELAYED
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>{asset.allocation}%</td>
                                                    <td>
                                                        <div className={`change-badge ${isGain ? 'positive' : 'negative'}`} style={{ display: 'inline-flex', padding: '2px 6px' }}>
                                                            {isGain ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                            {Math.abs(asset.gainLossPercent)}%
                                                        </div>
                                                    </td>
                                                    <td style={{ color: 'var(--dash-text-muted)', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                                                            <span>{isGain ? '+' : '-'}₹{Math.abs(asset.gainLoss).toLocaleString()}</span>
                                                            <button 
                                                                className="icon-btn delete-btn" 
                                                                onClick={(e) => { e.stopPropagation(); removePortfolioItem(asset._id); }} 
                                                                title="Remove Asset"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
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

                            {/* Bottom Right: Watchlist */}
                            <div className="dash-card watchlist-card">
                                <div className="card-title">
                                    <span>Watchlist / Comparisons</span>
                                    <button className="add-stock-btn" onClick={() => setIsWatchlistModalOpen(true)}>
                                        <Plus size={14} /> Add New
                                    </button>
                                </div>
                                <div className="watchlist-grid">
                                    {watchlist.length === 0 ? (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'var(--dash-text-muted)', fontSize: '13px' }}>
                                            Your watchlist is empty. Click "+ Add New" to start tracking stocks.
                                        </div>
                                    ) : (
                                        watchlist.map(item => {
                                            const wData = watchlistData[item.symbol];
                                            const changeStr = wData?.['10. change percent'] || '0%';
                                            const price = wData ? parseFloat(wData['05. price']).toFixed(2) : '---';
                                            const isUp = !changeStr.startsWith('-');
                                            return (
                                                <div 
                                                    key={item.symbol} 
                                                    className={`watch-item ${symbolToGraph === item.symbol ? 'selected-watch-item' : ''}`}
                                                    onClick={() => setSelectedGraphSymbol(item.symbol)}
                                                >
                                                    <div className="watch-header">
                                                        <div className="watch-symbol">
                                                            <div className="asset-icon" style={{ width: 24, height: 24, fontSize: 10, backgroundColor: '#3b82f620', color: '#3b82f6' }}>
                                                                {item.symbol.charAt(0)}
                                                            </div>
                                                            {item.symbol.split('.')[0]}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div className="watch-change" style={{ color: wData ? (isUp ? 'var(--dash-green)' : 'var(--dash-red)') : 'var(--dash-text-muted)' }}>
                                                                {wData && (isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
                                                                {Math.abs(parseFloat(changeStr))}%
                                                            </div>
                                                            <button 
                                                                className="icon-btn delete-btn" 
                                                                onClick={(e) => { e.stopPropagation(); removeWatchlistItem(item._id); }} 
                                                                title="Remove from Watchlist"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="watch-price-row">
                                                        <div className="watch-price">
                                                            {price !== '---' ? `₹${parseFloat(price).toLocaleString()}` : <span style={{fontSize:'12px', color:'var(--dash-text-muted)'}}>Rate Limited</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'news' && (
                    <div className="dashboard-content">
                        <div className="dash-card">
                            <h3 className="card-title">Latest Market News</h3>
                            <div className="news-grid">
                                {Object.keys(news).length === 0 ? (
                                    <div style={{ color: 'var(--dash-text-muted)', padding: '20px 0' }}>No news available right now.</div>
                                ) : (
                                    Object.entries(news).map(([symbol, articles]) => (
                                        articles && articles.slice(0, 5).map((article, idx) => (
                                            <a key={`${symbol}-${idx}`} href={article.url} target="_blank" rel="noreferrer" className="news-card">
                                                {article.urlToImage && (
                                                    <div className="news-img" style={{ backgroundImage: `url(${article.urlToImage})` }}></div>
                                                )}
                                                <div className="news-content">
                                                    <div className="news-meta">
                                                        <span className="news-tag">{symbol.split('.')[0]}</span>
                                                        <span className="news-date">{new Date(article.publishedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <h4 className="news-title">{article.title}</h4>
                                                    <p className="news-desc">{article.description}</p>
                                                </div>
                                            </a>
                                        ))
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'screener' && (
                    <div className="dashboard-content">
                        <div className="dash-card screener-coming-soon-card">
                            <div className="screener-content">
                                <div className="screener-icon-wrapper">
                                    <Monitor size={48} color="var(--dash-blue)" />
                                    <div className="pulse-ring"></div>
                                </div>
                                <h2 style={{ fontSize: '28px', margin: '20px 0 10px 0', color: 'var(--dash-text)' }}>Live Screener</h2>
                                <p style={{ color: 'var(--dash-text-muted)', fontSize: '15px', maxWidth: '400px', lineHeight: '1.6', marginBottom: '30px' }}>
                                    Advanced real-time stock filtering, momentum indicators, and algorithmic screening are on the way.
                                </p>
                                <div className="coming-soon-badge-large">Coming Soon</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="dashboard-content">
                        <div className="dash-card history-coming-soon-card">
                            <div className="history-bg-lines"></div>
                            <div className="screener-content">
                                <div className="history-icon-wrapper">
                                    <History size={48} color="#10b981" />
                                </div>
                                <h2 style={{ fontSize: '28px', margin: '20px 0 10px 0', color: 'var(--dash-text)' }}>Transaction History</h2>
                                <p style={{ color: 'var(--dash-text-muted)', fontSize: '15px', maxWidth: '400px', lineHeight: '1.6', marginBottom: '30px' }}>
                                    A full ledger of your past trades, realized gains, and dividend tracking is currently in development.
                                </p>
                                <div className="coming-soon-badge-emerald">Coming Soon</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="dashboard-content">
                        <div className="dash-card analytics-coming-soon-card">
                            <div className="analytics-float-element"></div>
                            <div className="screener-content">
                                <div className="analytics-icon-wrapper">
                                    <Layers size={48} color="#f59e0b" />
                                </div>
                                <h2 style={{ fontSize: '28px', margin: '20px 0 10px 0', color: 'var(--dash-text)' }}>Deep Analytics</h2>
                                <p style={{ color: 'var(--dash-text-muted)', fontSize: '15px', maxWidth: '400px', lineHeight: '1.6', marginBottom: '30px' }}>
                                    Sector breakdowns, risk metrics (Beta/Volatility), and diversification insights will be available here.
                                </p>
                                <div className="coming-soon-badge-amber">Coming Soon</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Stock Modal */}
            {isAddModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                    <div className="modal-content premium-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2>Add Asset</h2>
                                <span className="modal-badge">{symbol}</span>
                            </div>
                            <button className="icon-btn" onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Number of Shares</label>
                                <div className="input-with-icon">
                                    <input 
                                        type="number" 
                                        className="form-control"
                                        value={shares}
                                        onChange={(e) => setShares(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Average Buy Price</label>
                                <div className="input-with-icon">
                                    <span className="input-prefix">₹</span>
                                    <input 
                                        type="number" 
                                        className="form-control with-prefix"
                                        value={buyPrice}
                                        onChange={(e) => setBuyPrice(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            {error && <div className="modal-error">{error}</div>}
                            
                            <div className="modal-actions">
                                <button className="btn-primary" onClick={addStock}>Add to Portfolio</button>
                                <div className="modal-divider"><span>or</span></div>
                                <button className="btn-outline" onClick={() => { addToWatchlist(symbol); setIsAddModalOpen(false); }}>
                                    <Bell size={16} style={{ marginRight: '6px' }}/> Add to Watchlist
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dedicated Watchlist Add Modal */}
            {isWatchlistModalOpen && (
                <div className="modal-overlay" onClick={() => setIsWatchlistModalOpen(false)}>
                    <div className="modal-content premium-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2>Add to Watchlist</h2>
                            </div>
                            <button className="icon-btn" onClick={() => setIsWatchlistModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Stock Symbol</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={watchlistInput}
                                    onChange={(e) => setWatchlistInput(e.target.value.toUpperCase())}
                                    placeholder="e.g. TCS.BSE"
                                />
                            </div>
                            <button className="btn-primary" onClick={() => {
                                addToWatchlist(watchlistInput);
                                setIsWatchlistModalOpen(false);
                                setWatchlistInput('');
                            }} style={{ marginTop: '20px' }}>Add Symbol</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;