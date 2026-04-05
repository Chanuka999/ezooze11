
const express = require('express');
const Stripe = require('stripe');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Initialize Stripe with the secret key from .env
// Make sure STRIPE_SECRET_KEY is set in your server/.env file
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// @desc    Create Payment Intent
// @route   POST /api/payments/create-intent
// @access  Private
router.post('/create-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
        // In production, you might log this error internally but not expose it
        console.warn("Stripe Secret Key is missing in server/.env");
        // For now, we can't proceed without a key
        throw new Error("Payment system configuration error.");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in smallest currency unit (e.g., cents)
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
