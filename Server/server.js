// server.js
const express = require("express");
const cors = require("cors");
const env = require("./env");
const db = require("./config/db");

// Import Routes
const authRoutes = require("./routes/auth");
const roleRoutes = require("./routes/role");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const inventoryRoutes = require("./routes/inventory");
const pricingRoutes = require("./routes/pricing");
const creditRoutes = require("./routes/credit");
const invoiceRoutes = require("./routes/invoice");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test DB connection
db.getConnection((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ MySQL Connected Successfully");
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/credit", creditRoutes);
app.use("/api/invoice", invoiceRoutes);

// Base Route
app.get("/", (req, res) => {
  res.send("🚀 Wholesale API Server Running...");
});

// Start Server
app.listen(env.PORT, () => {
  console.log(`🔥 Server running at http://localhost:${env.PORT}`);
});
