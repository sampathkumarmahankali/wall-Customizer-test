const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

// Create or update a session
router.post('/sessions', async (req, res) => {
  try {
    let { userId, email, name, data, sessionId } = req.body;

    // If userId is missing, try to fetch it using email
    if ((!userId || userId === "null" || userId === "undefined") && email) {
      const [users] = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
      if (users.length === 0) {
        return res.status(400).json({ error: 'User not found for provided email' });
      }
      userId = users[0].id;
    }

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId and email' });
    }
    if (!data) {
      return res.status(400).json({ error: 'Missing session data' });
    }

    let sessionName = name && name.trim() ? name : null;
    let jsonString = JSON.stringify(data);

    if (sessionId) {
      // Update existing session
      const [rows] = await pool.query('SELECT * FROM edit_sessions WHERE id = ?', [sessionId]);
      if (!sessionName) sessionName = `session ${sessionId}`;
      if (rows.length === 0) return res.status(404).json({ error: 'Session not found' });
      await pool.query('UPDATE edit_sessions SET name = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [sessionName, jsonString, sessionId]);
      return res.json({ message: 'Session updated', sessionId });
    } else {
      // Create new session with UUID
      const newId = uuidv4();
      await pool.query('INSERT INTO edit_sessions (id, user_id, name, data) VALUES (?, ?, ?, ?)', [newId, userId, sessionName || `session ${newId}`, jsonString]);
      return res.json({ message: 'Session created', sessionId: newId });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all sessions for a user
router.get('/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query('SELECT id, name, updated_at FROM edit_sessions WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get a specific session by ID
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const [rows] = await pool.query('SELECT es.id, es.name, es.data, es.updated_at, es.user_id, u.email as creatorEmail FROM edit_sessions es JOIN users u ON es.user_id = u.id WHERE es.id = ?', [sessionId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Session not found' });
    const session = rows[0];
    let data = null;
    try {
      data = JSON.parse(session.data.toString('utf-8'));
    } catch (e) {
      data = null;
    }
    res.json({ id: session.id, name: session.name, data, updated_at: session.updated_at, user_id: session.user_id, creatorEmail: session.creatorEmail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete a session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await pool.query('DELETE FROM edit_sessions WHERE id = ?', [sessionId]);
    res.json({ message: 'Session deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 