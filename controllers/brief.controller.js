const Brief = require("../models/brief.model.js");
const Advertiser = require("../models/advertiser.model.js");
const { sendNotification } = require("../controllers/notification.controller.js");


/**
 * @desc Create a new brief
 */
const createBrief = async (req, res) => {
  try {

    // Vérifier si l'utilisateur est un Advertiser existant
    const advertiser = await Advertiser.findById(req.userId);
    if (!advertiser) {
      return res.status(400).json({ success: false, message: "Advertiser not found" });
    }

    // Création du brief
    const newBrief = new Brief({
      advertiserId: advertiser._id,
      title: req.body.title,
      description: req.body.description,
      categories: req.body.categories,
      phrases: req.body.phrases,
      waitingForBrand: req.body.waitingForBrand ?? false,
      waitingForInfluencer: req.body.waitingForInfluencer ?? true,
      reviewDeadline: req.body.reviewDeadline,
      deadline: req.body.deadline,
      commentList: req.body.commentList,
      tags: req.body.tags,
      status: req.body.status ?? "no influencer assigned",
      numberOfRevisions: req.body.numberOfRevisions ?? 1,
      budget: req.body.budget,
      targetPlatform: req.body.targetPlatform,
      attachment: req.body.attachment,
      validationStatus: req.body.validationStatus ?? "pending",
    });

    await newBrief.save();

    res.status(201).json({ success: true, message: "Brief created successfully", brief: newBrief });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get briefs by advertiser
 */
const getBriefsByAdvertiser = async (req, res) => {
  try {
    const advertiserId = req.userId;
    console.log("Fetching briefs for Advertiser ID:", advertiserId);

    const briefs = await Brief.find({ advertiserId }).populate("advertiserId", "companyName");

    res.status(200).json({ success: true, briefs });
  } catch (error) {
    console.error("Error in getBriefsByAdvertiser:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




/**
 * @desc Get all briefs
 */
const getBriefs = async (req, res) => {
    try {
        const briefs = await Brief.find();
        res.status(200).json({ success: true, briefs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * @desc Get a single brief by ID
 */
const getBriefById = async (req, res) => {
    try {
        const brief = await Brief.findById(req.params.id).populate("advertiserId", "name companyName");
        if (!brief) return res.status(404).json({ success: false, message: "Brief not found" });
        res.status(200).json({ success: true, brief });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * @desc Update a brief
 */
const updateBrief = async (req, res) => {
    try {
        const { id } = req.params;
        const { validationStatus, status } = req.body;

        // Find the existing brief
        const brief = await Brief.findById(id);
        if (!brief) return res.status(404).json({ success: false, message: "Brief not found" });

        // Find the advertiser
        const advertiser = await Advertiser.findById(brief.advertiserId);
        if (!advertiser) return res.status(404).json({ success: false, message: "Advertiser not found" });

        // Store old values to check for changes
        const oldValidationStatus = brief.validationStatus;
        const oldStatus = brief.status;

        // Update the brief
        const updatedBrief = await Brief.findByIdAndUpdate(id, req.body, { new: true });

        // Send notification if validationStatus changed
        if (validationStatus && validationStatus !== oldValidationStatus) {
            sendNotification(`Your brief validation status changed to: ${validationStatus}`, advertiser._id);
        }

        // Send notification if status changed
        if (status && status !== oldStatus) {
            sendNotification(`Your brief status changed to: ${status}`, advertiser._id);
        }

        res.status(200).json({ success: true, message: "Brief updated", brief: updatedBrief });
    } catch (error) {
        console.error("Error updating brief:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc Delete a brief
 */
const deleteBrief = async (req, res) => {
    try {
        const deletedBrief = await Brief.findByIdAndDelete(req.params.id);
        if (!deletedBrief) return res.status(404).json({ success: false, message: "Brief not found" });
        res.status(200).json({ success: true, message: "Brief deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    createBrief,
    getBriefs,
    getBriefById,
    getBriefsByAdvertiser,
    updateBrief,
    deleteBrief
};
