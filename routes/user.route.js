const express = require("express");
const router = express.Router();
const { GetUser,updateProfile } = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/verifyToken");
const mediaUpload = require("../middleware/mediaUpload");

// Protected route using GET method
router.get("/getuser", verifyToken, GetUser);
router.put("/updateProfile", mediaUpload.single("profilePhoto"),verifyToken, updateProfile);


module.exports = router;

