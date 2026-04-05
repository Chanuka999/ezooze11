const express = require('express');
const { 
  authUser, 
  registerUser, 
  getUsers, 
  getUserById,
  updateUser, 
  deleteUser,
  getUserOrders,
  changePassword,
  googleOAuth,
  appleOAuth
} = require('../controllers/userController.js');
const { protect, admin } = require('../middleware/auth.js');
const { rateLimitLogin } = require('../middleware/rateLimiter.js');

const router = express.Router();

// Public routes - with rate limiting on login
router.post('/login', rateLimitLogin, authUser);
router.post('/register', registerUser);
router.post('/oauth/google', googleOAuth);
router.post('/oauth/apple', appleOAuth);

// Admin routes
router.get('/', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteUser);

// Private routes
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.put('/:id/change-password', protect, changePassword);
router.get('/:id/orders', protect, getUserOrders);

module.exports = router;

