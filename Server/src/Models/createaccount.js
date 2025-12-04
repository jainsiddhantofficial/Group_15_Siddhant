module.exports = (sequelize, DataTypes) => {
  return sequelize.define("CreditAccount", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    user_id: DataTypes.UUID,
    credit_limit_cents: { type: DataTypes.BIGINT, defaultValue: 0 },
    outstanding_cents: { type: DataTypes.BIGINT, defaultValue: 0 }
  });
};
