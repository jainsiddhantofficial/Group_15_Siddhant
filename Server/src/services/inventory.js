// services/inventory.js
const db = require("../config/db");

module.exports = {
  async getAllProducts() {
    const [rows] = await db.execute("SELECT * FROM products");
    return rows;
  },

  async getProduct(id) {
    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
    return rows[0];
  },

  async updateStock(productId, change) {
    await db.execute(
      "UPDATE products SET stock = stock + ? WHERE id = ?",
      [change, productId]
    );

    return { message: "Stock updated successfully" };
  },

  async setStock(productId, newStock) {
    await db.execute("UPDATE products SET stock = ? WHERE id = ?", [
      newStock,
      productId,
    ]);

    return { message: "Stock set successfully" };
  }
};
