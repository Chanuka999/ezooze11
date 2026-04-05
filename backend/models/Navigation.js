const mongoose = require('mongoose');

const navLinkChildSchema = mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  filters: {
    category: String,
    subCategory: String,
  },
});

const navLinkFeaturedLinkSchema = mongoose.Schema({
  page: { type: String },
  filters: {
    category: String,
    subCategory: String,
  },
});

const navLinkSchema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  page: { type: String },
  position: { type: Number, default: 0 },
  filters: {
    category: String,
    subCategory: String,
  },
  isMega: { type: Boolean, default: false },
  featuredImage: String,
  featuredTitle: String,
  featuredLink: navLinkFeaturedLinkSchema,
  children: [navLinkChildSchema],
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

navLinkSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const Navigation = mongoose.model('Navigation', navLinkSchema);

module.exports = Navigation;
