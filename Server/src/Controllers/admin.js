// server/src/controllers/admin.controller.js
const db = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    const [[{ usersPending }]] = await db.query('SELECT (SELECT COUNT(*) FROM users WHERE status = "pending") AS usersPending, (SELECT COUNT(*) FROM orders WHERE status = "processing") AS ordersProcessing');
    const [[{ lowStock }]] = await db.query('SELECT COUNT(*) as lowStock FROM inventory WHERE quantity <= reorder_threshold');
    return res.json({ usersPending: usersPending || 0, lowStock: lowStock || 0 });
  } catch (err) {
    console.error('getDashboardStats', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function approveAccount(req, res) {
  try {
    const id = req.params.id;
    await db.query('UPDATE users SET status = ? WHERE id = ?', ['active', id]);
    return res.json({ message: 'Approved' });
  } catch (err) {
    console.error('approveAccount', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function rejectAccount(req, res) {
  try {
    const id = req.params.id;
    const { reason } = req.body;
    await db.query('UPDATE users SET status = ?, reject_reason = ? WHERE id = ?', ['rejected', reason||null, id]);
    return res.json({ message: 'Rejected' });
  } catch (err) {
    console.error('rejectAccount', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function setCreditLimit(req, res) {
  try {
    const retailerId = req.params.retailerId;
    const { limit } = req.body;
    // upsert into credit_accounts
    await db.query('INSERT INTO credit_accounts (user_id, `limit`, used) VALUES (?, ?, COALESCE((SELECT used FROM credit_accounts WHERE user_id = ?), 0)) ON DUPLICATE KEY UPDATE `limit` = VALUES(`limit`)', [retailerId, limit, retailerId]);
    return res.json({ message: 'Credit set' });
  } catch (err) {
    console.error('setCreditLimit', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getCreditInfo(req, res) {
  try {
    const retailerId = req.params.retailerId;
    const [rows] = await db.query('SELECT user_id AS userId, `limit`, used FROM credit_accounts WHERE user_id = ?', [retailerId]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const acc = rows[0];
    acc.available = acc.limit - acc.used;
    return res.json(acc);
  } catch (err) {
    console.error('getCreditInfo', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function createGlobalTier(req, res) {
  try {
    // global tiers table optional: pricing_global_tiers (min_qty,max_qty,price,name)
    const { name, minQty, maxQty, price } = req.body;
    const [result] = await db.query('INSERT INTO pricing_global_tiers (name, min_qty, max_qty, price) VALUES (?, ?, ?, ?)', [name||null, minQty, maxQty||null, price]);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('createGlobalTier', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateGlobalTier(req, res) {
  try {
    const id = req.params.id;
    const { name, minQty, maxQty, price } = req.body;
    await db.query('UPDATE pricing_global_tiers SET name = ?, min_qty = ?, max_qty = ?, price = ? WHERE id = ?', [name||null, minQty, maxQty||null, price, id]);
    return res.json({ message: 'Updated' });
  } catch (err) {
    console.error('updateGlobalTier', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteGlobalTier(req, res) {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM pricing_global_tiers WHERE id = ?', [id]);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteGlobalTier', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getDashboardStats, approveAccount, rejectAccount, setCreditLimit, getCreditInfo,
  createGlobalTier, updateGlobalTier, deleteGlobalTier
};
