// services/credit.js
const db = require("../config/db");

module.exports = {
  async getCreditDetails(userId) {
    const [rows] = await db.execute(
      "SELECT * FROM credit WHERE user_id = ?",
      [userId]
    );
    return rows[0];
  },

  async updateUsedCredit(userId, amount) {
    await db.execute(
      "UPDATE credit SET used_credit = used_credit + ? WHERE user_id = ?",
      [amount, userId]
    );

    return { message: "Credit updated" };
  },

  async canUseCredit(userId, orderAmount) {
    const credit = await this.getCreditDetails(userId);

    if (!credit) return false;

    return credit.used_credit + orderAmount <= credit.limit_amount;
  },

  async addCreditTransaction(userId, amount, type) {
    await db.execute(
      "INSERT INTO credit_transactions(user_id, amount, type) VALUES(?,?,?)",
      [userId, amount, type]
    );

    return { message: "Credit transaction recorded" };
  }
};
