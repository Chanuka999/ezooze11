
const Product = require('../models/Product.js');

// Initial Product Data for Seeding
const INITIAL_PRODUCTS = [
  // Women
  { 
      name: 'Classic Wool Trench Coat', 
      price: 75000, 
      discountPrice: 68500, 
      description: 'A timeless trench coat made from premium Italian wool. Perfect for any occasion.', 
      category: 'women', 
      subCategory: 'coats', 
      imageUrls: ['https://picsum.photos/seed/p1/800/1000', 'https://picsum.photos/seed/p1-2/800/1000', 'https://picsum.photos/seed/p1-3/800/1000'], 
      sizes: ['S', 'M', 'L'], 
      colors: ['Beige', 'Black'], 
      material: 'Wool', 
      featured: true, 
      stock: 15,
      variants: [
          { size: 'S', color: 'Beige', stock: 5 },
          { size: 'M', color: 'Beige', stock: 0 },
          { size: 'L', color: 'Beige', stock: 3 },
          { size: 'S', color: 'Black', stock: 2 },
          { size: 'M', color: 'Black', stock: 5 },
          { size: 'L', color: 'Black', stock: 0 }
      ]
  },
  { name: 'Silk Slip Dress', price: 54000, description: 'An elegant slip dress crafted from pure mulberry silk, with a flattering bias cut.', category: 'women', subCategory: 'dresses', imageUrls: ['https://picsum.photos/seed/p3/800/1000', 'https://picsum.photos/seed/p3-2/800/1000'], sizes: ['XS', 'S', 'M'], colors: ['Champagne', 'Navy'], material: 'Silk', featured: true, stock: 8 },
  { name: 'Cashmere Crewneck Sweater', price: 66000, discountPrice: 59000, description: 'Incredibly soft and warm, this 100% cashmere sweater is a wardrobe staple.', category: 'women', subCategory: 'sweaters', imageUrls: ['https://picsum.photos/seed/p5/800/1000'], sizes: ['S', 'M', 'L'], colors: ['HeatherGray', 'Camel'], material: 'Cashmere', featured: false, stock: 25 },
  { name: 'High-Waisted Trousers', price: 45000, description: 'Tailored trousers with a high waist and wide leg for a sophisticated silhouette.', category: 'women', subCategory: 'pants', imageUrls: ['https://picsum.photos/seed/p7/800/1000'], sizes: ['2', '4', '6', '8'], colors: ['Black', 'Cream'], material: 'Wool Blend', featured: false, stock: 4 },
  { name: 'Tailored Single-Button Blazer', price: 84000, description: 'A sharp, single-button blazer in a virgin wool blend, perfect for power dressing.', category: 'women', subCategory: 'blazers', imageUrls: ['https://picsum.photos/seed/p9/800/1000'], sizes: ['2', '4', '6', '8'], colors: ['Navy', 'White'], material: 'Virgin Wool', featured: true, stock: 12 },
  { name: 'Structured Leather Tote', price: 105000, description: 'A spacious and elegant tote bag crafted from Italian pebbled leather, with room for all your essentials.', category: 'women', subCategory: 'accessories', imageUrls: ['https://picsum.photos/seed/p11/800/1000'], sizes: ['One Size'], colors: ['Black', 'Cognac'], material: 'Leather', featured: false, stock: 0 },
  { name: 'Women\'s Cotton T-Shirt', price: 13500, description: 'A classic cotton t-shirt for everyday wear.', category: 'women', subCategory: 't-shirts', imageUrls: ['https://picsum.photos/seed/p13/800/1000'], sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Black', 'Pink'], material: 'Cotton', featured: false, stock: 50 },
  { name: 'Ribbed Crop Top', price: 16500, description: 'A trendy ribbed crop top.', category: 'women', subCategory: 'crop-tops', imageUrls: ['https://picsum.photos/seed/p14/800/1000'], sizes: ['XS', 'S', 'M'], colors: ['White', 'Black'], material: 'Cotton', featured: false, stock: 30 },
  { name: 'A-Line Denim Skirt', price: 25500, description: 'A versatile A-line denim skirt.', category: 'women', subCategory: 'skirts', imageUrls: ['https://picsum.photos/seed/p15/800/1000'], sizes: ['2', '4', '6', '8'], colors: ['Blue', 'Black'], material: 'Denim', featured: false, stock: 22 },
  
  // Men
  { name: 'Linen Button-Up Shirt', price: 28500, description: 'Lightweight and breathable, this linen shirt is a summer essential.', category: 'men', subCategory: 'shirts', imageUrls: ['https://picsum.photos/seed/p2/800/1000', 'https://picsum.photos/seed/p2-2/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'SkyBlue'], material: 'Linen', featured: true, stock: 18 },
  { name: 'Slim-Fit Chinos', price: 33000, discountPrice: 29500, description: 'Versatile chinos with a modern slim fit, made from comfortable stretch cotton.', category: 'men', subCategory: 'pants', imageUrls: ['https://picsum.photos/seed/p4/800/1000'], sizes: ['30', '32', '34', '36'], colors: ['Khaki', 'Olive'], material: 'Cotton', featured: true, stock: 2 },
  { name: 'Leather Derby Shoes', price: 90000, description: 'Handcrafted from full-grain leather, these Derby shoes offer classic style and durability.', category: 'men', subCategory: 'shoes', imageUrls: ['https://picsum.photos/seed/p6/800/1000'], sizes: ['9', '10', '11', '12'], colors: ['Brown', 'Black'], material: 'Leather', featured: false, stock: 10 },
  { name: 'Denim Work Jacket', price: 52500, description: 'A rugged yet refined work jacket made from premium Japanese selvedge denim.', category: 'men', subCategory: 'jackets', imageUrls: ['https://picsum.photos/seed/p8/800/1000'], sizes: ['M', 'L', 'XL'], colors: ['Indigo'], material: 'Denim', featured: false, stock: 7 },
  { name: 'Merino Wool Socks', price: 10500, description: 'Keep your feet comfortable and dry with these premium merino wool dress socks.', category: 'men', subCategory: 'accessories', imageUrls: ['https://picsum.photos/seed/p10/800/1000'], sizes: ['One Size'], colors: ['Charcoal', 'Burgundy'], material: 'Merino Wool', featured: false, stock: 40 },
  { name: 'The Minimalist Watch', price: 64500, description: 'A classic timepiece with a clean, minimalist dial and a genuine leather strap.', category: 'men', subCategory: 'accessories', imageUrls: ['https://picsum.photos/seed/p12/800/1000'], sizes: ['40mm'], colors: ['Silver', 'Gold'], material: 'Leather', featured: false, stock: 9 },
  { name: 'Men\'s Graphic T-Shirt', price: 15000, description: 'A soft graphic t-shirt.', category: 'men', subCategory: 't-shirts', imageUrls: ['https://picsum.photos/seed/p16/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White'], material: 'Cotton', featured: false, stock: 60 },
  { name: 'Classic Polo Shirt', price: 22500, description: 'A timeless polo shirt for a smart-casual look.', category: 'men', subCategory: 'polo-shirts', imageUrls: ['https://picsum.photos/seed/p17/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Navy', 'White', 'Red'], material: 'Cotton', featured: true, stock: 0 },
  { name: 'Cargo Shorts', price: 19500, description: 'Comfortable and practical cargo shorts.', category: 'men', subCategory: 'shorts', imageUrls: ['https://picsum.photos/seed/p18/800/1000'], sizes: ['30', '32', '34', '36'], colors: ['Khaki', 'Green'], material: 'Cotton', featured: false, stock: 25 },

  // Unisex
  { name: 'Classic Hoodie', price: 36000, description: 'A comfortable and stylish hoodie.', category: 'unisex', subCategory: 'hoodies', imageUrls: ['https://picsum.photos/seed/p19/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Gray', 'Navy'], material: 'Cotton', featured: false, stock: 15 },
  { name: 'Crewneck Sweater', price: 33000, description: 'A cozy crewneck sweater.', category: 'unisex', subCategory: 'sweaters', imageUrls: ['https://picsum.photos/seed/p20/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Gray', 'Black', 'Green'], material: 'Cotton', featured: false, stock: 18 },
  { name: 'Baseball Cap', price: 12000, discountPrice: 9500, description: 'A classic baseball cap.', category: 'unisex', subCategory: 'accessories', imageUrls: ['https://picsum.photos/seed/p21/800/1000'], sizes: ['One Size'], colors: ['Black', 'White', 'Blue'], material: 'Cotton', featured: true, stock: 35 },
  
  // Sportswear
  { name: 'Performance Jersey', price: 27000, description: 'A breathable performance jersey for your workout.', category: 'sportswear', subCategory: 'jerseys', imageUrls: ['https://picsum.photos/seed/p22/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Red', 'Blue', 'Black'], material: 'Polyester', featured: true, stock: 20 },
  { name: 'Training Shorts', price: 18000, description: 'Lightweight shorts for training.', category: 'sportswear', subCategory: 'practice-wear', imageUrls: ['https://picsum.photos/seed/p23/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Gray'], material: 'Polyester', featured: false, stock: 30 },
  { name: 'Active Leggings', price: 24000, description: 'Supportive and flexible leggings for any activity.', category: 'sportswear', subCategory: 'active-bottoms', imageUrls: ['https://picsum.photos/seed/p24/800/1000'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Purple'], material: 'Polyester', featured: false, stock: 3 },
];

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments({});
    
    // Auto-seed if database is empty
    if (count === 0) {
        console.log('Database empty. Seeding initial products...');
        await Product.insertMany(INITIAL_PRODUCTS);
        console.log('Seeding complete.');
    }

    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, subCategory, imageUrls } = req.body;

    if (!name || !price || !category || !subCategory || !imageUrls || imageUrls.length === 0) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { subCategory } = req.query;

    let query = { category };
    if (subCategory) {
      query.subCategory = subCategory;
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured/true
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(12);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice } = req.query;

    let filter = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
const updateProductStock = async (req, res) => {
  try {
    const { quantity, size, color } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (size && color && product.variants) {
      const variant = product.variants.find(v => v.size === size && v.color === color);
      if (variant) {
        variant.stock += quantity;
      }
    } else {
      product.stock += quantity;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  updateProductStock,
};
