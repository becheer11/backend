const mongoose = require("mongoose");

const advertiserSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true, 
        unique: true 
    },
    companyName: { type: String, required: true, trim: true }, 
    website: { type: String, trim: true }, 
    address: { type: String, trim: true }, 
    industry: { type: String, trim: true }, 
    briefs: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Brief" 
    }] // Liste des briefs liés à cet annonceur
}, { timestamps: true });

const Advertiser = mongoose.model("Advertiser", advertiserSchema);

module.exports = Advertiser;
