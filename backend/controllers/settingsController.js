const Settings = require('../models/Settings.js');

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        storeName: 'EZOOZE - The Art of Lasting Elegance',
        contactEmail: 'info@ezooze.com',
        currency: 'LKR',
        standardShippingCost: 500,
        freeShippingThreshold: 10000,
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get shipping information
// @route   GET /api/settings/shipping
// @access  Public
const getShippingInfo = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings) {
      return res.json({
        standardShippingCost: 500,
        expressShippingCost: 1000,
        freeShippingThreshold: 10000,
        isFreeShippingThresholdActive: false,
      });
    }

    res.json({
      standardShippingCost: settings.standardShippingCost,
      expressShippingCost: settings.expressShippingCost,
      freeShippingThreshold: settings.freeShippingThreshold,
      isFreeShippingThresholdActive: settings.isFreeShippingThresholdActive,
      estimatedDeliveryDays: settings.estimatedDeliveryDays,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment methods
// @route   GET /api/settings/payment-methods
// @access  Public
const getPaymentMethods = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings) {
      return res.json({
        creditCard: false,
        payOnDelivery: true,
      });
    }

    res.json(settings.paymentMethods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get business hours
// @route   GET /api/settings/business-hours
// @access  Public
const getBusinessHours = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings || !settings.businessHours) {
      return res.json({});
    }

    res.json(settings.businessHours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getShippingInfo,
  getPaymentMethods,
  getBusinessHours,
};
