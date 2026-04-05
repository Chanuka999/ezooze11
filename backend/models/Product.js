
const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  discountPrice: { type: Number },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['men', 'women', 'unisex', 'sportswear'] 
  },
  subCategory: { type: String, required: true },
  imageUrls: [{ type: String, required: true }],
  sizes: [{ type: String }],
  colors: [{ type: String }],
  material: { type: String },
  featured: { type: Boolean, default: false },
  stock: { type: Number, required: true, default: 0 },
  variants: [{
    size: { type: String },
    color: { type: String },
    stock: { type: Number, default: 0 }
  }],
}, {
  timestamps: true,
});

// Ensure _id is sent as id to frontend
productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
