const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  briefId: { type: mongoose.Schema.Types.ObjectId, ref: "Brief", required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Creator", required: true },
  description: { type: String, required: true },
  contentUrls: [{ type: String, required: true }], 
  score: { type: Number },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"], 
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"], 
    default: "unpaid",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Campaign", campaignSchema);
