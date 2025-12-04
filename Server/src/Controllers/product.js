// server/src/controllers/product.controller.js
const db = require('../config/db');
const { parseCSV } = require('../utils/csv'); // assume utils/csv.js exports parse function

async function listProducts(req, res) {
  try {
    // optional query params: ?page=&limit=&search=
    const [rows] = await db.query(`SELECT p.*, 
      (SELECT COUNT(*) FROM product_tiers t WHERE t.product_id = p.id) AS tier_count
      FROM products p ORDER BY p.id DESC LIMIT 100`);
    // fetch tiers for each product? frontend can call GET /products/:id for tiers
    return res.json(rows.map(r => ({ ...r, tiers: [] })));
  } catch (err) {
    console.error('listProducts', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getProduct(req, res) {
  try {
    const id = req.params.id;
    const [[product]] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const [tiers] = await db.query('SELECT id, min_qty AS minQty, max_qty AS maxQty, price FROM product_tiers WHERE product_id = ? ORDER BY min_qty ASC', [id]);
    product.tiers = tiers;
    return res.json(product);
  } catch (err) {
    console.error('getProduct', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function createProduct(req, res) {
  try {
    const { sku, name, basePrice, description } = req.body;
    const [result] = await db.query('INSERT INTO products (sku, name, base_price, description) VALUES (?, ?, ?, ?)', [sku, name, basePrice, description||null]);
    const id = result.insertId;
    const [[product]] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return res.status(201).json(product);
  } catch (err) {
    console.error('createProduct', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateProduct(req, res) {
  try {
    const id = req.params.id;
    const { sku, name, basePrice, description } = req.body;
    await db.query('UPDATE products SET sku = ?, name = ?, base_price = ?, description = ? WHERE id = ?', [sku, name, basePrice, description||null, id]);
    const [[product]] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return res.json(product);
  } catch (err) {
    console.error('updateProduct', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteProduct(req, res) {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteProduct', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function bulkUploadCSV(req, res) {
  try {
    // req.file.path expected (multer)
    if (!req.file) return res.status(400).json({ message: 'CSV file required' });
    const rows = await parseCSV(req.file.path); // rows: array of objects
    // Expect CSV columns: sku,name,basePrice,description
    const inserted = [];
    for (const r of rows) {
      const [result] = await db.query('INSERT INTO products (sku, name, base_price, description) VALUES (?, ?, ?, ?)', [r.sku, r.name, r.basePrice || 0, r.description || null]);
      inserted.push({ id: result.insertId, sku: r.sku });
    }
    return res.json({ inserted });
  } catch (err) {
    console.error('bulkUploadCSV', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Tiers
async function addProductTier(req, res) {
  try {
    const productId = req.params.id;
    const { minQty, maxQty, price } = req.body;
    const [result] = await db.query('INSERT INTO product_tiers (product_id, min_qty, max_qty, price) VALUES (?, ?, ?, ?)', [productId, minQty, maxQty || null, price]);
    const [rows] = await db.query('SELECT id, min_qty AS minQty, max_qty AS maxQty, price FROM product_tiers WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('addProductTier', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateProductTier(req, res) {
  try {
    const productId = req.params.id;
    const tierId = req.params.tierId;
    const { minQty, maxQty, price } = req.body;
    await db.query('UPDATE product_tiers SET min_qty = ?, max_qty = ?, price = ? WHERE id = ? AND product_id = ?', [minQty, maxQty || null, price, tierId, productId]);
    const [rows] = await db.query('SELECT id, min_qty AS minQty, max_qty AS maxQty, price FROM product_tiers WHERE id = ?', [tierId]);
    return res.json(rows[0]);
  } catch (err) {
    console.error('updateProductTier', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteProductTier(req, res) {
  try {
    const productId = req.params.id;
    const tierId = req.params.tierId;
    await db.query('DELETE FROM product_tiers WHERE id = ? AND product_id = ?', [tierId, productId]);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteProductTier', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
  bulkUploadCSV, addProductTier, updateProductTier, deleteProductTier
};
