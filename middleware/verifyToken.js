const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Advertiser = require("../models/advertiser.model");

// Middleware général pour vérifier le token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });

    req.userId = decoded.userId; // Correction ici
    next();
  } catch (error) {
    console.error("Error in verifyToken:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Vérification pour les Admins uniquement
const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, async () => {
    try {
      const user = await User.findById(req.userId).select("roles");
      if (user && user.roles.includes("Admin")) {
        next();
      } else {
        return res.status(403).json({ message: "Not allowed, Admins only." });
      }
    } catch (error) {
      return res.status(500).json({ message: "Server error." });
    }
  });
};

// Vérification pour les Créateurs (Influencers) et Admins
const verifyTokenAndCreator = (req, res, next) => {
  verifyToken(req, res, async () => {
    try {
      const user = await User.findById(req.userId).select("roles");
      if (user && (user.roles.includes("Influencer") || user.roles.includes("Admin"))) {
        next();
      } else {
        return res.status(403).json({ message: "Not allowed, only Influencers or Admins." });
      }
    } catch (error) {
      return res.status(500).json({ message: "Server error." });
    }
  });
};

// Vérification pour les Advertisers et Admins
const verifyTokenAndAdvertiser = (req, res, next) => {
  verifyToken(req, res, async () => {
    try {
      const user = await User.findById(req.userId).select("roles");
      if (user && (user.roles.includes("Brand") || user.roles.includes("Admin"))) { {
        next();
      }} else {
        return res.status(403).json({ message: "Not allowed, only Advertisers or Admins." });
      }
    } catch (error) {
      return res.status(500).json({ message: "Server error." });
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndCreator,
  verifyTokenAndAdvertiser,
};
