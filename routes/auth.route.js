const express = require("express");
const {
    login,
    logout,
    signupAdmin,
    signupAdvertiser,
    signupCreator,
    verifyEmail,
    forgotPassword,
    resetPassword,
    checkAuth
} = require("../controllers/auth.controller.js");
const  {verifyToken }= require("../middleware/verifyToken.js");
const mediaUpload = require("../middleware/mediaUpload");

const router = express.Router();

// Vérification de l'authentification
router.get("/check-auth", verifyToken, checkAuth);


// Routes d'inscription
router.post("/signup/admin", signupAdmin);
router.post("/signup/brand", signupAdvertiser);
router.post("/signup/influencer", signupCreator);

// Authentification
router.post("/login", login);
router.post("/logout", logout);

// Vérification et gestion des mots de passe
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
