const express = require('express');
const { 
  createOrder, 
  getOrders, 
  getOrderById, 
  getUserOrders,
  updateOrderStatus,
  updateOrderTracking,
  cancelOrder,
  getOrderStats
} = require('../controllers/orderController.js');
const { protect, admin } = require('../middleware/auth.js');

const router = express.Router();

// Public routes
router.post('/', createOrder);

// Admin routes
router.get('/stats/overview', protect, admin, getOrderStats);
router.get('/', protect, admin, getOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/tracking', protect, admin, updateOrderTracking);

// Private routes
router.get('/:id', protect, getOrderById);
router.get('/user/:userId', protect, getUserOrders);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;

