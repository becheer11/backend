const express = require("express");
const router = express.Router();
const { GetUser,updateProfile, getCreatorsCount, getAdvertisersCount, getCreators, getAdvertisers } = require("../controllers/user.controller");
const { verifyToken, verifyTokenAndAdmin } = require("../middleware/verifyToken");
const mediaUpload = require("../middleware/mediaUpload");

// Protected route using GET method
router.get("/getuser", verifyToken, GetUser);
router.put("/updateProfile", mediaUpload.single("profilePhoto"),verifyToken, updateProfile);
router.get("/")

router.get("/creators/count",verifyTokenAndAdmin,getCreatorsCount),
router.get("/advertisers/count",verifyTokenAndAdmin,getAdvertisersCount),
router.get("/creators",verifyTokenAndAdmin,getCreators),
router.get("/advertisers",verifyTokenAndAdmin,getAdvertisers),


module.exports = router;

