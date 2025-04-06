const express = require('express');
const router = express.Router();
const { 
    createCampaign, 
    getCampaigns, 
    getCampaignById, 
    getCampaignsByBriefId,
    updateCampaign, 
    deleteCampaign 
} = require('../controllers/campaign.controller');
const { verifyToken , verifyTokenAndCreator ,verifyTokenAndAdvertiser} = require("../middleware/verifyToken.js");

// 📌 Route pour créer une campagne (nécessite un token)
router.post('/campaign', verifyTokenAndCreator, createCampaign);

// 📌 Route pour récupérer toutes les campagnes
router.get('/campaigns', verifyTokenAndCreator, getCampaigns);

router.get('/campaigns/brief/:briefId', verifyTokenAndAdvertiser, getCampaignsByBriefId);
// 📌 Route pour récupérer une campagne par ID
router.get('/campaign/:id', verifyTokenAndCreator, getCampaignById);

// 📌 Route pour mettre à jour une campagne
router.put('/campaign/:id', verifyTokenAndCreator, updateCampaign);

// 📌 Route pour supprimer une campagne
router.delete('/campaign/:id', verifyTokenAndCreator, deleteCampaign);

module.exports = router;
