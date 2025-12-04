// server/src/controllers/user.controller.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

async function getMyProfile(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await db.query('SELECT id, name, email, role, business_name AS businessName, gst, status FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('getMyProfile', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateMyProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, businessName, gst } = req.body;
    await db.query('UPDATE users SET name = ?, business_name = ?, gst = ? WHERE id = ?', [name||null, businessName||null, gst||null, userId]);
    return res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('updateMyProfile', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Admin user management
async function listUsers(req, res) {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, business_name AS businessName, status, created_at FROM users');
    return res.json(rows);
  } catch (err) {
    console.error('listUsers', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getUserById(req, res) {
  try {
    const id = req.params.id;
    const [rows] = await db.query('SELECT id, name, email, role, business_name AS businessName, gst, status FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('getUserById', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateUserRole(req, res) {
  try {
    const id = req.params.id;
    const { role } = req.body;
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return res.json({ message: 'Role updated' });
  } catch (err) {
    console.error('updateUserRole', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteUser(req, res) {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getMyProfile, updateMyProfile, listUsers, getUserById, updateUserRole, deleteUser };
