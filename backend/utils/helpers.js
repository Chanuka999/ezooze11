const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const generateRandomCode = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

const calculateDiscount = (price, discountPrice) => {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round((1 - discountPrice / price) * 100);
};

const formatCurrency = (amount, currency = 'LKR') => {
  const currencySymbols = {
    LKR: 'Rs.',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol} ${amount.toFixed(2)}`;
};

module.exports = { generateToken, generateRandomCode, calculateDiscount, formatCurrency };
