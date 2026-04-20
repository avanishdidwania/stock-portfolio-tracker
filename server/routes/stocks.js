const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const cache = {};
const CACHE_DURATION = 15 * 60 * 1000;
const searchCache = {};
const SEARCH_CACHE_DURATION = 60 * 60 * 1000; //1hour


router.get('/search/:keywords', authMiddleware, async (req, res) => {
    const { keywords } = req.params;

    // check cache first
    if (searchCache[keywords] && Date.now() - searchCache[keywords].timestamp < SEARCH_CACHE_DURATION) {
        return res.json(searchCache[keywords].data);
    }

    try {
        const response = await axios.get(
            `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
        );

        // store in cache
        searchCache[keywords] = {
            data: response.data['bestMatches'],
            timestamp: Date.now()
        };

        res.json(response.data['bestMatches']);
    } catch (err) {
        res.status(500).json({ msg: 'Error searching stocks' });
    }
});

router.get('/history/:symbol', authMiddleware, async (req, res) => {
    const { symbol } = req.params;

    try {
        const response = await axios.get(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
        );

        const timeSeries = response.data['Time Series (Daily)'];

        // Convert to array and take last 30 days
        const chartData = Object.entries(timeSeries)
            .slice(0, 30)
            .reverse()
            .map(([date, values]) => ({
                date: date.slice(5), // just MM-DD
                price: parseFloat(values['4. close'])
            }));

        res.json(chartData);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching history' });
    }
});

router.get('/:symbol', authMiddleware, async (req, res) => {
    const symbol = req.params.symbol;

    // check cache first
    if (cache[symbol] && Date.now() - cache[symbol].timestamp < CACHE_DURATION) {
        return res.json(cache[symbol].data);
    }

    try {
        const response = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
        );
        
        // store in cache
        cache[symbol] = {
            data: response.data,
            timestamp: Date.now()
        };
        
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching stock data' });
    }
});

router.get('/news/:symbol', authMiddleware, async (req, res) => {
    const { symbol } = req.params;

    // Map symbols to company names
    const companyNames = {
        'RELIANCE.BSE': 'Reliance Industries',
        'TCS.BSE': 'Tata Consultancy Services',
        'INFY.BSE': 'Infosys',
        'HDFCBANK.BSE': 'HDFC Bank',
        'ICICIBANK.BSE': 'ICICI Bank',
        'WIPRO.BSE': 'Wipro',
        'TATAMOTORS.BSE': 'Tata Motors',
        'ADANIENT.BSE': 'Adani Enterprises',
        'ADANIPORTS.BSE': 'Adani Ports',
        'AXISBANK.BSE': 'Axis Bank',
        'BAJFINANCE.BSE': 'Bajaj Finance',
        'BAJAJFINSV.BSE': 'Bajaj Finserv',
        'BHARTIARTL.BSE': 'Bharti Airtel',
        'COALINDIA.BSE': 'Coal India',
        'DIVISLAB.BSE': 'Divi Laboratories',
        'DRREDDY.BSE': 'Dr Reddys Laboratories',
        'EICHERMOT.BSE': 'Eicher Motors',
        'GRASIM.BSE': 'Grasim Industries',
        'HCLTECH.BSE': 'HCL Technologies',
        'HEROMOTOCO.BSE': 'Hero MotoCorp',
        'HINDUNILVR.BSE': 'Hindustan Unilever',
        'ITC.BSE': 'ITC Limited',
        'JSWSTEEL.BSE': 'JSW Steel',
        'KOTAKBANK.BSE': 'Kotak Mahindra Bank',
        'LT.BSE': 'Larsen and Toubro',
        'MARUTI.BSE': 'Maruti Suzuki',
        'NESTLEIND.BSE': 'Nestle India',
        'NTPC.BSE': 'NTPC Limited',
        'ONGC.BSE': 'Oil and Natural Gas Corporation',
        'POWERGRID.BSE': 'Power Grid Corporation',
        'SBILIFE.BSE': 'SBI Life Insurance',
        'SBIN.BSE': 'State Bank of India',
        'SUNPHARMA.BSE': 'Sun Pharmaceutical',
        'TATASTEEL.BSE': 'Tata Steel',
        'TECHM.BSE': 'Tech Mahindra',
        'TITAN.BSE': 'Titan Company',
        'ULTRACEMCO.BSE': 'UltraTech Cement',
        'UPL.BSE': 'UPL Limited',
        'VEDL.BSE': 'Vedanta Limited',
        'ZOMATO.BSE': 'Zomato',
    };

    const query = `${companyNames[symbol] || symbol.replace('.BSE', '').replace('.NSE', '')} stock India`;

    try {
        const response = await axios.get(
            `https://newsapi.org/v2/everything?q=${query}&language=en&pageSize=5&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`
        );
        const articles = response.data.articles.filter(article => article.urlToImage);
        res.json(articles.slice(0, 5));
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching news' });
    }
});




module.exports = router;