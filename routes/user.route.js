const express = require("express");
const router = express.Router();
const { GetUser } = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/verifyToken");

// Protected route using GET method
router.get("/getuser", verifyToken, GetUser);

module.exports = router;

