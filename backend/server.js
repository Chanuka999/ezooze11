const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config();

// Middleware
const errorHandler = require("./middleware/errorHandler.js");

// Routes
const productRoutes = require("./routes/productRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const contactRoutes = require("./routes/contactRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const discountRoutes = require("./routes/discountRoutes.js");
const settingsRoutes = require("./routes/settingsRoutes.js");
const navigationRoutes = require("./routes/navigationRoutes.js");
const contentRoutes = require("./routes/contentRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const logRoutes = require("./routes/logRoutes.js");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (MONGO_URI) {
      console.log("Attempting to connect to MongoDB...");
      try {
        await mongoose.connect(MONGO_URI, {
          serverSelectionTimeoutMS: 3000,
          socketTimeoutMS: 5000,
        });
        console.log("✓ MongoDB Connected");
      } catch (dbError) {
        console.warn("⚠️  MongoDB connection failed:", dbError.message);
        console.warn(
          "⚠️  Continuing without database - using fallback admin authentication",
        );
        console.log("✓ Fallback Admin: admin@ezooze.com / password123");
      }
    } else {
      console.warn("⚠️  MONGO_URI not configured");
    }

    const app = express();

    // Middleware
    const origins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : "*";
    app.use(
      cors({
        origin: origins,
        credentials: true,
      }),
    );

    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({
        status: "Server is running",
        timestamp: new Date().toISOString(),
      });
    });

    // API Routes
    app.use("/api/products", productRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api/contact", contactRoutes);
    app.use("/api/payments", paymentRoutes);
    app.use("/api/discounts", discountRoutes);
    app.use("/api/settings", settingsRoutes);
    app.use("/api/navigation", navigationRoutes);
    app.use("/api/content", contentRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/logs", logRoutes);

    app.get("/", (req, res) => {
      res.json({
        message: "EZOOZE API is running...",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    // Error Handling Middleware (must be last)
    app.use(errorHandler);

    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });

    // Handle errors
    server.on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
  } catch (error) {
    console.error("Error starting server:", error.message);
    process.exit(1);
  }
}

startServer();
