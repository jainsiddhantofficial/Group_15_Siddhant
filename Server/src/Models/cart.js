module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Cart", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    user_id: DataTypes.UUID
  });
};
