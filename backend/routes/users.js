const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/users?email=...
router.get('/', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email LIKE ?', [`%${email}%`]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router; 