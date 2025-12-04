module.exports = (sequelize, DataTypes) => {
  return sequelize.define("RFQ", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    user_id: DataTypes.UUID,
    product_id: DataTypes.UUID,
    qty: DataTypes.INTEGER,
    status: { type: DataTypes.STRING, defaultValue: "open" }
  });
};
