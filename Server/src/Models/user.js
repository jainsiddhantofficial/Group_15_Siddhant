module.exports = (sequelize, DataTypes) => {
  return sequelize.define("User", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: "buyer" },
    business_name: DataTypes.STRING,
    tax_id: DataTypes.STRING,
    approved: { type: DataTypes.BOOLEAN, defaultValue: false }
  });
};
