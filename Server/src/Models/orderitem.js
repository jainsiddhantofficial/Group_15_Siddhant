module.exports = (sequelize, DataTypes) => {
  return sequelize.define("OrderItem", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    order_id: DataTypes.UUID,
    product_id: DataTypes.UUID,
    qty: DataTypes.INTEGER,
    unit_price_cents: DataTypes.BIGINT,
    line_total_cents: DataTypes.BIGINT
  });
};
