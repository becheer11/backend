// routes/brief.routes.js

const express = require('express');
const router = express.Router();
const { createBrief, getBriefs, getBriefsByAdvertiser, getBriefById, updateBrief, deleteBrief, getBriefsCount } = require('../controllers/brief.controller');
const  {verifyTokenAndAdvertiser, verifyToken, verifyTokenAndCreator, verifyTokenAndAdmin} = require("../middleware/verifyToken.js");
const mediaUpload = require("../middleware/mediaUpload");

// POST with image/video attachment
// Route to create a brief (only admin and advertiser can create)
router.post('/brief', verifyTokenAndAdvertiser , mediaUpload.single("attachment"), createBrief);

// Route to get all briefs
router.get('/briefs',verifyToken, getBriefs);
router.get("/mybriefs", verifyTokenAndAdvertiser, getBriefsByAdvertiser);
// Route to get a single brief by ID
router.get('/brief/:id', getBriefById);

// Route to update a brief
router.put('/brief/:id',verifyToken , updateBrief);

// Route to delete a brief
router.delete('/brief/:id', verifyTokenAndAdvertiser, deleteBrief);

router.get("/briefs/count",verifyTokenAndAdmin,getBriefsCount),
module.exports = router;
