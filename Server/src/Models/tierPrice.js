module.exports = (sequelize, DataTypes) => {
  return sequelize.define("TierPrice", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    product_id: DataTypes.UUID,
    min_qty: DataTypes.INTEGER,
    max_qty: DataTypes.INTEGER,
    price_cents: DataTypes.BIGINT
  });
};
