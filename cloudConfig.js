const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Use CloudinaryStorage from v2
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "STAYSPHERE",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

module.exports={cloudinary,storage};