const cloudinary = require("cloudinary").v2;

const getEnv = (key) => (process.env[key] || "").trim();

const cloudName = getEnv("CLOUDINARY_CLOUD_NAME");
const apiKey = getEnv("CLOUDINARY_API_KEY");
const apiSecret = getEnv("CLOUDINARY_API_SECRET");

const isCloudinaryConfigured = !!cloudName && !!apiKey && !!apiSecret;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
};
