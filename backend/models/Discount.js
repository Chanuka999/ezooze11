const mongoose = require('mongoose');

const discountSchema = mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String },
  type: { 
    type: String, 
    required: true, 
    enum: ['percentage', 'fixed', 'free_shipping'],
    default: 'percentage'
  },
  value: { type: Number, required: true, min: 0 },
  isActive: { type: Boolean, default: true },
  minimumPurchase: { type: Number, default: 0 },
  usageLimit: { type: Number },
  usageCount: { type: Number, default: 0 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: { type: Date },
  validFrom: { type: Date, default: Date.now },
  applicableCategories: [String], // If empty, applies to all
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // If empty, applies to all
}, {
  timestamps: true,
});

// Add virtual to check if discount is expired
discountSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

discountSchema.virtual('hasExceededLimit').get(function() {
  return this.usageLimit && this.usageCount >= this.usageLimit;
});

discountSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;
