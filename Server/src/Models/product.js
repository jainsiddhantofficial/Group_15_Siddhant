module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Product", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    sku: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    min_order_qty: { type: DataTypes.INTEGER, defaultValue: 1 },
    price_cents: { type: DataTypes.BIGINT, allowNull: false }
  });
};
