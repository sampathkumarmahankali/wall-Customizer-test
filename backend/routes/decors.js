const express = require('express');
const pool = require('../db');
const { uploadImage, getPresignedUrl, deleteImage } = require('../services/s3-service');
const multer = require('multer');
const upload = multer();

const router = express.Router();

// --- Decor Categories ---
router.get('/decor-categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM decor_categories ORDER BY name ASC');
    res.json({ categories: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
});

router.post('/decor-categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name required' });
    const [result] = await pool.query('INSERT INTO decor_categories (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add category', details: err.message });
  }
});

router.put('/decor-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name required' });
    await pool.query('UPDATE decor_categories SET name = ? WHERE id = ?', [name, id]);
    res.json({ id, name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category', details: err.message });
  }
});

router.delete('/decor-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM decor_categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category', details: err.message });
  }
});

// --- Decors ---
// Get decors (return S3 URL if available)
router.get('/decors', async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = 'SELECT d.*, c.name as category_name FROM decors d JOIN decor_categories c ON d.category_id = c.id';
    let params = [];
    if (category_id) {
      query += ' WHERE d.category_id = ?';
      params.push(category_id);
    }
    query += ' ORDER BY d.name ASC';
    const [rows] = await pool.query(query, params);
    // Attach S3 URL if available
    const decors = rows.map(decor => {
      let imageUrl = null;
      if (decor.image_s3_key) {
        imageUrl = getPresignedUrl(decor.image_s3_key);
      }
      return { ...decor, imageUrl };
    });
    res.json({ decors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch decors', details: err.message });
  }
});

// Create decor (S3)
router.post('/decors', upload.single('image'), async (req, res) => {
  try {
    const { name, category_id, is_active } = req.body;
    if (!name || !category_id || !req.file) return res.status(400).json({ error: 'Missing required fields' });
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    // Upload to S3
    const s3Key = await uploadImage(req.file.buffer, req.file.mimetype);
    const [result] = await pool.query('INSERT INTO decors (name, category_id, image_s3_key, is_active) VALUES (?, ?, ?, ?)', [name, category_id, s3Key, is_active !== undefined ? is_active : true]);
    res.status(201).json({ id: result.insertId, name, category_id, image_s3_key: s3Key, is_active, imageUrl: getPresignedUrl(s3Key) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add decor', details: err.message });
  }
});

// Update decor (S3)
router.put('/decors/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, is_active } = req.body;
    if (!name || !category_id) return res.status(400).json({ error: 'Missing required fields' });
    let s3Key = null;
    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type' });
      }
      // Get previous S3 key
      const [[decor]] = await pool.query('SELECT image_s3_key FROM decors WHERE id = ?', [id]);
      if (decor && decor.image_s3_key) {
        await deleteImage(decor.image_s3_key);
      }
      s3Key = await uploadImage(req.file.buffer, req.file.mimetype);
    }
    let query = 'UPDATE decors SET name = ?, category_id = ?';
    let params = [name, category_id];
    if (s3Key) {
      query += ', image_s3_key = ?';
      params.push(s3Key);
    }
    if (is_active !== undefined) {
      query += ', is_active = ?';
      params.push(is_active);
    }
    query += ' WHERE id = ?';
    params.push(id);
    await pool.query(query, params);
    res.json({ id, name, category_id, image_s3_key: s3Key, is_active, imageUrl: s3Key ? getPresignedUrl(s3Key) : undefined });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update decor', details: err.message });
  }
});

// Delete decor (remove image from S3)
router.delete('/decors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Get S3 key before deleting
    const [[decor]] = await pool.query('SELECT image_s3_key FROM decors WHERE id = ?', [id]);
    if (decor && decor.image_s3_key) {
      await deleteImage(decor.image_s3_key);
    }
    await pool.query('DELETE FROM decors WHERE id = ?', [id]);
    res.json({ message: 'Decor deleted', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete decor', details: err.message });
  }
});

module.exports = router; 