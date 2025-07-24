require('dotenv').config();

const AI_SERVICES_CONFIG = {
  // Remove.bg API for background removal
  removeBg: {
    apiKey: process.env.REMOVE_BG_API_KEY,
    baseUrl: 'https://api.remove.bg/v1.0',
    enabled: !!process.env.REMOVE_BG_API_KEY
  },

  // Cloudinary for image processing
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    enabled: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
  },

  // Replicate API for style transfer and AI models
  replicate: {
    apiToken: process.env.REPLICATE_API_TOKEN,
    baseUrl: 'https://api.replicate.com/v1',
    enabled: !!process.env.REPLICATE_API_TOKEN
  },

  // Hugging Face API for additional AI models
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY,
    baseUrl: 'https://api-inference.huggingface.co/models',
    enabled: !!process.env.HUGGINGFACE_API_KEY
  }
};

module.exports = AI_SERVICES_CONFIG; 