// server/src/controllers/order.controller.js
const db = require('../config/db');
const pdfUtil = require('../utils/pdf'); // if you want direct PDF creation
const fs = require('fs/promises');
const path = require('path');

async function createOrder(req, res) {
  // expects { items: [{productId, quantity}], paymentMethod: 'credit'|'paynow' ... }
  const conn = db; // pool promise
  const userId = req.user.id;
  const { items = [], paymentMethod = 'credit' } = req.body;
  if (!items.length) return res.status(400).json({ message: 'No items' });

  const connection = await conn.getConnection();
  try {
    await connection.beginTransaction();

    // compute line items: check tiers and inventory
    let total = 0;
    const orderItems = [];

    for (const it of items) {
      const [prodRows] = await connection.query('SELECT id, name, base_price AS basePrice FROM products WHERE id = ?', [it.productId]);
      if (!prodRows.length) throw new Error(`Product ${it.productId} not found`);
      const product = prodRows[0];

      // find tier price for this product (product_tiers)
      const [tierRows] = await connection.query(
        'SELECT id, min_qty AS minQty, max_qty AS maxQty, price FROM product_tiers WHERE product_id = ? ORDER BY min_qty ASC',
        [it.productId]
      );

      // determine unit price
      let unitPrice = product.basePrice;
      for (const t of tierRows) {
        const minOK = it.quantity >= t.minQty;
        const maxOK = t.maxQty == null || it.quantity <= t.maxQty;
        if (minOK && maxOK) { unitPrice = t.price; break; }
      }

      // check inventory
      const [invRows] = await connection.query('SELECT quantity FROM inventory WHERE product_id = ? FOR UPDATE', [it.productId]);
      const available = invRows.length ? invRows[0].quantity : 0;
      if (available < it.quantity) throw new Error(`Insufficient stock for product ${product.name}`);

      // reserve stock: decrement
      await connection.query('UPDATE inventory SET quantity = quantity - ? WHERE product_id = ?', [it.quantity, it.productId]);

      const lineTotal = unitPrice * it.quantity;
      total += lineTotal;
      orderItems.push({ productId: it.productId, quantity: it.quantity, unitPrice });
    }

    // create order
    const [orderRes] = await connection.query('INSERT INTO orders (buyer_id, total, status, payment_method, created_at) VALUES (?, ?, ?, ?, ?)', [userId, total, paymentMethod === 'credit' ? 'processing' : 'paid', paymentMethod, new Date()]);
    const orderId = orderRes.insertId;

    // insert order items
    for (const oi of orderItems) {
      await connection.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)', [orderId, oi.productId, oi.quantity, oi.unitPrice]);
    }

    // If paymentMethod is credit, increase used credit (simple implementation)
    if (paymentMethod === 'credit') {
      // update credit_accounts.used
      const [credRows] = await connection.query('SELECT id, `limit`, used FROM credit_accounts WHERE user_id = ? FOR UPDATE', [userId]);
      if (!credRows.length) throw new Error('Credit account not found');
      const acc = credRows[0];
      const available = acc.limit - acc.used;
      if (available < total) throw new Error('Credit limit exceeded');
      await connection.query('UPDATE credit_accounts SET used = used + ? WHERE id = ?', [total, acc.id]);
    }

    await connection.commit();

    return res.status(201).json({ orderId, total });
  } catch (err) {
    await connection.rollback();
    console.error('createOrder err', err);
    return res.status(400).json({ message: err.message || 'Order failed' });
  } finally {
    connection.release();
  }
}

async function getOrderById(req, res) {
  try {
    const id = req.params.id;
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!orders.length) return res.status(404).json({ message: 'Not found' });
    const order = orders[0];
    const [items] = await db.query('SELECT oi.*, p.name, p.sku FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?', [id]);
    order.items = items;
    return res.json(order);
  } catch (err) {
    console.error('getOrderById', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function listOrdersForUser(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await db.query('SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC LIMIT 100', [userId]);
    return res.json(rows);
  } catch (err) {
    console.error('listOrdersForUser', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// admin functions
async function listAllOrders(req, res) {
  try {
    const [rows] = await db.query('SELECT o.*, u.email AS buyerEmail FROM orders o JOIN users u ON u.id = o.buyer_id ORDER BY o.created_at DESC LIMIT 500');
    return res.json(rows);
  } catch (err) {
    console.error('listAllOrders', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function processOrder(req, res) {
  try {
    const id = req.params.id;
    const { status, trackingNumber } = req.body;
    await db.query('UPDATE orders SET status = ?, tracking_number = ? WHERE id = ?', [status, trackingNumber || null, id]);
    return res.json({ message: 'Order updated' });
  } catch (err) {
    console.error('processOrder', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function generateInvoicePDF(req, res) {
  try {
    const id = req.params.id;
    // build HTML as in earlier invoice service, then use utils/pdf to generate
    const [orders] = await db.query('SELECT o.*, u.name AS buyerName, u.business_name AS buyerBusiness FROM orders o JOIN users u ON u.id = o.buyer_id WHERE o.id = ?', [id]);
    if (!orders.length) return res.status(404).json({ message: 'Order not found' });
    const order = orders[0];
    const [items] = await db.query('SELECT oi.*, p.name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?', [id]);

    const html = buildHtml(order, items);
    const pdfBuffer = await pdfUtil.create(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${id}.pdf`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('generateInvoicePDF', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

function buildHtml(order, items) {
  const rowsHtml = items.map(i => `<tr><td>${i.name}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">${Number(i.unit_price||i.unitPrice).toFixed(2)}</td><td style="text-align:right">${(i.quantity * (i.unit_price||i.unitPrice)).toFixed(2)}</td></tr>`).join('');
  const total = items.reduce((s, it) => s + (it.quantity * (it.unit_price||it.unitPrice)), 0);
  return `<!doctype html><html><body>
    <h2>Invoice #${order.id}</h2>
    <div><strong>Buyer:</strong> ${order.buyerName || order.buyerBusiness}</div>
    <table style="width:100%;border-collapse:collapse;margin-top:12px;"><thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Line</th></tr></thead><tbody>${rowsHtml}<tr><td colspan="3" style="text-align:right"><b>Total</b></td><td style="text-align:right"><b>${total.toFixed(2)}</b></td></tr></tbody></table>
  </body></html>`;
}

async function quickOrderUpload(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'CSV required' });
    const rows = await require('../utils/csv').parse(req.file.path); // expects sku, quantity or productId, quantity
    // Turn CSV rows into items array then call createOrder logic (you could reuse createOrder by calling internal function)
    const items = [];
    for (const r of rows) {
      if (r.productId) items.push({ productId: Number(r.productId), quantity: Number(r.quantity) });
      else if (r.sku) {
        const [prods] = await db.query('SELECT id FROM products WHERE sku = ? LIMIT 1', [r.sku]);
        if (!prods.length) continue;
        items.push({ productId: prods[0].id, quantity: Number(r.quantity) });
      }
    }
    // simple: forward to createOrder by constructing req.body and calling createOrder
    req.body.items = items;
    return createOrder(req, res);
  } catch (err) {
    console.error('quickOrderUpload', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createOrder, getOrderById, listOrdersForUser, listAllOrders, processOrder, generateInvoicePDF, quickOrderUpload
};
