const path = require("path");
const multer = require("multer");

const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images")); // Create /uploads if not exists
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname);
  },
});

const mediaUpload = multer({
  storage: mediaStorage,
  fileFilter: function (req, file, cb) {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime", // .mov
      "video/x-matroska", // .mkv
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format" }, false);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

module.exports = mediaUpload;
