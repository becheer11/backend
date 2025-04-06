// routes/brief.routes.js

const express = require('express');
const router = express.Router();
const { createBrief, getBriefs, getBriefsByAdvertiser, getBriefById, updateBrief, deleteBrief } = require('../controllers/brief.controller');
const  {verifyTokenAndAdvertiser, verifyToken} = require("../middleware/verifyToken.js");

// Route to create a brief (only admin and advertiser can create)
router.post('/brief', verifyTokenAndAdvertiser , createBrief);

// Route to get all briefs
router.get('/briefs',verifyToken, getBriefs);
router.get("/mybriefs", verifyTokenAndAdvertiser, getBriefsByAdvertiser);
// Route to get a single brief by ID
router.get('/brief/:id', getBriefById);

// Route to update a brief
router.put('/brief/:id', verifyTokenAndAdvertiser, updateBrief);

// Route to delete a brief
router.delete('/brief/:id', verifyTokenAndAdvertiser, deleteBrief);

module.exports = router;
