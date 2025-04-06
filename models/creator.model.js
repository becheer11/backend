
const mongoose = require("mongoose");

const creatorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    socialLinks: {
      instagram: {
        type: String,
        trim: true,
        lowercase: true,
      },
      tiktok: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    audience: {
      instafollowers: {
        type: Number,
        default: 0,
        min: 0,
      },
      tiktokfollowers: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    score: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Score",
    },
    campaigns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Creator", creatorSchema);

  