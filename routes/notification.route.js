// notifications.routes.js
const express = require("express");
const router = express.Router();
const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead 
} = require("../controllers/notification.controller");
const {verifyToken}= require("../middleware/verifyToken");


router.get("/", verifyToken, getNotifications);
router.patch("/:id/read",verifyToken, markAsRead);
router.patch("/mark-all-read",verifyToken, markAllAsRead);

module.exports = router;