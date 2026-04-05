const mongoose = require('mongoose');

const heroSlideSchema = mongoose.Schema({
  imageUrl: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  buttonText: { type: String },
  buttonLink: { type: String },
  filters: {
    category: String,
    subCategory: String,
  },
});

const bannerContentSchema = mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  buttonText: { type: String },
  buttonLink: { type: String },
  imageUrl: { type: String, required: true },
});

const categoryShowcaseItemSchema = mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  filters: {
    category: String,
    subCategory: String,
  },
});

const pageContentSchema = mongoose.Schema({
  pageType: {
    type: String,
    enum: ['home', 'shop', 'about', 'careers', 'press', 'faq', 'contact', 'privacy', 'terms', 'shipping'],
    required: true,
    unique: true,
  },
  
  // For Homepage
  heroSlides: [heroSlideSchema],
  midBanner: bannerContentSchema,
  categoryShowcase: [categoryShowcaseItemSchema],
  
  // For About Page
  story: String,
  mission: String,
  vision: String,
  
  // For Careers Page
  jobOpenings: [{
    id: String,
    title: String,
    location: String,
    department: String,
    description: String,
    requirements: [String],
    salary: String,
    isActive: { type: Boolean, default: true },
  }],
  
  // For Press Page
  features: [{
    id: String,
    publication: String,
    title: String,
    date: Date,
    link: String,
    image: String,
  }],
  
  // For FAQ Page
  faqs: [{
    id: String,
    question: String,
    answer: String,
    category: String,
  }],
  
  // For Policy Pages (Privacy, Terms, Shipping, Returns)
  sections: [{
    id: String,
    title: String,
    content: String,
    order: Number,
  }],
  
  // General
  metaTitle: String,
  metaDescription: String,
  isPublished: { type: Boolean, default: true },
}, {
  timestamps: true,
});

pageContentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const PageContent = mongoose.model('PageContent', pageContentSchema);

module.exports = PageContent;
