const mongoose = require("mongoose");

const briefSchema = new mongoose.Schema({
  advertiserId: { type: mongoose.Schema.Types.ObjectId, ref: "Advertiser", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  categories: [String],
  phrases: [String],
  waitingForBrand: { type: Boolean, default: false },
  waitingForInfluencer: { type: Boolean, default: true },
  reviewDeadline: { type: Date, required: true, default: new Date() },
  deadline: { type: Date, required: true, default: new Date() },
  commentList: [String],
  tags: [String],
  status: { type: String, default: "no influencer assigned" },
  numberOfRevisions: { type: Number, default: 1 },
  budget: { type: Number, required: true },
  targetPlatform: { type: String, enum: ["Instagram", "TikTok"], required: true },
  attachment: {
    type: Object,
    default: {
      url: "",
      publicId: null,
      resourceType: "image", // or "video"
    },
  },
  validationStatus: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  campaigns: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",  // Reference to the 'Campaign' model
    },
  ],
  createdAt: { type: Date, default: Date.now },

});

module.exports = mongoose.model("Brief", briefSchema);
