// Validation middleware
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateProductData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Product name is required');
  }

  if (!data.price || data.price < 0) {
    errors.push('Valid price is required');
  }

  if (!data.category || !['men', 'women', 'unisex', 'sportswear'].includes(data.category)) {
    errors.push('Valid category is required');
  }

  if (!data.subCategory || data.subCategory.trim() === '') {
    errors.push('Sub-category is required');
  }

  if (!Array.isArray(data.imageUrls) || data.imageUrls.length === 0) {
    errors.push('At least one product image is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateOrderData = (data) => {
  const errors = [];

  if (!data.customerName || data.customerName.trim() === '') {
    errors.push('Customer name is required');
  }

  if (!data.customerEmail || !validateEmail(data.customerEmail)) {
    errors.push('Valid customer email is required');
  }

  if (!data.shippingAddress) {
    errors.push('Shipping address is required');
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = { validateEmail, validatePassword, validateProductData, validateOrderData };
