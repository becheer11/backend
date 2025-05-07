const express = require('express');
const router = express.Router();
const { 
    createCampaign, 
    getCampaigns, 
    getCampaignById, 
    getCampaignsByBriefId,
    getMyCampaigns,
    updateCampaign, 
    deleteCampaign, 
    getCampaignsCount
} = require('../controllers/campaign.controller');
const { verifyToken , verifyTokenAndCreator ,verifyTokenAndAdvertiser, verifyTokenAndAdmin} = require("../middleware/verifyToken.js");
const mediaUpload = require("../middleware/mediaUpload");

// 📌 Route pour créer une campagne (nécessite un token)
router.post('/campaign', mediaUpload.single("attachment"),verifyTokenAndCreator, createCampaign);

// 📌 Route pour récupérer toutes les campagnes
router.get('/campaigns', verifyTokenAndCreator, getCampaigns);
router.get('/my-campaigns', verifyTokenAndCreator, getMyCampaigns);

router.get('/campaigns/brief/:briefId', verifyToken, getCampaignsByBriefId);
// 📌 Route pour récupérer une campagne par ID
router.get('/campaign/:id', verifyTokenAndCreator, getCampaignById);

// 📌 Route pour mettre à jour une campagne
router.put('/campaign/:id', verifyTokenAndCreator, updateCampaign);

// 📌 Route pour supprimer une campagne
router.delete('/campaign/:id', verifyTokenAndCreator, deleteCampaign);

router.get("/campaigns/count",verifyTokenAndAdmin,getCampaignsCount),


module.exports = router;
