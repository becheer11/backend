const User = require("../models/user.model.js");

const GetUser = async (req, res) => {
  console.log("Inside GetUser");

  try {
    const userId = req.userId; // Set by verifyToken middleware
    const userRecord = await User.findById(userId).select("-password");

    if (!userRecord) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("User Record:", userRecord);
    return res.status(200).json({ success: true, userProfile: userRecord });
  } catch (err) {
    console.error("GetUser Error:", err);
    return res.status(500).json({ success: false, message: "Could not verify identity" });
  }
};

module.exports = { GetUser };