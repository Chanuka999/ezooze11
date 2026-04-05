const Discount = require('../models/Discount.js');
const { generateRandomCode } = require('../utils/helpers.js');

// @desc    Create a new discount code
// @route   POST /api/discounts
// @access  Private/Admin
const createDiscount = async (req, res) => {
  try {
    const { code, type, value, minimumPurchase, usageLimit, expiresAt } = req.body;

    if (!code || !type || !value) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const discountExists = await Discount.findOne({ code: code.toUpperCase() });
    if (discountExists) {
      return res.status(400).json({ message: 'Discount code already exists' });
    }

    const discount = await Discount.create({
      code: code.toUpperCase(),
      type,
      value,
      minimumPurchase: minimumPurchase || 0,
      usageLimit,
      expiresAt,
    });

    res.status(201).json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all discount codes
// @route   GET /api/discounts
// @access  Private/Admin
const getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find({}).sort({ createdAt: -1 });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get discount by code
// @route   GET /api/discounts/code/:code
// @access  Public
const getDiscountByCode = async (req, res) => {
  try {
    const discount = await Discount.findOne({ code: req.params.code.toUpperCase() });

    if (!discount) {
      return res.status(404).json({ message: 'Discount code not found' });
    }

    if (!discount.isActive) {
      return res.status(400).json({ message: 'Discount code is not active' });
    }

    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Discount code has expired' });
    }

    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return res.status(400).json({ message: 'Discount code usage limit exceeded' });
    }

    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single discount
// @route   GET /api/discounts/:id
// @access  Private/Admin
const getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update discount
// @route   PUT /api/discounts/:id
// @access  Private/Admin
const updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete discount
// @route   DELETE /api/discounts/:id
// @access  Private/Admin
const deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate and apply discount
// @route   POST /api/discounts/validate
// @access  Public
const validateDiscount = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const discount = await Discount.findOne({ code: code.toUpperCase() });

    if (!discount) {
      return res.status(404).json({ message: 'Discount code not found', valid: false });
    }

    if (!discount.isActive) {
      return res.status(400).json({ message: 'Discount code is not active', valid: false });
    }

    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Discount code has expired', valid: false });
    }

    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return res.status(400).json({ message: 'Discount code usage limit exceeded', valid: false });
    }

    if (cartTotal < discount.minimumPurchase) {
      return res.status(400).json({ 
        message: `Minimum purchase of ${discount.minimumPurchase} required`, 
        valid: false 
      });
    }

    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (cartTotal * discount.value) / 100;
    } else if (discount.type === 'fixed') {
      discountAmount = discount.value;
    }

    res.json({ 
      valid: true, 
      discount, 
      discountAmount,
      finalTotal: Math.max(0, cartTotal - discountAmount)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate random discount codes
// @route   POST /api/discounts/generate
// @access  Private/Admin
const generateDiscountCodes = async (req, res) => {
  try {
    const { count = 10, type, value, expiresAt } = req.body;

    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = generateRandomCode(8);
      const discount = await Discount.create({
        code,
        type,
        value,
        expiresAt,
      });
      codes.push(discount);
    }

    res.status(201).json(codes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDiscount,
  getDiscounts,
  getDiscountByCode,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  validateDiscount,
  generateDiscountCodes,
};
