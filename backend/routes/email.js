const express = require('express');
const router = express.Router();
const emailService = require('../services/email-service');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../db');

/**
 * Send welcome email (triggered on registration)
 */
router.post('/send-welcome', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    await emailService.sendWelcomeEmail(email, name);
    res.json({ message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ message: 'Failed to send welcome email' });
  }
});

/**
 * Request password reset
 */
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const resetToken = emailService.generateResetToken();
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, tokenExpiry, user.id]
    );

    // Send password reset email
    await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Failed to send password reset email' });
  }
});

/**
 * Reset password with token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Find user with valid reset token
    const [users] = await pool.execute(
      'SELECT id, name, email FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = users[0];

    // Hash new password
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await pool.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

/**
 * Send activity alert email
 */
router.post('/send-activity-alert', authenticateToken, async (req, res) => {
  try {
    const { activityType, activityDetails } = req.body;
    const userId = req.user.id;

    // Get user details
    const [users] = await pool.execute(
      'SELECT name, email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    await emailService.sendActivityAlert(
      user.email,
      user.name,
      activityType,
      activityDetails
    );

    res.json({ message: 'Activity alert email sent successfully' });
  } catch (error) {
    console.error('Error sending activity alert:', error);
    res.status(500).json({ message: 'Failed to send activity alert' });
  }
});

/**
 * Send newsletter to single user
 */
router.post('/send-newsletter', authenticateToken, async (req, res) => {
  try {
    const { newsletterContent } = req.body;
    const userId = req.user.id;

    // Get user details
    const [users] = await pool.execute(
      'SELECT name, email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    await emailService.sendNewsletter(
      user.email,
      user.name,
      newsletterContent
    );

    res.json({ message: 'Newsletter email sent successfully' });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    res.status(500).json({ message: 'Failed to send newsletter' });
  }
});

/**
 * Send bulk newsletter (admin only)
 */
router.post('/send-bulk-newsletter', authenticateToken, async (req, res) => {
  try {
    const { newsletterContent } = req.body;
    const userId = req.user.id;

    // Check if user is admin
    const [users] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get all active users
    const [allUsers] = await pool.execute(
      'SELECT name, email FROM users WHERE is_active = 1 AND email IS NOT NULL'
    );

    if (allUsers.length === 0) {
      return res.status(404).json({ message: 'No active users found' });
    }

    await emailService.sendBulkNewsletter(allUsers, newsletterContent);

    res.json({ 
      message: 'Bulk newsletter sent successfully',
      count: allUsers.length
    });
  } catch (error) {
    console.error('Error sending bulk newsletter:', error);
    res.status(500).json({ message: 'Failed to send bulk newsletter' });
  }
});

/**
 * Send custom email
 */
router.post('/send-custom-email', authenticateToken, async (req, res) => {
  try {
    const { to, subject, htmlContent } = req.body;
    const userId = req.user.id;

    // Check if user is admin
    const [users] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!to || !subject || !htmlContent) {
      return res.status(400).json({ message: 'To, subject, and HTML content are required' });
    }

    await emailService.sendCustomEmail(to, subject, htmlContent);

    res.json({ message: 'Custom email sent successfully' });
  } catch (error) {
    console.error('Error sending custom email:', error);
    res.status(500).json({ message: 'Failed to send custom email' });
  }
});

/**
 * Test email service
 */
router.post('/test-email', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    await emailService.sendWelcomeEmail(email, name || 'Test User');
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ message: 'Failed to send test email' });
  }
});

module.exports = router; 