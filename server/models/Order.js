const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  id: String,
  productId: String,
  name: String,
  title: String,
  price: Number,
  quantity: Number,
  image: String,
  isBogo: Boolean,
});

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  userName: { type: String },
  storeName: { type: String, default: "Mart-In Store" },
  deliveryType: { type: String, enum: ["Pickup", "Delivery"], default: "Pickup" },
  address: { type: String, default: "" },
  timeSlot: { type: String, default: "Instant 30 Mins" },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Confirmed", "Preparing", "Ready", "Delivered", "Cancelled"],
    default: "Confirmed",
  },
  qrCode: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);

