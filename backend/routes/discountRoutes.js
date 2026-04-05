const express = require('express');
const { 
  createDiscount, 
  getDiscounts, 
  getDiscountByCode, 
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  validateDiscount,
  generateDiscountCodes
} = require('../controllers/discountController.js');
const { protect, admin } = require('../middleware/auth.js');

const router = express.Router();

// Public routes
router.post('/validate', validateDiscount);
router.get('/code/:code', getDiscountByCode);

// Admin routes
router.post('/', protect, admin, createDiscount);
router.post('/generate', protect, admin, generateDiscountCodes);
router.get('/', protect, admin, getDiscounts);
router.get('/:id', protect, admin, getDiscountById);
router.put('/:id', protect, admin, updateDiscount);
router.delete('/:id', protect, admin, deleteDiscount);

module.exports = router;
