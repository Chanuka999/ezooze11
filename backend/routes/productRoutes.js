const express = require('express');
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  updateProductStock
} = require('../controllers/productController.js');
const { protect, admin } = require('../middleware/auth.js');

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.put('/:id/stock', protect, admin, updateProductStock);

module.exports = router;

