const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    shares: {
        type: Number,
        required: true
    },
    buyPrice: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', PortfolioSchema);