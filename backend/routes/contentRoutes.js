const express = require('express');
const { 
  getPageContent, 
  updatePageContent,
  getAllPageContent,
  togglePagePublish
} = require('../controllers/contentController.js');
const { protect, admin } = require('../middleware/auth.js');

const router = express.Router();

// Public routes
router.get('/:pageType', getPageContent);

// Admin routes
router.get('/', protect, admin, getAllPageContent);
router.put('/:pageType', protect, admin, updatePageContent);
router.put('/:pageType/publish', protect, admin, togglePagePublish);

module.exports = router;
