const express = require('express');
const { 
  createReview, 
  getProductReviews, 
  getReviewById,
  getAllReviews,
  approveReview,
  deleteReview,
  markHelpful
} = require('../controllers/reviewController.js');
const { protect, admin } = require('../middleware/auth.js');

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);
router.put('/:id/helpful', markHelpful);

// Private routes
router.post('/', protect, createReview);

// Admin routes
router.get('/', protect, admin, getAllReviews);
router.get('/:id', protect, admin, getReviewById);
router.put('/:id/approve', protect, admin, approveReview);
router.delete('/:id', protect, admin, deleteReview);

module.exports = router;
