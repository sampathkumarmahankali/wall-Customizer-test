const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { generateToken, authenticateToken } = require('../middleware/auth');
const emailService = require('../services/email-service');
const { uploadImage, getPresignedUrl, deleteImage } = require('../services/s3-service');
const multer = require('multer');
const upload = multer();

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate 6-digit verification code and expiry (10 min)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Insert new user with verification code
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, verification_code, code_expires_at, is_verified) VALUES (?, ?, ?, ?, ?, 0)',
      [name, email, hashedPassword, code, codeExpiresAt]
    );

    // Send verification code email
    emailService.sendVerificationCode(email, name, code).catch(error => {
      console.error('Error sending verification code email:', error);
    });

    res.status(201).json({
      message: 'User registered successfully. Please check your email for the verification code.',
      userId: result.insertId,
      user: {
        id: result.insertId,
        name: name,
        email: email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const result = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const [users] = result;

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Only allow login if user is verified
    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last_login timestamp
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Update password endpoint
router.post('/update-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Validate input
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Verify current password using bcrypt
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidCurrentPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password using bcrypt
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedNewPassword, email]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Password update failed' });
  }
});

// Verify password endpoint
router.post('/verify-password', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    res.json({
      isValid: isValidPassword,
      message: isValidPassword ? 'Password is correct' : 'Password is incorrect'
    });
  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({ message: 'Password verification failed' });
  }
});

// Protected route to get user profile (return S3 URL if available)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, profile_photo_s3_key, role, subscription_status, is_active, plan FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = users[0];
    let profilePhotoUrl = null;
    if (user.profile_photo_s3_key) {
      profilePhotoUrl = getPresignedUrl(user.profile_photo_s3_key);
    }
    res.json({
      user: {
        ...user,
        profilePhotoUrl
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Verify token endpoint
router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({
    message: 'Token is valid',
    user: req.user
  });
});

router.get('/userid-by-email/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const [users] = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ userId: users[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Upload profile photo endpoint (S3)
router.post('/upload-profile-photo', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type' });
    }
    // Get previous S3 key
    const [[user]] = await pool.query('SELECT profile_photo_s3_key FROM users WHERE id = ?', [userId]);
    if (user && user.profile_photo_s3_key) {
      await deleteImage(user.profile_photo_s3_key);
    }
    // Upload to S3
    const s3Key = await uploadImage(req.file.buffer, req.file.mimetype);
    // Store S3 key in DB
    await pool.execute(
      'UPDATE users SET profile_photo_s3_key = ? WHERE id = ?',
      [s3Key, userId]
    );
    res.json({
      message: 'Profile photo uploaded successfully',
      profilePhotoS3Key: s3Key,
      profilePhotoUrl: getPresignedUrl(s3Key)
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ message: 'Failed to upload profile photo' });
  }
});

// Remove profile photo endpoint (S3)
router.delete('/remove-profile-photo', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Remove S3 key from DB
    await pool.execute(
      'UPDATE users SET profile_photo_s3_key = NULL WHERE id = ?',
      [userId]
    );
    res.json({
      message: 'Profile photo removed successfully',
      profilePhoto: null
    });
  } catch (error) {
    console.error('Profile photo removal error:', error);
    res.status(500).json({ message: 'Failed to remove profile photo' });
  }
});

// List all users (for sharing)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT id, name, email FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user plan endpoint (now ensures only one request per user)
router.post('/update-plan', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;
    if (!plan || !['premium', 'ultra'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan' });
    }
    // Check for any existing request for this user
    const [existing] = await pool.execute('SELECT id FROM plan_change_requests WHERE user_id = ?', [userId]);
    if (existing.length > 0) {
      // Update the existing request to pending and set the new plan
      await pool.execute('UPDATE plan_change_requests SET requested_plan = ?, status = "pending", updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', [plan, userId]);
      return res.json({ message: 'Plan change request updated. Waiting for admin approval.' });
    }
    // Create plan change request
    await pool.execute('INSERT INTO plan_change_requests (user_id, requested_plan, status) VALUES (?, ?, "pending")', [userId, plan]);
    res.json({ message: 'Plan change request submitted. Waiting for admin approval.' });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Failed to request plan change' });
  }
});

// Email verification endpoint
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }
    // Find user by email
    const [users] = await pool.execute(
      'SELECT id, verification_code, code_expires_at, is_verified FROM users WHERE email = ?',
      [email]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = users[0];
    if (user.is_verified) {
      return res.status(400).json({ message: 'User already verified' });
    }
    if (!user.verification_code || !user.code_expires_at) {
      return res.status(400).json({ message: 'No verification code found. Please register again.' });
    }
    if (user.verification_code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    if (new Date() > new Date(user.code_expires_at)) {
      return res.status(400).json({ message: 'Verification code expired' });
    }
    // Mark user as verified
    await pool.execute(
      'UPDATE users SET is_verified = 1, verification_code = NULL, code_expires_at = NULL WHERE email = ?',
      [email]
    );
    // Send welcome email after successful verification
    emailService.sendWelcomeEmail(email, user.name || email).catch(error => {
      console.error('Error sending welcome email after verification:', error);
    });
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Email verification failed' });
  }
});

// Check if user is verified
router.get('/check-verified', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email required' });
  const [users] = await pool.execute('SELECT is_verified FROM users WHERE email = ?', [email]);
  if (users.length === 0) return res.status(404).json({ message: 'User not found' });
  res.json({ is_verified: !!users[0].is_verified });
});

// Resend verification code endpoint
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    // Find user
    const [users] = await pool.execute('SELECT id, name, is_verified FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = users[0];
    if (user.is_verified) {
      return res.status(400).json({ message: 'User is already verified' });
    }
    // Generate new code and expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await pool.execute('UPDATE users SET verification_code = ?, code_expires_at = ? WHERE email = ?', [code, codeExpiresAt, email]);
    // Send code
    emailService.sendVerificationCode(email, user.name || email, code).catch(error => {
      console.error('Error resending verification code:', error);
    });
    res.json({ message: 'Verification code resent successfully' });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ message: 'Failed to resend verification code' });
  }
});

// Get current user's pending plan change request
router.get('/user/plan-change-request', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute('SELECT requested_plan, status FROM plan_change_requests WHERE user_id = ? AND status = "pending" LIMIT 1', [userId]);
    if (rows.length > 0) {
      res.json({ request: rows[0] });
    } else {
      res.json({ request: null });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plan change request' });
  }
});

module.exports = router; 