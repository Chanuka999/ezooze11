
const Order = require('../models/Order.js');
const Product = require('../models/Product.js');
const User = require('../models/User.js');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, items, shippingAddress, subtotal, shipping, tax, discount, paymentMethod } = req.body;

    if (!customerName || !customerEmail || !items || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const orderItems = items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      imageUrls: item.imageUrls,
      price: item.price,
      discountPrice: item.discountPrice,
      product: item.id,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
    }));

    const total = subtotal + (shipping || 0) - (discount || 0) + (tax || 0);

    const order = await Order.create({
      user: req.user?.id || null,
      customerName,
      customerEmail,
      customerPhone,
      orderItems,
      shippingAddress,
      subtotal,
      shipping: shipping || 0,
      tax: tax || 0,
      discount: discount || 0,
      total,
      status: 'Confirmed',
      statusHistory: [{ status: 'Confirmed', timestamp: new Date() }],
      paymentMethod,
    });

    // Add order to user's orders if user is logged in
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { $push: { orders: order._id } });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').populate('orderItems.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user').populate('orderItems.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/user/:userId
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).populate('orderItems.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['Confirmed', 'Processing', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note });

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order tracking
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
const updateOrderTracking = async (req, res) => {
  try {
    const { trackingNumber, trackingCarrier } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { trackingNumber, trackingCarrier },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }

    order.status = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', timestamp: new Date() });

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats/overview
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(10);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  updateOrderTracking,
  cancelOrder,
  getOrderStats,
};
