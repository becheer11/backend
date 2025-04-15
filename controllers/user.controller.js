const User = require("../models/user.model.js");
const Creator = require("../models/creator.model.js");
const Advertiser = require("../models/advertiser.model.js");
const { cloudinaryUploadFile, cloudinaryRemoveImage } = require("../utils/cloudinary");





const GetUser = async (req, res) => {
  console.log("Inside GetUser");

  try {
    const userId = req.userId; // Set by verifyToken middleware
    const userRecord = await User.findById(userId).select("-password");

    if (!userRecord) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let additionalData = {};
    
    // Check if the user is an Influencer (Creator)
    if (userRecord.roles.includes("Influencer")) {
      const creator = await Creator.findOne({ userId: userId });
      if (creator) {
        additionalData.creator = creator;
      }
    }

    // Check if the user is a Brand (Advertiser)
    if (userRecord.roles.includes("Brand")) {
      const advertiser = await Advertiser.findOne({ userId: userId });
      if (advertiser) {
        additionalData.advertiser = advertiser;
      }
    }

    console.log("User Record:", userRecord);
    return res.status(200).json({
      success: true,
      userProfile: { ...userRecord.toObject(), ...additionalData }, // Merge the user data with additional data
    });

  } catch (err) {
    console.error("GetUser Error:", err);
    return res.status(500).json({ success: false, message: "Could not verify identity" });
  }
};

const updateProfile = async (req, res) => {
  const { username, firstName, lastName, description, tags, keywords, instagram, tiktok, instafollowers, tiktokfollowers, companyName, website, address, industry } = req.body;
  const userId = req.userId;

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("User Data Before Update:", user);

    // Update user fields
    user.username = username || user.username;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.description = description || user.description;
    user.tags = tags || user.tags;
    user.keywords = keywords || user.keywords;

    // Handle profile photo upload (Cloudinary integration)
    if (req.file) {
      console.log("Received Profile Photo:", req.file); // Log the uploaded file

      // If the photo is different, update
      if (user.profilePhoto?.publicId) {
        console.log("Removing old profile photo...");
        await cloudinaryRemoveImage(user.profilePhoto.publicId); // Remove the old image
      }

      const uploadedPhoto = await cloudinaryUploadFile(req.file.path); // Use file path from multer
      user.profilePhoto = {
        url: uploadedPhoto.secure_url,
        publicId: uploadedPhoto.public_id,
        resourceType: uploadedPhoto.resource_type,
      };

      console.log("Updated Profile Photo:", user.profilePhoto);
    }

    // Save updated user profile
    const savedUser = await user.save();
    console.log("Saved User:", savedUser);

    // Check if the user is an influencer or advertiser and update accordingly
    if (user.roles.includes("Influencer")) {
      const creator = await Creator.findOne({ userId: userId });
      if (creator) {
        console.log("Updating Influencer Data...");
        creator.socialLinks.instagram = instagram;
        creator.socialLinks.tiktok = tiktok;
        creator.audience.instafollowers = instafollowers;
        creator.audience.tiktokfollowers = tiktokfollowers;

        await creator.save();
      }
    }

    if (user.roles.includes("Brand")) {
      const advertiser = await Advertiser.findOne({ userId: userId });
      if (advertiser) {
        console.log("Updating Brand Data...");
        advertiser.companyName = companyName || advertiser.companyName;
        advertiser.website = website || advertiser.website;
        advertiser.address = address || advertiser.address;
        advertiser.industry = industry || advertiser.industry;

        await advertiser.save();
      }
    }

    res.status(200).json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
module.exports = { GetUser,updateProfile };