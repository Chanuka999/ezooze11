const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
  storeName: { type: String, default: 'EZOOZE - The Art of Lasting Elegance' },
  contactEmail: { type: String, required: true },
  supportEmail: { type: String },
  address: { type: String },
  phoneNumber: { type: String },
  
  // Currency and Tax
  currency: { 
    type: String, 
    enum: ['LKR', 'USD', 'EUR', 'GBP', 'AUD'],
    default: 'LKR'
  },
  taxRate: { type: Number, default: 0 }, // Tax percentage
  
  // Shipping
  standardShippingCost: { type: Number, default: 500 },
  expressShippingCost: { type: Number, default: 1000 },
  freeShippingThreshold: { type: Number, default: 10000 },
  isFreeShippingThresholdActive: { type: Boolean, default: false },
  estimatedDeliveryDays: { type: Number, default: 5 },
  
  // Payment Methods
  paymentMethods: {
    creditCard: { type: Boolean, default: false },
    payOnDelivery: { type: Boolean, default: true },
    bankTransfer: { type: Boolean, default: false },
    stripe: { type: Boolean, default: false },
  },
  
  // Social Links
  socialLinks: {
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    pinterest: { type: String },
    youtube: { type: String },
    tiktok: { type: String },
  },
  
  // Business Hours
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  
  // Store Policies
  returnPolicyDays: { type: Number, default: 30 },
  refundProcessingDays: { type: Number, default: 7 },
  
  // Email Configuration
  emailVerificationRequired: { type: Boolean, default: false },
  
  // Features
  features: {
    reviews: { type: Boolean, default: true },
    wishlist: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: true },
    referralProgram: { type: Boolean, default: false },
  },
}, {
  timestamps: true,
});

// Only one settings document should exist
settingsSchema.virtual('isSingleton').get(function() {
  return true;
});

settingsSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
