const express = require('express');
const multer = require('multer');
const router = express.Router();
const aiServices = require('../services/ai-services');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Background removal endpoint
router.post('/remove-background', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await aiServices.removeBackground(
      req.file.buffer,
      req.file.originalname
    );

    // Convert result to base64 for frontend
    const base64Result = result.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Result}`;

    res.json({
      success: true,
      image: dataUrl,
      message: 'Background removed successfully'
    });
  } catch (error) {
    console.error('Background removal error:', error);
    res.status(500).json({
      error: 'Failed to remove background',
      details: error.message
    });
  }
});

// Generate layout suggestions
router.post('/layout-suggestions', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const { wallWidth = 600, wallHeight = 400 } = req.body;
    const wallSize = { width: parseInt(wallWidth), height: parseInt(wallHeight) };

    const images = req.files.map((file, index) => ({
      id: index + 1,
      buffer: file.buffer,
      originalname: file.originalname
    }));

    const suggestions = await aiServices.generateLayoutSuggestions(images, wallSize);

    res.json({
      success: true,
      suggestions: suggestions,
      message: 'Layout suggestions generated successfully'
    });
  } catch (error) {
    console.error('Layout suggestions error:', error);
    res.status(500).json({
      error: 'Failed to generate layout suggestions',
      details: error.message
    });
  }
});

// Get AI service status
router.get('/status', (req, res) => {
  const status = {
    removeBg: aiServices.config.removeBg.enabled,
    replicate: aiServices.config.replicate.enabled,
    huggingface: aiServices.config.huggingface.enabled,
    cloudinary: aiServices.config.cloudinary.enabled
  };

  res.json({
    success: true,
    status: status,
    message: 'AI services status retrieved'
  });
});

module.exports = router; 