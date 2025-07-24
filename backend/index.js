require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/session');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const emailRoutes = require('./routes/email');
const sharedRoutes = require('./routes/shared');
const plansRoutes = require('./routes/plans');
const decorsRoutes = require('./routes/decors');
const usersRoutes = require('./routes/users');
const imageRoutes = require('./routes/image');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Auth routes
app.use('/api/auth', authRoutes);
// Session routes
app.use('/api', sessionRoutes);
// AI routes
app.use('/api/ai', aiRoutes);
// Admin routes
app.use('/api/admin', adminRoutes);
// Email routes
app.use('/api/email', emailRoutes);
// Shared routes
app.use('/api/shared', sharedRoutes);
// Plans routes
app.use('/api/plans', plansRoutes);
// Decors routes
app.use('/api', decorsRoutes);
// Users routes
app.use('/api/users', usersRoutes);
// Image routes
app.use('/api/images', imageRoutes);

// Scheduled cleanup: delete unverified users whose code has expired
setInterval(async () => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM users WHERE is_verified = 0 AND code_expires_at IS NOT NULL AND code_expires_at < NOW()"
    );
    if (result.affectedRows > 0) {
      console.log(`[CLEANUP] Deleted ${result.affectedRows} unverified users with expired codes.`);
    }
  } catch (err) {
    console.error('[CLEANUP ERROR] Failed to delete expired unverified users:', err);
  }
}, 5 * 60 * 1000); // Every 5 minutes

app.get('/', (req, res) => {
  res.send('Wallora Server Running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});