const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantitativeScore: { type: Number, required: true },
    qualitativeScore: { type: Number, required: true },
    totalScore: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', scoreSchema);
