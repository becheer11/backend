const Campaign = require("../models/campaign.model.js");
const Brief = require("../models/brief.model.js");
const Creator = require("../models/creator.model.js");


/**
 * @desc Create a campaign and update Brief status
 */
const createCampaign = async (req, res) => {
    try {
        // Vérifier si le Brief existe
        const brief = await Brief.findById(req.body.briefId);
        if (!brief) return res.status(404).json({ success: false, message: "Brief not found" });

        // Vérifier si le Creator existe
        const creator = await Creator.findById(req.userId);
        if (!creator) return res.status(404).json({ success: false, message: "Creator not found" });

        // Création de la campagne
        const newCampaign = new Campaign({
            briefId: brief._id,
            creatorId: creator._id,
            ...req.body // Récupère le reste des données envoyées
        });

        await newCampaign.save();

        // Mettre à jour le statut du Brief
        brief.status = "Influencer submit campaign";
        await brief.save();

        res.status(201).json({ success: true, message: "Campaign created successfully, Brief status updated", campaign: newCampaign });

    } catch (error) {
        console.error("Error creating campaign:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

/**
 * @desc Get all campaigns
 */
const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find()
        .populate("briefId", "title")
        .populate({
            path: "creatorId",
            select: "userId socialLinks",
            populate: {
                path: "userId",
                select: "username" // Récupère uniquement le username
            }})
            
        res.status(200).json({ success: true, campaigns });
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * @desc Get a campaign by ID
 */
const getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate("briefId", "title")
            .populate({
                path: "creatorId",
                select: "userId socialLinks",
                populate: {
                    path: "userId",
                    select: "username" // Récupère uniquement le username
                }})

        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        res.status(200).json({ success: true, campaign });
    } catch (error) {
        console.error("Error fetching campaign by ID:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
/**
 * @desc Get all campaigns by Brief ID
 */
const getCampaignsByBriefId = async (req, res) => {
    try {
        const { briefId } = req.params;
        console.log(briefId);

        // Vérifier si le Brief existe
        const briefExists = await Brief.findById(briefId);
        if (!briefExists) {
            return res.status(404).json({ success: false, message: "Brief not found" });
        }

        // Récupérer les campagnes associées au Brief
        const campaigns = await Campaign.find({ briefId })
            .populate("briefId", "title")
            .populate({
                path: "creatorId",
                select: "userId socialLinks",
                populate: {
                    path: "userId",
                    select: "username"
                }
            });

        res.status(200).json({ success: true, campaigns });
    } catch (error) {
        console.error("Error fetching campaigns by Brief ID:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * @desc Update a campaign
 */
const updateCampaign = async (req, res) => {
    try {
        const updatedCampaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedCampaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        res.status(200).json({ success: true, message: "Campaign updated", campaign: updatedCampaign });
    } catch (error) {
        console.error("Error updating campaign:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc Delete a campaign
 */
const deleteCampaign = async (req, res) => {
    try {
        const deletedCampaign = await Campaign.findByIdAndDelete(req.params.id);
        if (!deletedCampaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        res.status(200).json({ success: true, message: "Campaign deleted" });
    } catch (error) {
        console.error("Error deleting campaign:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    createCampaign,
    getCampaigns,
    getCampaignById,
    getCampaignsByBriefId,
    updateCampaign,
    deleteCampaign
};
