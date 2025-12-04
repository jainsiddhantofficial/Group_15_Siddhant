// server/src/controllers/auth.controller.js
const db = require('../config/db'); // mysql2 promise pool
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '7d';

async function register(req, res) {
  try {
    const { name, email, password, role = 'retailer', businessName, gst } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });

    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) return res.status(400).json({ message: 'email already registered' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const now = new Date();

    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, role, business_name, gst, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name||null, email, hash, role, businessName||null, gst||null, role === 'admin' ? 'active' : 'pending', now]
    );

    const userId = result.insertId;
    return res.status(201).json({ id: userId, email, role });
  } catch (err) {
    console.error('register err', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });

    const [rows] = await db.query('SELECT id, password_hash, role, status FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ message: 'Invalid credentials' });

    const user = rows[0];
    if (user.status === 'pending') return res.status(403).json({ message: 'Account pending approval' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, user: { id: user.id, role: user.role } });
  } catch (err) {
    console.error('login err', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function logout(req, res) {
  // For stateless JWTs there's nothing to do server-side unless you maintain blacklist.
  return res.json({ message: 'logged out' });
}

async function verifyAccount(req, res) {
  // Example: store uploaded KYC doc path and mark status pending review
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    // expecting file upload handled by multer (req.file) and additional fields
    const kycPath = req.file ? req.file.path : null;
    await db.query('UPDATE users SET kyc_doc = ?, status = ? WHERE id = ?', [kycPath, 'pending', userId]);
    return res.json({ message: 'KYC uploaded, pending approval' });
  } catch (err) {
    console.error('verifyAccount err', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// stubs for forgot/reset (optional)
async function forgotPassword(req, res) {
  // implement email token generation & storage
  return res.status(200).json({ message: 'If account exists, reset link will be sent' });
}
async function resetPassword(req, res) {
  // validate token & update hashed password
  return res.status(200).json({ message: 'Password reset' });
}

module.exports = { register, login, logout, verifyAccount, forgotPassword, resetPassword };
