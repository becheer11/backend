const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },
		username: { type: String, required: true, trim: true },
        firstName: { type: String, trim: true },
        lastName: { type: String,trim: true },
        categories: [{ type: String, index: true }],
        tags: [{ type: String, index: true }],
        profilePhoto:  {
            type: Object,
            default: {
      url: "",
      publicId: null,
      resourceType: "image", 
          }
        },
        description: { type: String, trim: true },

        roles: [{ type: String, enum: ["Admin", "Influencer", "Brand"] }],

        lastLogin: {
            type: Date,
            default: Date.now,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
		registeredAt: { type: Date, default: Date.now }, 
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpiresAt: { type: Date, select: false },
        verificationToken: { type: String, select: false },
        verificationTokenExpiresAt: { type: Date, select: false },
        hasActions: { type: Boolean, default: false },
        hasUpdatedProfile: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Indexation pour améliorer les performances des recherches
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);
