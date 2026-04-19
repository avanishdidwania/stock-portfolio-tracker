const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');

router.get('/:symbol', authMiddleware, async (req, res) => {
    const symbol = req.params.symbol;

    try {
        const response = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
        );
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching stock data' });
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

module.exports = router;