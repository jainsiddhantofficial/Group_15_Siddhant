const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./user")(sequelize, DataTypes);
db.Product = require("./product")(sequelize, DataTypes);
db.TierPrice = require("./tierPrice")(sequelize, DataTypes);
db.CreditAccount = require("./creditAccount")(sequelize, DataTypes);
db.Cart = require("./cart")(sequelize, DataTypes);
db.CartItem = require("./cartItem")(sequelize, DataTypes);
db.Order = require("./order")(sequelize, DataTypes);
db.OrderItem = require("./orderItem")(sequelize, DataTypes);
db.RFQ = require("./rfq")(sequelize, DataTypes);

// Associations
db.User.hasOne(db.Cart, { foreignKey: "user_id" });
db.Cart.belongsTo(db.User);

db.Cart.hasMany(db.CartItem, { foreignKey: "cart_id" });
db.CartItem.belongsTo(db.Cart);

db.Product.hasMany(db.TierPrice, { foreignKey: "product_id" });
db.TierPrice.belongsTo(db.Product);

db.User.hasOne(db.CreditAccount, { foreignKey: "user_id" });
db.CreditAccount.belongsTo(db.User);

db.Order.belongsTo(db.User, { foreignKey: "user_id" });
db.Order.hasMany(db.OrderItem, { foreignKey: "order_id" });
db.OrderItem.belongsTo(db.Product, { foreignKey: "product_id" });

module.exports = db;
