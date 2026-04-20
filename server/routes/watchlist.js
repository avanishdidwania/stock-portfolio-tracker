const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Watchlist = require('../models/Watchlist');

// GET - get all watchlist items
router.get('/', authMiddleware, async (req, res) => {
    try {
        const items = await Watchlist.find({ user: req.user.id });
        res.json(items);
    } catch (err) {
        console.log('Watchlist error:', err); // add this
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST - add to watchlist
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { symbol } = req.body;
        const item = new Watchlist({ user: req.user.id, symbol });
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE - remove from watchlist
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Watchlist.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Removed from watchlist' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;