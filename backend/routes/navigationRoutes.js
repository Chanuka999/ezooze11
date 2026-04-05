const express = require('express');
const { 
  createNavLink, 
  getNavLinks, 
  getNavLinkById,
  updateNavLink,
  deleteNavLink,
  reorderNavLinks
} = require('../controllers/navigationController.js');
const { protect, admin } = require('../middleware/auth.js');

const router = express.Router();

// Public routes
router.get('/', getNavLinks);
router.get('/:id', getNavLinkById);

// Admin routes
router.post('/', protect, admin, createNavLink);
router.put('/:id', protect, admin, updateNavLink);
router.delete('/:id', protect, admin, deleteNavLink);
router.put('/reorder', protect, admin, reorderNavLinks);

module.exports = router;
