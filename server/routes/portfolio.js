const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');

// GET - get all portfolio items
router.get('/', authMiddleware, async (req, res) => {
    try {
        const items = await Portfolio.find({ user: req.user.id });
        res.json(items);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
        console.log(err);
    }
});

// POST - add stock to portfolio
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { symbol, shares, buyPrice } = req.body;

        const item = new Portfolio({
            user: req.user.id,
            symbol,
            shares,
            buyPrice
        });

        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
        console.log(err);
    }
});

// DELETE - remove stock
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Portfolio.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Stock removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
        console.log(err);
    }
});

module.exports = router;