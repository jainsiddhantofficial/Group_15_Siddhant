module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Order", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    user_id: DataTypes.UUID,
    total_cents: DataTypes.BIGINT,
    tax_cents: DataTypes.BIGINT,
    shipping_cents: DataTypes.BIGINT,
    status: { type: DataTypes.STRING, defaultValue: "processing" },
    payment_terms: DataTypes.STRING
  });
};
