const Notification = require("../models/notification.model.js");
const Brief = require("../models/brief.model.js");
const Advertiser = require("../models/advertiser.model.js");

/**
 * @desc Send notification
 */
const sendNotification = async (message, recipientId) => {
    try {
        const newNotification = new Notification({
            message,
            recipient: recipientId,
        });

        await newNotification.save();
        console.log("Notification sent:", message);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

module.exports = { sendNotification };
