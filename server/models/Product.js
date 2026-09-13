const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  stockQuantity: { type: Number, default: 50 },
  inStock: { type: Boolean, default: true },
  rating: { type: Number, default: 4.5 },
  image: { type: String, required: true },
  isOnOffer: { type: Boolean, default: false },
  isBogo: { type: Boolean, default: false },
  discountPercentage: { type: Number, default: 0 },
  offerEndsAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", ProductSchema);
