const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    sendDate: { type: Date, default: Date.now },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
