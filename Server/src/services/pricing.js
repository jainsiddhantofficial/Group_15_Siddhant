// services/pricing.js
const db = require("../config/db");

module.exports = {
  async getProductPricing(productId) {
    const [rows] = await db.execute(
      "SELECT * FROM pricing WHERE product_id = ?",
      [productId]
    );
    return rows;
  },

  async calculateTierPrice(productId, quantity) {
    const pricing = await this.getProductPricing(productId);

    if (!pricing.length) return null;

    let selectedTier = pricing.find(
      (tier) => quantity >= tier.min_qty && quantity <= tier.max_qty
    );

    if (!selectedTier) {
      // If quantity > max tier, pick highest tier
      selectedTier = pricing[pricing.length - 1];
    }

    return {
      pricePerUnit: selectedTier.price,
      total: selectedTier.price * quantity,
      tierName: selectedTier.tier_name,
    };
  },

  async createTier(data) {
    const { product_id, tier_name, min_qty, max_qty, price } = data;

    await db.execute(
      "INSERT INTO pricing(product_id, tier_name, min_qty, max_qty, price) VALUES(?,?,?,?,?)",
      [product_id, tier_name, min_qty, max_qty, price]
    );

    return { message: "Pricing tier created successfully" };
  }
};
