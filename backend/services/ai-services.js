const axios = require('axios');
const FormData = require('form-data');
const AI_CONFIG = require('../config/ai-services');

class AIServices {
  constructor() {
    this.config = AI_CONFIG;
  }

  // Background Removal using Remove.bg API
  async removeBackground(imageBuffer, filename) {
    if (!this.config.removeBg.enabled) {
      throw new Error('Remove.bg API not configured');
    }
    try {
      const formData = new FormData();
      formData.append('image_file', imageBuffer, {
        filename: filename,
        contentType: 'image/jpeg'
      });
      formData.append('size', 'auto');
      const response = await axios.post(
        `${this.config.removeBg.baseUrl}/removebg`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'X-Api-Key': this.config.removeBg.apiKey
          },
          responseType: 'arraybuffer'
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error('Failed to remove background');
    }
  }
}

module.exports = new AIServices(); 