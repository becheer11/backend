const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const { generateTokenAndSetCookie } = require("../utils/generateTokenAndSetCookie.js");
const { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } = require("../mailtrap/emails.js");
const User = require("../models/user.model.js");
const Advertiser = require("../models/advertiser.model.js");
const Creator = require("../models/creator.model.js");

const signupAdmin = async (req, res) => {
    const { email, password, username, role } = req.body;
    try {
        if (!email || !password || !username || !role) {
            throw new Error("All fields are required");
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const user = new User({ email, password: hashedPassword, username, role, isVerified: true });
        await user.save();

        generateTokenAndSetCookie(res, user._id);

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            user: { ...user._doc, password: undefined },

        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const signupAdvertiser = async (req, res) => {
    const { email, password, username,companyName, website, address, industry } = req.body;
    try {
        if (!email || !password || !username ) {
            throw new Error("All required fields must be filled");
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            email,
            password: hashedPassword,
            username,
            roles: "Brand",
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });

        await user.save();
        
        const advertiser = new Advertiser({
            _id: user._id, 
            userId: user._id,
            companyName,
            website,
            address,
            industry
        });
        await advertiser.save();

        generateTokenAndSetCookie(res, user._id);
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "Advertiser registered successfully",
            user: { ...user._doc, password: undefined },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const signupCreator = async (req, res) => {
    const { email, password, username, instagram, tiktok, instafollowers, tiktokfollowers } = req.body;
    try {
        if (!email || !password || !username) {
            throw new Error("All required fields must be filled");
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            email,
            password: hashedPassword,
            username,
            roles: "Influencer",
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });

        await user.save();
        
        const creator = new Creator({
            _id: user._id, 
            userId: user._id,
            socialLinks: { instagram, tiktok },
            audience: { instafollowers, tiktokfollowers }
        });
        await creator.save();

        generateTokenAndSetCookie(res, user._id);
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "Creator registered successfully",
            user: { ...user._doc, password: undefined },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
      }
  
      const user = await User.findOne({ email }).select("email password roles username isVerified");
  
      if (!user) {
        return res.status(404).json({ success: false, message: "No account found with this email." });
      }
  
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Incorrect password. Please try again." });
      }
  
      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email before logging in. Check your inbox for the code.",
        });
      }
  
      generateTokenAndSetCookie(res, user._id);
  
      const userPayload = {
        ...user._doc,
        password: undefined,
        roles: Array.isArray(user.roles) ? user.roles : [user.roles],
      };
  
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: userPayload,
      });
    } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
  };
  



const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

const verifyEmail = async (req, res) => {
    const { code } = req.body;
  
    try {
      if (!code) {
        return res.status(400).json({
          success: false,
          message: "Verification code is required",
        });
      }
  
      // Find user with matching token that is still valid
      const user = await User.findOne({
        verificationToken: code,
        verificationTokenExpiresAt: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification code",
        });
      }
  
      // Mark user as verified
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpiresAt = undefined;
  
      await user.save();
  
      // Optional: send a welcome email
     await sendWelcomeEmail(user.email, user.username)
  
      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
        user: {
          ...user._doc,
          password: undefined,
        },
      });
    } catch (error) {
      console.error("verifyEmail error:", error); // <- Logs full stack trace
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };
  

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        console.log("Error in forgotPassword", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

       await sendResetSuccessEmail(user.email);

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.log("Error in resetPassword", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in checkAuth", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    signupAdmin,
    signupAdvertiser,
    signupCreator,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    checkAuth
};
