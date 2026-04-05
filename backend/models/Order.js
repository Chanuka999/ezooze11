
const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  imageUrls: [{ type: String }],
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  selectedSize: { type: String },
  selectedColor: { type: String },
});

const statusHistorySchema = mongoose.Schema({
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String }
});

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  orderItems: [orderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
  },
  status: {
    type: String,
    required: true,
    default: 'Confirmed',
    enum: ['Confirmed', 'Processing', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded']
  },
  statusHistory: [statusHistorySchema],
  subtotal: { type: Number, required: true, default: 0.0 },
  shipping: { type: Number, required: true, default: 0.0 },
  discount: { type: Number, default: 0.0 },
  tax: { type: Number, default: 0.0 },
  total: { type: Number, required: true, default: 0.0 },
  trackingNumber: { type: String },
  trackingCarrier: { type: String },
}, {
  timestamps: true,
});

// Ensure _id is sent as id to frontend
orderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
