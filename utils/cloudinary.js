const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUploadFile = async (fileToUpload) => {
  try {
    const result = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: "auto", // Detects image or video
    });
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Cloudinary upload failed");
  }
};

const cloudinaryRemoveImage = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete from Cloudinary");
  }
};

const cloudinaryRemoveMultipleImage = async (publicIds) => {
  try {
    return await cloudinary.api.delete_resources(publicIds);
  } catch (error) {
    console.error("Cloudinary multiple delete error:", error);
    throw new Error("Failed to delete multiple files");
  }
};

module.exports = {
  cloudinaryUploadFile,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImage,
};


