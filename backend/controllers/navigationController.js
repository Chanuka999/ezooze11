const Navigation = require('../models/Navigation.js');

// @desc    Create a navigation link
// @route   POST /api/navigation
// @access  Private/Admin
const createNavLink = async (req, res) => {
  try {
    const { id, name, page } = req.body;

    if (!id || !name) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const navLink = await Navigation.create(req.body);
    res.status(201).json(navLink);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all navigation links
// @route   GET /api/navigation
// @access  Public
const getNavLinks = async (req, res) => {
  try {
    const navLinks = await Navigation.find({ isActive: true }).sort({ position: 1 });
    res.json(navLinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single navigation link
// @route   GET /api/navigation/:id
// @access  Public
const getNavLinkById = async (req, res) => {
  try {
    const navLink = await Navigation.findById(req.params.id);
    if (!navLink) {
      return res.status(404).json({ message: 'Navigation link not found' });
    }
    res.json(navLink);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update navigation link
// @route   PUT /api/navigation/:id
// @access  Private/Admin
const updateNavLink = async (req, res) => {
  try {
    const navLink = await Navigation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!navLink) {
      return res.status(404).json({ message: 'Navigation link not found' });
    }
    res.json(navLink);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete navigation link
// @route   DELETE /api/navigation/:id
// @access  Private/Admin
const deleteNavLink = async (req, res) => {
  try {
    const navLink = await Navigation.findByIdAndDelete(req.params.id);
    if (!navLink) {
      return res.status(404).json({ message: 'Navigation link not found' });
    }
    res.json({ message: 'Navigation link deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder navigation links
// @route   PUT /api/navigation/reorder
// @access  Private/Admin
const reorderNavLinks = async (req, res) => {
  try {
    const { links } = req.body;

    if (!Array.isArray(links)) {
      return res.status(400).json({ message: 'Links must be an array' });
    }

    for (let i = 0; i < links.length; i++) {
      await Navigation.findByIdAndUpdate(links[i]._id, { position: i });
    }

    const updatedLinks = await Navigation.find().sort({ position: 1 });
    res.json(updatedLinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNavLink,
  getNavLinks,
  getNavLinkById,
  updateNavLink,
  deleteNavLink,
  reorderNavLinks,
};
