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

module.exports = router;