const express = require('express');
const pool = require('../db');

const router = express.Router();

// Get all plans
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM plans ORDER BY price ASC');
    // Parse features JSON for each plan
    const plans = rows.map(plan => ({
      ...plan,
      features: Array.isArray(plan.features)
        ? plan.features
        : (typeof plan.features === 'string' ? JSON.parse(plan.features) : []),
    }));
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plans', details: err.message });
  }
});

// Create a new plan
router.post('/', async (req, res) => {
  try {
    const { name, price, features, session_limit, edit_image_enabled, tools_enabled, export_enabled, max_decors } = req.body;
    if (!name || typeof price !== 'number' || !Array.isArray(features) || typeof session_limit !== 'number') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const [result] = await pool.query(
      'INSERT INTO plans (name, price, features, session_limit, edit_image_enabled, tools_enabled, export_enabled, max_decors) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, price, JSON.stringify(features), session_limit, !!edit_image_enabled, !!tools_enabled, !!export_enabled, max_decors]
    );
    res.status(201).json({ id: result.insertId, name, price, features, session_limit, edit_image_enabled, tools_enabled, export_enabled, max_decors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create plan', details: err.message });
  }
});

// Update a plan
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, features, session_limit, edit_image_enabled, tools_enabled, export_enabled, max_decors } = req.body;
    if (!name || typeof price !== 'number' || !Array.isArray(features) || typeof session_limit !== 'number') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    await pool.query(
      'UPDATE plans SET name = ?, price = ?, features = ?, session_limit = ?, edit_image_enabled = ?, tools_enabled = ?, export_enabled = ?, max_decors = ? WHERE id = ?',
      [name, price, JSON.stringify(features), session_limit, !!edit_image_enabled, !!tools_enabled, !!export_enabled, max_decors, id]
    );
    res.json({ id, name, price, features, session_limit, edit_image_enabled, tools_enabled, export_enabled, max_decors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update plan', details: err.message });
  }
});

// Delete a plan
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM plans WHERE id = ?', [id]);
    res.json({ message: 'Plan deleted', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete plan', details: err.message });
  }
});

module.exports = router; 