const express = require('express');
const { 
  createContactMessage, 
  getContactMessages, 
  getContactMessageById,
  markAsRead,
  deleteContactMessage
} = require('../controllers/contactController.js');
const { protect, admin } = require('../middleware/auth.js');

const router = express.Router();

// Public routes
router.post('/', createContactMessage);

// Admin routes
router.get('/', protect, admin, getContactMessages);
router.get('/:id', protect, admin, getContactMessageById);
router.put('/:id/read', protect, admin, markAsRead);
router.delete('/:id', protect, admin, deleteContactMessage);

module.exports = router;
