const express = require('express');
const multer = require('multer');
const { uploadImage, getPresignedUrl } = require('../services/s3-service');
const axios = require('axios');

const upload = multer();
const router = express.Router();

// Upload image to S3
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const mimetype = req.file.mimetype;
    const key = await uploadImage(buffer, mimetype);
    // Save 'key' to your MySQL DB if needed
    res.json({ key });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload image', details: err.message });
  }
});

// Get pre-signed URL for an image
router.get('/url/:key', (req, res) => {
  try {
    const url = getPresignedUrl(req.params.key);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate pre-signed URL', details: err.message });
  }
});

// Proxy image from S3 to avoid CORS issues
router.get('/proxy-image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url');
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (err) {
    res.status(500).send('Failed to fetch image');
  }
});

module.exports = router; 