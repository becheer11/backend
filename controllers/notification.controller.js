const Notification = require("../models/notification.model.js");
const Brief = require("../models/brief.model.js");
const Advertiser = require("../models/advertiser.model.js");
const Creator = require("../models/creator.model.js");
const User = require("../models/user.model.js");

/**
 * @desc Send notification
 */
const sendNotification = async (message, recipientId, link = "") => {
    try {
        const newNotification = new Notification({
            message,
            recipient: recipientId,
            link, // Optional link to relevant page
            read: false,
            createdAt: new Date()
        });

        await newNotification.save();
        console.log("Notification sent:", message);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

/**
 * @desc Get notifications for a user
 */
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userId })
            .sort({ createdAt: -1 }) // Newest first
            .limit(50); // Limit to 50 most recent

        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * @desc Mark notification as read
 */
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * @desc Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.userId, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { 
    sendNotification, 
    getNotifications, 
    markAsRead,
    markAllAsRead
};