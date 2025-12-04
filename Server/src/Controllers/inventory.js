// server/src/controllers/inventory.controller.js
const db = require('../config/db');

async function listInventory(req, res) {
  try {
    const [rows] = await db.query(`SELECT i.product_id AS productId, p.sku, p.name, i.quantity, i.reorder_threshold AS reorderThreshold
      FROM inventory i JOIN products p ON p.id = i.product_id ORDER BY p.name`);
    return res.json(rows);
  } catch (err) {
    console.error('listInventory', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateInventory(req, res) {
  try {
    const { productId } = req.params;
    const { quantity, reorderThreshold } = req.body;
    await db.query('INSERT INTO inventory (product_id, quantity, reorder_threshold) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = ?, reorder_threshold = ?', [productId, quantity || 0, reorderThreshold || 0, quantity || 0, reorderThreshold || 0]);
    return res.json({ message: 'Inventory updated' });
  } catch (err) {
    console.error('updateInventory', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function restock(req, res) {
  try {
    const { productId } = req.params;
    const { add } = req.body; // number to add
    if (!add || add <= 0) return res.status(400).json({ message: 'invalid add amount' });
    await db.query('INSERT INTO inventory (product_id, quantity) VALUES (?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)', [productId, add]);
    return res.json({ message: 'Restocked' });
  } catch (err) {
    console.error('restock', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { listInventory, updateInventory, restock };
