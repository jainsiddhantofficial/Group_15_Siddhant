// app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("dev"));

// DB Check
const db = require("./config/db");
db.getConnection()
  .then(() => console.log("✅ MySQL Connected Successfully"))
  .catch((err) => {
    console.error("❌ MySQL Connection Failed:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/products", require("./routes/product"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/orders", require("./routes/order"));
app.use("/api/rfq", require("./routes/rfq"));
app.use("/api/users", require("./routes/user"));

// Health Route
app.get("/", (req, res) => {
  res.send("Bulk Backend Server Running...");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(" Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
