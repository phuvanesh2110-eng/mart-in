require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const axios = require("axios");

const app = express();
app.use(express.json());

// Configure CORS to accept local dev and production origins
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL || "",
  "https://mart-in.vercel.app",
].filter(Boolean);
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (e.g., curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: Origin not allowed"));
    },
    credentials: true,
  })
);

const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");

// In-memory OTP storage
const otpStore = new Map();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mart-in")
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const createUpiLink = (amount, orderId) => {
  const total = Number(amount || 0);
  return `upi://pay?pa=martin@upi&pn=Mart-In&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Mart-In ${orderId}`)}`;
};

// --- AUTHENTICATION & USER RBAC ENDPOINTS ---

// Register User
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const newUser = new User({
      name: name || email.split("@")[0],
      email: email.trim().toLowerCase(),
      password,
      role: role || (email.toLowerCase().includes("admin") ? "admin" : "customer"),
    });

    await newUser.save();
    res.json({
      success: true,
      token: `token_${newUser._id}`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Seed/Check default admin shortcut
    if (cleanEmail === "admin@martin.com" && password === "admin123") {
      let admin = await User.findOne({ email: cleanEmail });
      if (!admin) {
        admin = await User.create({
          name: "Mart-In Admin",
          email: cleanEmail,
          password: "admin123",
          role: "admin",
        });
      }
      return res.json({
        success: true,
        token: `admin_token_${admin._id}`,
        user: { id: admin._id, name: admin.name, email: admin.email, role: "admin" },
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user || user.password !== password) {
      // Fallback auto-registration for easy demo experience
      const autoUser = new User({
        name: email.split("@")[0],
        email: cleanEmail,
        password,
        role: cleanEmail.includes("admin") ? "admin" : "customer",
      });
      await autoUser.save();
      return res.json({
        success: true,
        token: `token_${autoUser._id}`,
        user: { id: autoUser._id, name: autoUser.name, email: autoUser.email, role: autoUser.role },
      });
    }

    res.json({
      success: true,
      token: `token_${user._id}`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// --- PRODUCT CATALOG API ENDPOINTS ---

// GET /api/products (with search and category filter support)
app.get("/api/products", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
      ];
    }

    const products = await Product.find(query).sort({ price: 1 });
    res.json(products);
  } catch (err) {
    console.error("Fetch products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Admin PUT /api/products/admin/:id - Update product price, stock, isBogo, etc.
app.put("/api/products/admin/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // accept multiple possible frontend field names for robustness
    const {
      price,
      mrp,
      originalPrice,
      stock,
      stockQuantity,
      inStock,
      bogo,
      isBogo,
      isOnOffer,
      discount,
      discountPercentage,
      ...rest
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Price mappings
    if (price !== undefined) product.price = Number(price);
    else if (mrp !== undefined) product.price = Number(mrp);
    else if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);

    // Stock mappings
    if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
    else if (stock !== undefined) product.stockQuantity = Number(stock);

    if (inStock !== undefined) product.inStock = Boolean(inStock);

    // BOGO mappings
    if (isBogo !== undefined) product.isBogo = Boolean(isBogo);
    else if (bogo !== undefined) product.isBogo = Boolean(bogo);

    // Offer/discount mappings
    if (isOnOffer !== undefined) product.isOnOffer = Boolean(isOnOffer);
    if (discountPercentage !== undefined) product.discountPercentage = Number(discountPercentage);
    else if (discount !== undefined) product.discountPercentage = Number(discount);

    // Accept any other direct fields passed through (whitelisted)
    const allowedExtras = ["title", "name", "description", "category", "image"];
    allowedExtras.forEach((key) => {
      if (rest[key] !== undefined) product[key] = rest[key];
    });

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error("Admin product update error:", err);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
});

// --- ORDER ENDPOINTS ---

// GET Customer Order History /api/orders/my-orders
app.get("/api/orders/my-orders", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Customer email is required" });
    }

    const orders = await Order.find({ userEmail: email.toString().toLowerCase() }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Fetch customer orders error:", err);
    res.status(500).json({ error: "Failed to fetch order history" });
  }
});

// GET Admin All Customer Orders Log /api/orders/admin/all
app.get("/api/orders/admin/all", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Fetch admin orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PATCH Admin Update Order Status /api/orders/:id/status
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// GET Admin Analytics /api/admin/analytics
app.get("/api/admin/analytics", async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;

    const pickupCount = orders.filter((o) => o.deliveryType === "Pickup").length;
    const deliveryCount = orders.filter((o) => o.deliveryType === "Delivery").length;

    // Item popularity count
    const itemMap = new Map();
    orders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const name = item.name || item.title || "Item";
          const qty = item.quantity || 1;
          itemMap.set(name, (itemMap.get(name) || 0) + qty);
        });
      }
    });

    const topItems = Array.from(itemMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      totalRevenue,
      totalOrders,
      pickupCount,
      deliveryCount,
      topItems,
    });
  } catch (err) {
    console.error("Fetch analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// POST Create Order /api/orders
app.post("/api/orders", async (req, res) => {
  try {
    const { storeName, store, timeSlot, items, total, status, deliveryType, address, userEmail, userName } = req.body;
    const orderId = `MI-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const safeTotal = Number(total || 0);

    const isDelivery = deliveryType === "Delivery";

    const newOrder = new Order({
      orderId,
      userEmail: (userEmail || "customer@martin.com").toLowerCase(),
      userName: userName || "Valued Customer",
      storeName: isDelivery ? "Home Delivery" : (storeName || store || "Mart-In Flagship Store"),
      deliveryType: deliveryType || "Pickup",
      address: address || "",
      timeSlot: timeSlot || "Instant 30 Mins",
      items: Array.isArray(items) ? items : [],
      subtotal: safeTotal,
      total: safeTotal,
      status: status || "Confirmed",
      qrCode: createUpiLink(safeTotal, orderId),
    });

    await newOrder.save();
    res.json({ success: true, orderId, pass: newOrder, order: newOrder });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// Backward Compatible Pass endpoints
app.get("/api/passes", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch passes" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Mart-In Server running on port ${PORT}`));