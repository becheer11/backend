const Brief = require("../models/brief.model.js");
const Advertiser = require("../models/advertiser.model.js");
const { sendNotification } = require("./notification.controller.js");
const User = require("../models/user.model.js");
const { cloudinaryUploadFile  } = require("../utils/cloudinary");
const fs = require("fs");


/**
 * @desc Create a new brief with image or video attachment
 */
const createBrief = async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(req.userId);
    if (!advertiser) {
      return res.status(400).json({ success: false, message: "Advertiser not found" });
    }

    let attachmentData = {
      url: "",
      publicId: null,
      resourceType: "image",
    };

    if (req.file) {
      const filePath = req.file.path;
      const uploadedResult = await cloudinaryUploadFile(filePath);

      attachmentData = {
        url: uploadedResult.secure_url,
        publicId: uploadedResult.public_id,
        resourceType: uploadedResult.resource_type,
      };

      fs.unlinkSync(filePath);
    }

    // Properly parse array fields
    const parseArrayField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      try {
        return JSON.parse(field);
      } catch (e) {
        return Array.isArray(field) ? field : [field];
      }
    };

    // Create new brief with properly parsed arrays
    const newBrief = new Brief({
      advertiserId: advertiser._id,
      title: req.body.title,
      description: req.body.description,
      categories: parseArrayField(req.body.categories),
      phrases: parseArrayField(req.body.phrases),
      waitingForBrand: req.body.waitingForBrand ?? false,
      waitingForInfluencer: req.body.waitingForInfluencer ?? true,
      reviewDeadline: req.body.reviewDeadline,
      deadline: req.body.deadline,
      commentList: parseArrayField(req.body.commentList),
      tags: parseArrayField(req.body.tags),
      status: req.body.status ?? "no influencer assigned",
      numberOfRevisions: req.body.numberOfRevisions ?? 1,
      budget: req.body.budget,
      targetPlatform: req.body.targetPlatform,
      attachment: attachmentData,
      validationStatus: req.body.validationStatus ?? "pending",
    });

    await newBrief.save();

    res.status(201).json({ success: true, message: "Brief created successfully", brief: newBrief });
  } catch (error) {
    console.error("Error creating brief:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// The rest of your controller functions stay unchanged


const getBriefsByAdvertiser = async (req, res) => {
  try {
    // Find briefs by advertiserId and populate the related campaigns
    const briefs = await Brief.find({ advertiserId: req.userId })
      .populate("advertiserId", "companyName")  // Populate advertiserId to get companyName
      .populate({
        path: "advertiserId", // Populate userId inside advertiserId
        select: " userId profilePhoto",
        populate: { path: "userId", select: "profilePhoto" }
        // Select profilePhoto field from User
      });

    res.status(200).json({ success: true, briefs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



const getBriefs = async (req, res) => {
  try {
    const briefs = await Brief.find()
    .populate("advertiserId", "companyName")  // Populate advertiserId to get companyName
    .populate({
      path: "advertiserId", // Populate userId inside advertiserId
      select: " userId companyName profilePhoto",
      populate: { path: "userId", select: "profilePhoto" }
      // Select profilePhoto field from User
    });
    res.status(200).json({ success: true, briefs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getBriefById = async (req, res) => {
  try {
    const brief = await Brief.findById(req.params.id).populate("advertiserId", "companyName")  // Populate advertiserId to get companyName
    .populate({
      path: "advertiserId", // Populate userId inside advertiserId
      select: " userId profilePhoto",
      populate: { path: "userId", select: "profilePhoto" }
      // Select profilePhoto field from User
    });;
    if (!brief) return res.status(404).json({ success: false, message: "Brief not found" });
    res.status(200).json({ success: true, brief });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateBrief = async (req, res) => {
  try {
    const { id } = req.params;
    const { validationStatus, status } = req.body;

    const brief = await Brief.findById(id);
    if (!brief) {
      return res.status(404).json({ success: false, message: "Brief not found" });
    }

    const user = await User.findById(req.userId).select("roles");
    const isAdmin = user?.roles.includes("Admin");
    const isCreator = user?.roles.includes("Influencer");
    const isAdvertiser = req.userId.toString() === brief.advertiserId.toString();

    const oldStatus = brief.status;
    const oldValidationStatus = brief.validationStatus;

    const updatedBrief = await Brief.findByIdAndUpdate(id, req.body, { new: true });

    if (validationStatus && validationStatus !== oldValidationStatus) {
      await sendNotification(`Your brief validation status changed to: ${validationStatus}`, brief.advertiserId);
    }

    if (status && status !== oldStatus) {
      await sendNotification(`Your brief status changed to: ${status}`, brief.advertiserId);
    }

    return res.status(200).json({
      success: true,
      message: "Brief updated",
      brief: updatedBrief,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

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
  deleteBrief,
};
