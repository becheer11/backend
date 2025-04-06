const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Creator", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["en attente", "effectué", "échoué"], default: "en attente" },
    transactionId : String,
    createdAt: { type: Date, default: Date.now }
  });
  

module.exports = mongoose.model("Payment", paymentSchema);
