const express = require('express');
const { 
  getSettings, 
  updateSettings,
  getShippingInfo,
  getPaymentMethods,
  getBusinessHours
} = require('../controllers/settingsController.js');
const { protect, admin } = require('../middleware/auth.js');

const router = express.Router();

// Public routes
router.get('/shipping', getShippingInfo);
router.get('/payment-methods', getPaymentMethods);
router.get('/business-hours', getBusinessHours);
router.get('/', getSettings);

// Admin routes
router.put('/', protect, admin, updateSettings);

module.exports = router;
