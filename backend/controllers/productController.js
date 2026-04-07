const Product = require("../models/Product.js");
const {
  cloudinary,
  isCloudinaryConfigured,
} = require("../config/cloudinary.js");

// Initial Product Data for Seeding
const INITIAL_PRODUCTS = [];

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    // Clean up legacy demo products that were seeded in earlier builds.
    await Product.deleteMany({
      $or: [
        {
          imageUrls: {
            $elemMatch: { $regex: "picsum\\.photos/", $options: "i" },
          },
        },
        {
          imageUrls: { $elemMatch: { $regex: "^data:image/", $options: "i" } },
        },
        {
          name: {
            $in: [
              "Classic Wool Trench Coat",
              "Silk Slip Dress",
              "Cashmere Crewneck Sweater",
              "High-Waisted Trousers",
              "Tailored Single-Button Blazer",
              "Structured Leather Tote",
              "Linen Button-Up Shirt",
              "Slim-Fit Chinos",
              "Crewneck Sweater",
              "Baseball Cap",
              "Performance Jersey",
              "Training Shorts",
              "Active Leggings",
            ],
          },
        },
      ],
    });

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
      res.status(404).json({ message: "Product not found" });
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
    const { name, price, description, category, subCategory, imageUrls } =
      req.body;

    if (
      !name ||
      !price ||
      !category ||
      !subCategory ||
      !imageUrls ||
      imageUrls.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
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
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
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
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
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
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
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
      return res.status(404).json({ message: "Product not found" });
    }

    if (size && color && product.variants) {
      const variant = product.variants.find(
        (v) => v.size === size && v.color === color,
      );
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

// @desc    Upload product image to Cloudinary
// @route   POST /api/products/upload-image
// @access  Private/Admin
const uploadProductImage = async (req, res) => {
  try {
    if (!isCloudinaryConfigured) {
      return res.status(500).json({
        message:
          "Cloudinary is not configured. Please set CLOUDINARY_* environment variables.",
      });
    }

    const { image } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({ message: "Image data is required." });
    }

    if (!image.startsWith("data:image/")) {
      return res.status(400).json({
        message: "Invalid image format. Please upload a valid image file.",
      });
    }

    // Prevent oversized base64 payloads from hitting Cloudinary and failing as 500.
    if (image.length > 12 * 1024 * 1024) {
      return res.status(413).json({
        message: "Image is too large. Please upload an image smaller than 8MB.",
      });
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "ezooze/products",
      resource_type: "image",
    });

    return res.status(201).json({
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    const message =
      (error && error.message) || "Failed to upload image to Cloudinary.";
    const lower = message.toLowerCase();

    if (
      lower.includes("invalid api") ||
      lower.includes("invalid signature") ||
      lower.includes("authentication") ||
      lower.includes("api_key")
    ) {
      return res.status(500).json({
        message:
          "Cloudinary credentials are invalid. Please verify CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      });
    }

    if (lower.includes("file size too large") || lower.includes("too large")) {
      return res.status(413).json({
        message: "Image is too large. Please upload a smaller image.",
      });
    }

    console.error("Cloudinary upload error:", message);
    return res.status(500).json({
      message,
    });
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
  uploadProductImage,
};
