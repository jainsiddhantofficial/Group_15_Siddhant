module.exports = (sequelize, DataTypes) => {
  return sequelize.define("CartItem", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    cart_id: DataTypes.UUID,
    product_id: DataTypes.UUID,
    qty: DataTypes.INTEGER
  });
};
