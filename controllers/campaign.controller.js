const fs = require("fs");
const Campaign = require("../models/campaign.model.js");
const Brief = require("../models/brief.model.js");
const Creator = require("../models/creator.model.js");
const { sendNotification } = require("./notification.controller.js");

const {
  cloudinaryUploadFile,
  cloudinaryRemoveImage
} = require("../utils/cloudinary");



const createCampaign = async (req, res) => {
    try {
      const { briefId, description, attachment, score, status, paymentStatus } = req.body;
  
      // Find the brief by ID
      const brief = await Brief.findById(briefId);
      if (!brief) return res.status(404).json({ success: false, message: "Brief not found" });
  
      // Find the creator (influencer) who is creating the campaign
      const creator = await Creator.findById(req.userId);
      if (!creator) return res.status(404).json({ success: false, message: "Creator not found" });
  
      // Handle campaign attachment if provided (using Cloudinary)
      let campaignAttachment = {
        url: "",
        publicId: null,
        resourceType: "image", // default to image
      };
  
      if (req.file) {
        const filePath = req.file.path;
        const uploadedResult = await cloudinaryUploadFile(filePath);
        campaignAttachment = {
          url: uploadedResult.secure_url,
          publicId: uploadedResult.public_id,
          resourceType: uploadedResult.resource_type,
        };
  
        fs.unlinkSync(filePath);
      }
  
      // Create a new campaign
      const newCampaign = new Campaign({
        briefId: brief._id,
        creatorId: creator._id,
        description,
        attachment: campaignAttachment,
        score,
        status,
        paymentStatus,
      });
  
      // Save the new campaign
      await newCampaign.save();
  
      // Add the new campaign to the brief's campaigns array
      brief.campaigns.push(newCampaign._id);
      brief.status = "Influencer submit campaign"; // Update the brief status
      await brief.save();
  
      res.status(201).json({
        success: true,
        message: "Campaign created successfully, Brief status updated",
        campaign: newCampaign,
      });
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
      .populate("briefId", "title deadline description budget categories tags")
      .populate({
        path: "creatorId",
        select: "userId socialLinks",
        populate: { path: "userId", select: "username" }
      });

    res.status(200).json({ success: true, campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
    .populate("briefId", "title deadline description budget categories tags")
      .populate({
        path: "creatorId",
        select: "userId socialLinks",
        populate: { path: "userId", select: "username" }
      });
    

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
    const briefExists = await Brief.findById(briefId)
  
    if (!briefExists) return res.status(404).json({ success: false, message: "Brief not found" });

    const campaigns = await Campaign.find({ briefId }).populate({
      path: "creatorId" ,
      select: "userId socialLinks",
      populate: { path: "userId", select: "username profilePhoto" }
    });
     

    res.status(200).json({ success: true, campaigns });
  } catch (error) {
    console.error("Error fetching campaigns by Brief ID:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Get campaigns created by the currently logged-in creator
 */
const getMyCampaigns = async (req, res) => {
  try {
    const creator = await Creator.findById(req.userId);
    if (!creator) return res.status(404).json({ success: false, message: "Creator not found" });

    const campaigns = await Campaign.find({ creatorId: creator._id })
    .populate("briefId"," title deadline description budget categories tags ")  // Populate briefId with the title of the brief
    .populate({
      path: "creatorId" ,
      select: "userId socialLinks",
      populate: { path: "userId", select: "username profilePhoto" }
    });
  

    res.status(200).json({ success: true, campaigns });
  } catch (error) {
    console.error("Error fetching creator's campaigns:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Update a campaign
 */
const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

    const brief = await Brief.findById(campaign.briefId);
    const creator = await Creator.findById(campaign.creatorId).populate("userId");

    const oldStatus = campaign.status;

    let updatedData = { ...req.body };

    if (req.file) {
      if (campaign.attachment?.publicId) {
        await cloudinaryRemoveImage(campaign.attachment.publicId);
      }

      const filePath = req.file.path;
      const uploadedResult = await cloudinaryUploadFile(filePath);

      updatedData.attachment = {
        url: uploadedResult.secure_url,
        publicId: uploadedResult.public_id,
        resourceType: uploadedResult.resource_type,
      };

      fs.unlinkSync(filePath);
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    // Notification for campaign status change
    if (updatedData.status && updatedData.status !== oldStatus) {
      let message = "";
      let recipient = null;
      
      if (updatedData.status === "approved") {
        message = `Admin has approved your campaign for brief "${brief.title}"`;
        recipient = creator.userId._id;
      } else if (updatedData.status === "rejected") {
        message = `Admin has rejected your campaign for brief "${brief.title}"`;
        recipient = creator.userId._id;
      } else if (updatedData.status === "accepted") {
        message = `Advertiser has accepted your campaign for brief "${brief.title}"`;
        recipient = creator.userId._id;
      } else if (updatedData.status === "declined") {
        message = `Advertiser has declined your campaign for brief "${brief.title}"`;
        recipient = creator.userId._id;
      }
      
      if (message && recipient) {
        await sendNotification(
          message,
          recipient,
          `/campaign/${campaign._id}` // Link to campaign page
        );
      }
    }

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

    if (deletedCampaign.attachment?.publicId) {
      await cloudinaryRemoveImage(deletedCampaign.attachment.publicId);
    }

    res.status(200).json({ success: true, message: "Campaign deleted" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const getCampaignsCount = async (req, res) => {
  try {
    const count = await Campaign.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// In user.controller.js



module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  getCampaignsByBriefId,
  getMyCampaigns,
  updateCampaign,
  deleteCampaign,
  getCampaignsCount,
};
