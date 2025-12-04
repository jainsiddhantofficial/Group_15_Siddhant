// server/src/controllers/rfq.controller.js
const db = require('../config/db');

async function createRFQ(req, res) {
  try {
    const userId = req.user.id;
    const { productId, quantity, notes } = req.body;
    const [result] = await db.query('INSERT INTO rfqs (buyer_id, product_id, quantity, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?)', [userId, productId, quantity, notes||null, 'open', new Date()]);
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('createRFQ', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function listMyRFQs(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await db.query('SELECT r.*, p.name AS productName FROM rfqs r LEFT JOIN products p ON p.id = r.product_id WHERE r.buyer_id = ? ORDER BY r.created_at DESC', [userId]);
    return res.json(rows);
  } catch (err) {
    console.error('listMyRFQs', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function listAllRFQs(req, res) {
  try {
    const [rows] = await db.query('SELECT r.*, u.business_name as buyerName, p.name as productName FROM rfqs r JOIN users u ON u.id = r.buyer_id LEFT JOIN products p ON p.id = r.product_id ORDER BY r.created_at DESC');
    return res.json(rows);
  } catch (err) {
    console.error('listAllRFQs', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function respondToRFQ(req, res) {
  try {
    const id = req.params.id;
    const { price, comment } = req.body;
    await db.query('UPDATE rfqs SET status = ?, response_price = ?, response_comment = ?, responded_at = ? WHERE id = ?', ['responded', price || null, comment || null, new Date(), id]);
    return res.json({ message: 'Responded' });
  } catch (err) {
    console.error('respondToRFQ', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createRFQ, listMyRFQs, listAllRFQs, respondToRFQ };
